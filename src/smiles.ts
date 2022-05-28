import { onError } from "./util.js";
import LoyaltyProgram from './LoyaltyProgram'

export class Smiles extends LoyaltyProgram {

    constructor(origin: string, destination: string, month: number, year: number) {
        super(origin, destination, month, year);
    }
    localResultUrl = './test-result.json';

    public searchFares(isTesting = false): void {
        let url = isTesting ? this.localResultUrl : this.monthlyFaresUrl();

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

                var monthlyFares = result.calendarSegmentList[0];

                this.fillCalendarFares(monthlyFares, selectedDate);

                //addMonthArrows(currentDate);
            })
            .catch(e => onError('Boo...\n' + e, e));
    }

    protected monthlyFaresUrl(): string {
        let nextMonth = this._month + 1;
        let nextYear = this._year;

        if (this._month > 12) {
            nextMonth = 1;
            nextYear = nextYear + 1;
        }

        return;

        let Number = Intl.NumberFormat(
            'pt-BR',
            { minimumIntegerDigits: 2 }
        );

        const monthlyFareUrl = 'https://api-air-calendar-prd.smiles.com.br/v1/airlines/calendar/month' +
            `?originAirportCode=${this._origin}&destinationAirportCode=${this._destination}` + // airport code
            `&startDate=${this._year}-${Number.format(this._month)}-01` +
            `&endDate=${nextYear}-${Number.format(nextMonth)}-01` + // start end date
            `&departureDate=${this._year}-${Number.format(this._month)}-01` + // selected date
            '&adults=1&children=0&infants=0&forceCongener=false&cabin=ALL&bestFare=true&memberNumber=';
        return monthlyFareUrl;
    }

    protected dailyFareUrl(urlDate) {
        const dailyFareUrl = 'https://www.smiles.com.br/emissao-com-milhas?tripType=2&isFlexibleDateChecked=false&cabin=ALL&adults=1&segments=1&children=0&infants=0&searchType=congenere&segments=1' +
            `&originAirport=${this._origin}&destinationAirport=${this._destination}` +
            `&departureDate=${new Date(urlDate).getTime()}`;
        return dailyFareUrl;
    }
}