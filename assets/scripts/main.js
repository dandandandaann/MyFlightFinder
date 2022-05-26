import { Smiles } from "./smiles.js";
import "./util.js";

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
ready(Main);

var _origin, _destination, _month, _year, _smiles;

function Main() {
    loadInputValues();

    let selectedDate = new Date(_year, _month - 1);
    generateCalendar(selectedDate);


}

Function.prototype.searchFares = searchFares;

function loadInputValues(orginAirport, destinationAirport, month, year) {
    _origin = orginAirport ?? document.getElementById('originAirportCode').value;
    _destination = destinationAirport ?? document.getElementById('destinationAirportCode').value;
    _month = month ?? document.getElementById('monthInput').value;
    _year = year ?? document.getElementById('yearInput').value;

    let inputError = validateInput();
    if (inputError && inputError.some(e => e)) {
        inputError.map(error => console.warn(error)); // TODO: show error messages in UI
        return false;
    }
    return true;
}

function searchFares(eventArg, orginAirport, destinationAirport, month, year) {

    if (!loadInputValues(orginAirport, destinationAirport, month, year))
    {
        return;
    }

    let isTesting = false;
    if ((document.getElementById('isTesting')?.checked ?? false)
        && ['repo', '127.0.0.1'].some(x => window.location.href.includes(x))) {
        isTesting = true;
        console.warn('Reading from local json file');
    }

    _smiles = new Smiles(_origin, _destination, _month, _year);
    if (isTesting)
        _smiles.searchFares(isTesting);
}

function generateCalendar(selectedDate) {
    // TODO: move this details to somewhere else
    var details = {
        weekDays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        months: ['Janeiro', 'Feveriro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    };

    let monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth()).getDay();
    let calendarTable = document.querySelector('.calendar-table');
    let calendarBody = document.querySelector('.calendar-table>tbody');
    if (calendarBody)
        calendarTable.innerHTML = '';

    let calendarHead = document.createElement('tbody');
    let tr = document.createElement('tr');
    details.weekDays.map(weekDay => {
        let th = document.createElement('th');
        th.innerText = weekDay;
        tr.appendChild(th);
    });
    calendarHead.appendChild(tr);
    calendarTable.appendChild(calendarHead);

    calendarBody = document.createElement('tbody');
    let totalDays = selectedDate.monthDays();

    let day = 1;
    for (let i = 1; i <= 6; i++) {
        if (day > totalDays)
            continue;
        tr = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            let td = document.createElement('td');
            if (day > totalDays) {
                td.innerHTML = '&nbsp;';
            } else {
                if (i === 1 && j < monthStart) {
                    td.innerHTML = '&nbsp;';
                } else {
                    td.innerText = day;
                    td.id = 'day' + day;
                    let divMiles = document.createElement('div');
                    let spanMiles = document.createElement('span');
                    let divSmiles = document.createElement('div');
                    divSmiles.classList.add('smiles');
                    divMiles.classList.add('miles');

                    divMiles.appendChild(divSmiles);
                    divMiles.appendChild(spanMiles);
                    td.appendChild(divMiles);
                    td.classList.add('day');
                    day++;
                }
            }
            tr.appendChild(td);
        }
        calendarBody.appendChild(tr);
    }
    calendarTable.appendChild(calendarBody);
    document.getElementById('month').textContent = details.months[selectedDate.getMonth()];
    document.getElementById('year').textContent = selectedDate.getFullYear();
}

function addMonthArrows(currentDate) {
    document.getElementById('left').onclick = () => {
        if (currentDate.getMonth() === 0)
            currentDate = new Date(currentDate.getFullYear() - 1, 11);
        else
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        searchFares(null, _origin, _destination, currentDate.getMonth() + 1, currentDate.getFullYear());
    };
    document.getElementById('right').onclick = () => {
        if (currentDate.getMonth() === 11)
            currentDate = new Date(currentDate.getFullYear() + 1, 0);
        else
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
        searchFares(null, _origin, _destination, currentDate.getMonth() + 1, currentDate.getFullYear());
    };
}

function validateInput() {
    let errorMessages = [];
    let upperCase = /^[A-Z]+$/;

    if (!_origin || _origin.length != 3 || !upperCase.test(_origin))
        errorMessages.push('Aeroporto de origem não informado corretamente.');
    if (!_destination || _destination.length != 3 || !upperCase.test(_destination))
        errorMessages.push('Aeroporto de origem não informado corretamente.');

    return errorMessages;
}