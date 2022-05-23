
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
ready(searchFares);

var _origin;
var _month;
var _destination;
var _year;

function searchFares(eventArg, orginAirport, destinationAirport, month, year) {
    _origin = orginAirport ?? document.getElementById('originAirportCode').value;
    _destination = destinationAirport ?? document.getElementById('destinationAirportCode').value;
    _month = month ?? document.getElementById('monthInput').value;
    _year = year ?? document.getElementById('yearInput').value;

    var currentDate = new Date(_year, _month - 1);

    var url = monthlyFaresUrl(_origin, _destination, _month, _year);

    let inputError = validateInput();
    if (inputError && inputError.some(e => e)) {
        inputError.map(error => console.warn(error)); // TODO: show error messages in UI
        return;
    }

    var isLocal = document.getElementById('isTesting').checked ?? false;
    if (isLocal && ['repo', '127.0.0.1'].some(x => window.location.href.includes(x))) {
        url = './test-result.json';
        console.warn('Reading from local json file');
    }

    fetch(url)
        .then(async response => {
            console.log('Http request ok.');
            return await response.json()
        })
        .then(result => {
            if (result.hasCalendar == false || result.calendarStatus != 'ENABLED' || result.calendarSegmentList?.length != 1) {
                console.dir(result);
                onError('Erro ao tentar obter dados da smiles.');
                return;
            }
            console.log('Json parse ok.');

            var monthlyFares = result.calendarSegmentList[0].calendarDayList;

            generateCalendar(_origin, _destination, currentDate, monthlyFares);
            addArrows(currentDate);
        })
        .catch(e => onError('Boo...\n' + e));
}

function monthlyFaresUrl(orginAirport, destinationAirport, month, year) {

    month = parseInt(month);
    var nextMonth = month + 1;
    var nextYear = year;

    if (month > 12) {
        nextMonth = 01;
        nextYear = parseInt(year) + 1;
    }
    month = month.toLocaleString('pt-BR', { minimumIntegerDigits: 2 });

    const monthlyFareUrl = 'https://api-air-calendar-prd.smiles.com.br/v1/airlines/calendar/month' +
        `?originAirportCode=${orginAirport}&destinationAirportCode=${destinationAirport}` + // airport code
        `&startDate=${year}-${month}-01` +
        `&endDate=${nextYear}-${nextMonth.toLocaleString('pt-BR', { minimumIntegerDigits: 2 })}-01` + // start end date
        `&departureDate=${year}-${month}-01` + // selected date
        '&adults=1&children=0&infants=0&forceCongener=false&cabin=ALL&bestFare=true&memberNumber=';
    return monthlyFareUrl;
}

function dailyFareUrl(originAirport, destinationAirport, departureDate) {
    const dailyFareUrl = 'https://www.smiles.com.br/emissao-com-milhas?tripType=2&isFlexibleDateChecked=false&cabin=ALL&adults=1&segments=1&children=0&infants=0&searchType=congenere&segments=1' +
        `&originAirport=${originAirport}&destinationAirport=${destinationAirport}` +
        `&departureDate=${new Date(departureDate).getTime()}`;
    return dailyFareUrl;
}

function onError(message, exception, dirObject) {
    if (exception)
        console.error(exception);
    if (dirObject)
        console.dir(dirObject);
    document.write(`<h1>${message}</h1>`);
}

function generateCalendar(origin, destination, today, fares) {

    // TODO: move this details to somewhere else
    var details = {
        totalDays: today.monthDays(),
        weekDays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        months: ['Janeiro', 'Feveriro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    };

    if (fares && fares.length < details.totalDays) {
        onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
        return;
    }

    var monthStart = new Date(today.getFullYear(), today.getMonth()).getDay();
    var calendarBody = document.querySelector('.calendar-table>tbody');
    if (calendarBody)
        document.querySelector('.calendar-table').innerHTML = '';
    calendarBody = document.createElement('tbody');

    var day = 1;
    for (var i = 0; i <= 6; i++) {
        if (day > details.totalDays)
            continue;
        var tr = document.createElement('tr'); // TODO: separate header loop
        for (var j = 0; j < 7; j++) {
            var td = document.createElement('td');
            if (i === 0) {
                td.innerText = details.weekDays[j];
            } else if (day > details.totalDays) {
                td.innerHTML = '&nbsp;';
            } else {
                if (i === 1 && j < monthStart) {
                    td.innerHTML = '&nbsp;';
                } else {
                    td.innerText = day;
                    if (fares && fares[day - 1] && fares[day - 1].miles) {
                        let divMiles = document.createElement('div');
                        divMiles.innerText = `${fares[day - 1].miles} milhas`;
                        divMiles.classList.add('miles');
                        td.appendChild(divMiles);
                    }
                    td.classList.add('day');
                    td.setAttribute('onclick', `window.open('${dailyFareUrl(origin, destination, new Date(today.getFullYear(), today.getMonth(), day))}', '_blank');`);
                    day++;
                }
            }
            tr.appendChild(td);
        }
        calendarBody.appendChild(tr);
    }
    document.querySelector('.calendar-table').appendChild(calendarBody);
    document.getElementById('month').textContent = details.months[today.getMonth()];
    document.getElementById('year').textContent = today.getFullYear();
}

function monthDays(month, year) {
    var result = [];
    var days = new Date(year, month, 0).getDate();
    for (var i = 1; i <= days; i++) {
        result.push(i);
    }
    return result;
}

Date.prototype.monthDays = function () {
    var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return d.getDate();
};

function addArrows(currentDate) {
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