import { onError, monthDays } from "./util.js";

export class Smiles {

    constructor(origin, destination, month, year) {
        this.localResultUrl = './test-result.json';
        this._origin = origin;
        this._destination = destination;
        this._month = month;
        this._year = year;
    }

    searchFares(isTesting = false) {
        let url = isTesting ? this.localResultUrl : monthlyFaresUrlSmiles(this._origin, this._destination, this._month, this._year);

        let selectedDate = new Date(this._year, this._month - 1);

        fetch(url)
            .then(async response => {
                console.log('Http request ok.');
                return await response.json()
            })
            .then(result => {
                if (result.hasCalendar == false || result.calendarStatus != 'ENABLED' || result.calendarSegmentList?.length != 1) {
                    console.dir(result);
                    onError('Não foi possível obter dados da smiles.');
                    return;
                }
                console.log('Json parse ok.');

                var monthlyFares = result.calendarSegmentList[0].calendarDayList;

                this.fillCalendarFares(monthlyFares, selectedDate);

                //addMonthArrows(currentDate);
            })
            .catch(e => onError('Boo...\n' + e));
    }

    monthlyFaresUrl(orginAirport, destinationAirport, month, year) {
        month = parseInt(month);
        var nextMonth = month + 1;
        var nextYear = year;

        if (month > 12) {
            nextMonth = 1;
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

    dailyFareUrl(originAirport, destinationAirport, departureDate) {
        const dailyFareUrl = 'https://www.smiles.com.br/emissao-com-milhas?tripType=2&isFlexibleDateChecked=false&cabin=ALL&adults=1&segments=1&children=0&infants=0&searchType=congenere&segments=1' +
            `&originAirport=${originAirport}&destinationAirport=${destinationAirport}` +
            `&departureDate=${new Date(departureDate).getTime()}`;
        return dailyFareUrl;
    }

    fillCalendarFares(fares, date) {
        let totalDays = date.monthDays();
        if (fares && fares.length < totalDays) {
            onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
            return;
        }
        for (let day = 1; day <= totalDays; day++) {
            if (fares && fares[day - 1] && fares[day - 1].miles) {
                let tdDay = document.getElementById('day' + day);
                // if (tdDay) 
                {
                    let divMiles = tdDay.getElementsByClassName('miles')[0];
                    let divSmiles = divMiles.getElementsByClassName('smiles')[0];
                    let spanMiles = divMiles.querySelector('span');
                    divSmiles.innerText = `${fares[day - 1].miles}`;
                    spanMiles.innerText = 'milhas';
                    if (fares[day - 1].isLowestPrice)
                        divSmiles.classList.add('best-smiles');
                    tdDay.setAttribute(
                        'onclick', 
                        `window.open('${this.dailyFareUrl(this._origin, this._destination, new Date(date.getFullYear(), date.getMonth(), day))}', 
                        '_blank');`
                    );

                }
            }
        }
    }
}