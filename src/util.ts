
export function monthDays(month, year): number {
    return new Date(year, month, 0).getDate();
}

declare global {
    interface Date {
        monthDays: () => number;
    }
}
Date.prototype.monthDays = function () {
    return monthDays(this.getMonth() + 1, this.getFullYear());
};

export function onError(message: string, exception?: any, dirObject?: any) {
    if (exception)
        console.error(exception);
    if (dirObject)
        console.dir(dirObject);
    console.log('Error: ' + message);
    alert('Error: ' + message);
}

export let weekDays = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
];
export let monthList = [
    { value: 1, text: "Janeiro" },
    { value: 2, text: "Feveriro" },
    { value: 3, text: "Março" },
    { value: 4, text: "Abril" },
    { value: 5, text: "Maio" },
    { value: 6, text: "Junho" },
    { value: 7, text: "Julho" },
    { value: 8, text: "Agosto" },
    { value: 9, text: "Setembro" },
    { value: 10, text: "Outubro" },
    { value: 11, text: "Novembro" },
    { value: 12, text: "Dezembro" },
];
export let yearList = [2022, 2023, 2024, 2025, 2026, 2027];