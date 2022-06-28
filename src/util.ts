
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

export function isRunningLocally(href: string) : boolean {
    return ["localhost", "127.0.0.1"].some((x) => href.includes(x));
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
    { value: 0, text: "Janeiro" },
    { value: 1, text: "Feveriro" },
    { value: 2, text: "Março" },
    { value: 3, text: "Abril" },
    { value: 4, text: "Maio" },
    { value: 5, text: "Junho" },
    { value: 6, text: "Julho" },
    { value: 7, text: "Agosto" },
    { value: 8, text: "Setembro" },
    { value: 9, text: "Outubro" },
    { value: 10, text: "Novembro" },
    { value: 11, text: "Dezembro" },
];
export let yearList = [2022, 2023, 2024, 2025, 2026, 2027];

export enum Program {
    Smiles = "smiles"
}