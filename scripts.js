
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
ready(searchFares);

function searchFares() {
    var currentDate = new Date();

    var origin = document.getElementById('originAirportCode').value;
    var destination = document.getElementById('destinationAirportCode').value;
    var month = document.getElementById('monthInput').value;
    var year = document.getElementById('yearInput').value;

    var url = monthlyFaresUrl(origin, destination, month, year);

    var isLocal = false;
    // if (window.location.href.includes('repo') || window.location.href.includes('127.0.0.1')) {
    //     isLocal = true;
    //     url = './test-result.json';
    //     console.warn('Reading from local json file');
    // }

    fetch(url)
        .then(async r => {
            console.log('Http request ok.');
            result = await r.json();
            if (result.hasCalendar == false || result.calendarStatus != 'ENABLED' || result.calendarSegmentList?.length != 1) {
                console.dir(result);
                onError('Erro ao tentar obter dados da smiles.');
                return;
            }
            console.log('Json parse ok.');

            var monthlyFares = result.calendarSegmentList[0].calendarDayList;
            console.dir(result);

            generateCalendar(currentDate, monthlyFares);
            // addArrows(currentDate);
        })
        .catch(e => onError('Boo...\n' + e));
}

function monthlyFaresUrl(orginAirport, destinationAirport, month, year) {

    var nextMonth = parseInt(month) + 1;
    var nextYear = year;

    if (parseInt(month) > 12) {
        nextMonth = 01;
        nextYear = parseInt(year) + 1;
    }

    const monthlyFareUrl = 'https://api-air-calendar-prd.smiles.com.br/v1/airlines/calendar/month' +
        `?originAirportCode=${orginAirport}&destinationAirportCode=${destinationAirport}` + // airport code
        `&startDate=${year}-${month}-01` +
        `&endDate=${nextYear}-${nextMonth.toLocaleString('pt-BR', { minimumIntegerDigits: 2 })}-01` + // start end date
        `&departureDate=${year}-${month}-01` + // selected date
        '&adults=1&children=0&infants=0&forceCongener=false&cabin=ALL&bestFare=true&memberNumber=';
    return monthlyFareUrl;
}

function onError(message, exception, dirObject) {
    if (exception)
        console.error(exception);
    if (dirObject)
        console.dir(dirObject);
    document.write(`<h1>${message}</h1>`);
}

function generateCalendar(today, fares) {

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

    var start = new Date(today.getFullYear(), today.getMonth()).getDay();
    var calendarBody = document.querySelector('.calendar-table>tbody');
    if (calendarBody)
        document.querySelector('.calendar-table').innerHTML = '';
    calendarBody = document.createElement('tbody');

    var day = 1;
    for (var i = 0; i <= 6; i++) {
        if (day > details.totalDays)
            continue;
        var tr = document.createElement('tr');
        for (var j = 0; j < 7; j++) {
            var td = document.createElement('td');
            if (i === 0) {
                td.innerText = details.weekDays[j];
            } else if (day > details.totalDays) {
                td.innerHTML = '&nbsp;';
            } else {
                if (i === 1 && j < start) {
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
    document.getElementById('left').addEventListener('click', () => {
        document.querySelector('.calendar-table').innerHTML = '';
        if (currentDate.getMonth() === 0) {
            currentDate = new Date(currentDate.getFullYear() - 1, 11);
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            generateCalendar(currentDate);
        }
    });
    document.getElementById('right').addEventListener('click', () => {
        document.querySelector('.calendar-table').innerHTML = '';
        if (currentDate.getMonth() === 11) {
            currentDate = new Date(currentDate.getFullYear() + 1, 0);
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            generateCalendar(currentDate);
        }
    });
}