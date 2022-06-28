import { onError, Program } from "./util.js";
import LoyaltyProgram from './LoyaltyProgram'
import type { CalendarDayFares } from "./Model/CalendarDayFares.js";

export class Smiles extends LoyaltyProgram {

    constructor(program: Program, origin: string, destination: string, month: number, year: number) {
        super(program, origin, destination, month, year);
    }
    localResultUrl = './test-result.json';

    public searchFares(isTesting = false) : Promise<CalendarDayFares> {
        let url = isTesting ? this.localResultUrl : this.monthlyFaresUrl();

        return fetch(url)
            .then(async response => {
                console.log('Http request ok.');
                return await response.json()
            })
            .then(result => {
                if (result.hasCalendar == false || result.calendarStatus != 'ENABLED' || result.calendarSegmentList?.length != 1) {
                    console.dir(result);
                    onError('Smiles não retornou corretamente a consulta mensal.');
                    return;
                }
                console.log('Json parse ok.');

                var monthlyFares = result.calendarSegmentList[0];

                return monthlyFares;
                //addMonthArrows(currentDate);
            })
            .catch(e => onError('Boo...\n' + e, e));
    }

    protected monthlyFaresUrl(): string {
        let nextMonth = this.month + 1;
        let nextYear = this.year;

        if (this.month > 12) {
            nextMonth = 1;
            nextYear = nextYear + 1;
        }

        let day = 1;
        let today = new Date();
        if (today > new Date(this.year, this.month))
            day = today.getDate();

        let Number = Intl.NumberFormat(
            'pt-BR',
            { minimumIntegerDigits: 2 }
        );

        const monthlyFareUrl = 'https://api-air-calendar-prd.smiles.com.br/v1/airlines/calendar/month' +
            `?originAirportCode=${this.origin}&destinationAirportCode=${this.destination}` + // airport code
            `&startDate=${this.year}-${Number.format(this.month + 1)}-${Number.format(day)}` + // start date
            `&endDate=${nextYear}-${Number.format(nextMonth + 1)}-01` + // end date
            `&departureDate=${this.year}-${Number.format(this.month + 1)}-${today.monthDays()}` + // selected date
            '&adults=1&children=0&infants=0&forceCongener=false&cabin=ALL&bestFare=true&memberNumber=';
        return monthlyFareUrl;
    }

    public dailyFareUrl(urlDate) {
        const dailyFareUrl = 'https://www.smiles.com.br/emissao-com-milhas?tripType=2&isFlexibleDateChecked=false&cabin=ALL&adults=1&segments=1&children=0&infants=0&searchType=congenere&segments=1' +
            `&originAirport=${this.origin}&destinationAirport=${this.destination}` +
            `&departureDate=${new Date(urlDate).getTime()}`;
        return dailyFareUrl;
    }
}