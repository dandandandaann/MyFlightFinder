<script lang="ts">
    import { Smiles } from "./smiles.js";
    import { onMount } from "svelte";
    import * as util from "./util";
    import { Program } from "./util";
    import type { CalendarDayFares } from "./Model/CalendarDayFares.js";
import type LoyaltyProgram from "./LoyaltyProgram.js";

    onMount(async () => {
        if (util.isRunningLocally(window.location.href))
            isRunningLocally = true;

        Main();
    });

    export let origin: string;
    export let destination: string;
    export let month: number;
    export let year: number;
    export let isRunningLocally: boolean;
    let currentSelectedDate: Date;

    let smiles: Smiles;

    export function Main() {
        validateInput(true);

        let selectedDate = new Date(year, month);
        generateCalendar(selectedDate);
    }

    export function searchFares(
        eventArg: any,
        originAirport?: string,
        destinationAirport?: string,
        selectedMonth?: number,
        selectedYear?: number
    ) {
        originAirport = originAirport ?? origin;
        destinationAirport = destinationAirport ?? destination;
        selectedMonth = selectedMonth ?? month;
        selectedYear = selectedYear ?? year;

        if (
            currentSelectedDate.getFullYear() != selectedYear ||
            currentSelectedDate.getMonth() != selectedMonth
        )
            generateCalendar(new Date(selectedYear, selectedMonth));

        let isTesting = false;
        if (
            (document.getElementById("isTesting") as HTMLInputElement)
                ?.checked ??
            false
        ) {
            isTesting = true;
            console.warn("Reading from local json file");
        }

        smiles = new Smiles(
            Program.Smiles,
            originAirport,
            destinationAirport,
            selectedMonth,
            selectedYear
        );
        smiles.searchFares(isTesting).then((monthlyFares) => {
            fillCalendarFares(
                monthlyFares,
                new Date(selectedYear, selectedMonth),
                smiles
            );
        });
    }

    function generateCalendar(selectedDate: Date) {
        currentSelectedDate = selectedDate;
        let firstWeekday = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth()
        ).getDay();
        let calendarTable = document.querySelector(".calendar-table");
        let calendarBody = document.querySelector(".calendar-table>tbody");
        if (calendarBody) calendarTable.innerHTML = "";

        let calendarHead = document.createElement("thead");
        let tr = document.createElement("tr");
        util.weekDays.map((weekDay) => {
            let th = document.createElement("th");
            th.innerText = weekDay;
            tr.appendChild(th);
        });
        calendarHead.appendChild(tr);
        calendarTable.appendChild(calendarHead);

        calendarBody = document.createElement("tbody");
        let totalDays = selectedDate.monthDays();

        let day = 1;
        for (let i = 1; i <= 6; i++) {
            if (day > totalDays) continue;
            tr = document.createElement("tr");
            for (let j = 0; j < 7; j++) {
                let td = document.createElement("td");
                if (day > totalDays) {
                    td.innerHTML = "&nbsp;";
                } else {
                    if (i === 1 && j < firstWeekday) {
                        td.innerHTML = "&nbsp;";
                    } else {
                        td.innerText = day.toString();
                        td.id = "day" + day;
                        let divMiles = document.createElement("div");
                        let divSmiles = document.createElement("div");
                        divSmiles.classList.add("smiles");
                        divMiles.classList.add("miles");

                        divMiles.appendChild(divSmiles);
                        td.appendChild(divMiles);
                        td.classList.add("day");
                        day++;
                    }
                }
                tr.appendChild(td);
            }
            calendarBody.appendChild(tr);
        }
        calendarTable.appendChild(calendarBody);
        document.getElementById("month").textContent =
            util.monthList[selectedDate.getMonth()].text;
        document.getElementById("year").textContent = selectedDate
            .getFullYear()
            .toString();
    }

    function addMonthArrows(currentDate) {
        document.getElementById("left").onclick = () => {
            if (currentDate.getMonth() === 0)
                currentDate = new Date(currentDate.getFullYear() - 1, 11);
            else
                currentDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1
                );
            searchFares(
                null,
                origin,
                destination,
                currentDate.getMonth() + 1,
                currentDate.getFullYear()
            );
        };
        document.getElementById("right").onclick = () => {
            if (currentDate.getMonth() === 11)
                currentDate = new Date(currentDate.getFullYear() + 1, 0);
            else
                currentDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1
                );
            searchFares(
                null,
                origin,
                destination,
                currentDate.getMonth() + 1,
                currentDate.getFullYear()
            );
        };
    }

    function validateInput(throwError: boolean) {
        let errorMessages = [];
        let upperCase = /^[A-Z]+$/;

        if (!origin || origin.length != 3 || !upperCase.test(origin))
            errorMessages.push(
                "Aeroporto de origem não informado corretamente."
            );
        if (
            !destination ||
            destination.length != 3 ||
            !upperCase.test(destination)
        )
            errorMessages.push(
                "Aeroporto de origem não informado corretamente."
            );

        if (throwError) {
            if (errorMessages?.some((e) => e)) {
                errorMessages.map((error) => console.warn(error));
                alert(errorMessages.join(" "));
                return false;
            }
        }
        return errorMessages;
    }

    function fillCalendarFares(
        fares: CalendarDayFares,
        currentDate: Date,
        lp: LoyaltyProgram
    ) {
        let totalDays = currentDate.monthDays();
        // if (fares.calendarDayList && fares.calendarDayList.length < totalDays) { // TODO: fix this restriction?
        //     onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
        //     return;
        // }
        for (let day = 1; day <= totalDays; day++) {
            let tdDay = document.getElementById("day" + day);
            let divMiles = tdDay.getElementsByClassName(
                "miles"
            )[0] as HTMLDivElement;
            let divProgram = divMiles.getElementsByClassName(
                lp.program
            )[0] as HTMLDivElement;

            if (
                fares.calendarDayList[day - 1] &&
                fares.calendarDayList[day - 1].miles
            ) {
                let newFare = fares.calendarDayList[day - 1].miles;

                divProgram.innerText = newFare.toString();

                if (fares.calendarDayList[day - 1].isLowestPrice)
                    divProgram.classList.add("best-smiles");

                tdDay.setAttribute(
                    "onclick",
                    `window.open('${lp.dailyFareUrl(
                        new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day
                        )
                    )}', 
                    '_blank');`
                );
            } else {
                divProgram.innerText = "";
            }
        }
    }
</script>

<div>
    <h1 class="calendar-title">
        <a id="left" class="left-arrow">🡨</a>
        <span id="month" />
        <span id="year" />
        <a id="right" class="right-arrow">🡪</a>
    </h1>
</div>
<div class="">
    <div class="">
        <table class="calendar-table" />
    </div>
</div>
