import type { CalendarDayFares } from './Model/CalendarDayFares.js';
import { onError } from './util.js';

export default abstract class LoyaltyProgram {

    constructor(public origin: string, public destination: string, public month: number, public year: number) {
    }

    // TODO: this should belongs to Calendar component
    fillCalendarFares(fares: CalendarDayFares, date) {
        let totalDays = date.monthDays();
        // if (fares.calendarDayList && fares.calendarDayList.length < totalDays) { // TODO: fix this restriction?
        //     onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
        //     return;
        // }
        for (let day = 1; day <= totalDays; day++) {
            if (fares.calendarDayList[day - 1] && fares.calendarDayList[day - 1].miles) {
                let tdDay = document.getElementById('day' + day);
                let divMiles = tdDay.getElementsByClassName('miles')[0] as HTMLDivElement;
                let divSmiles = divMiles.getElementsByClassName('smiles')[0] as HTMLDivElement;
                let spanMiles = divMiles.getElementsByClassName('currency')[0] as HTMLSpanElement;
                let newFare = fares.calendarDayList[day - 1].miles;

                spanMiles.innerText = 'milhas';

                /*if (divSmiles.innerText) {
                    let divToolTip = divMiles.querySelector('.tooltiptext') as HTMLSpanElement;
                    if (!divToolTip) {
                        divToolTip = document.createElement('div');
                        divToolTip.classList.add('tooltiptext');
                        divSmiles.appendChild(divToolTip);
                    }
                    let spanToolTip = document.createElement('span');

                    if (parseInt(divSmiles.innerText) < newFare) {
                        spanToolTip.innerText = divSmiles.innerText;
                        divSmiles.innerText = newFare.toString();
                    }
                    else {
                        spanToolTip.innerText = newFare.toString();
                    }

                    divToolTip.appendChild(spanToolTip);
                    divToolTip.appendChild(document.createElement('br'));
                }
                else */
                {
                    divSmiles.innerText = newFare.toString();
                }

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

    protected abstract dailyFareUrl(urlDate): string;
    protected abstract monthlyFaresUrl(): string;

}