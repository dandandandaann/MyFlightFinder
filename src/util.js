
export function monthDays(month, year) {
    return new Date(year, month, 0).getDate();
}

Date.prototype.monthDays = function () {
    return monthDays(this.getMonth() + 1, this.getFullYear());
};

export function onError(message, exception, dirObject) {
    if (exception)
        console.error(exception);
    if (dirObject)
        console.dir(dirObject);
    console.log('Error: ' + message);
    alert('Error: ' + message);
}