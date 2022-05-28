import type { CalendarDayFares } from './Model/CalendarDayFares.js';
import { onError } from './util.js';

export default abstract class LoyaltyProgram {

    constructor(public origin: string, public destination: string, public month: number, public year: number) {
    }

    public _origin: string;
    public _destination: string;
    public _month: number;
    public _year: number;

    fillCalendarFares(fares: CalendarDayFares, date) {
        let totalDays = date.monthDays();
        if (fares.calendarDayList && fares.calendarDayList.length < totalDays) {
            onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
            return;
        }
        for (let day = 1; day <= totalDays; day++) {
            if (fares.calendarDayList[day - 1] && fares.calendarDayList[day - 1].miles) {
                let tdDay = document.getElementById('day' + day);
                // if (tdDay) 
                {
                    let divMiles = tdDay.getElementsByClassName('miles')[0] as HTMLDivElement;
                    let divSmiles = divMiles.getElementsByClassName('smiles')[0] as HTMLDivElement;
                    let spanMiles = divMiles.querySelector('span') as HTMLSpanElement;
                    divSmiles.innerText = `${fares.calendarDayList[day - 1].miles}`;
                    spanMiles.innerText = 'milhas';
                    if (fares.calendarDayList[day - 1].isLowestPrice)
                        divSmiles.classList.add('best-smiles');
                    tdDay.setAttribute(
                        'onclick',
                        `window.open('${this.dailyFareUrl(new Date(date.getFullYear(), date.getMonth(), day))}', 
                        '_blank');`
                    );
                }
            }
        }
    }

    protected abstract dailyFareUrl(urlDate): string;
    protected abstract monthlyFaresUrl(): string;

}