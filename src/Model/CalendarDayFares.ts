export class CalendarDayFares
{
    calendarDayList: DayFare[];
}

export class DayFare{
    date: Date;
    isLowestPrice?: boolean;
    miles?: number;
    fare?: {
        type: string;
    };
}