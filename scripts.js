
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function () {
    var currentDate = new Date();
    function generateCalendar(d) {
        function monthDays(month, year) {
            var result = [];
            var days = new Date(year, month, 0).getDate();
            for (var i = 1; i <= days; i++) {
                result.push(i);
            }
            return result;
        }
        Date.prototype.monthDays = function () {
            var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
            return d.getDate();
        };
        var details = {
            // totalDays: monthDays(d.getMonth(), d.getFullYear()),
            totalDays: d.monthDays(),
            weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        };
        var start = new Date(d.getFullYear(), d.getMonth()).getDay();
        var calendarBody = document.createElement('tbody');
        var day = 1;
        for (var i = 0; i <= 6; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                var td = document.createElement('td');
                if (i === 0) {
                    td.innerText = details.weekDays[j];
                } else if (day > details.totalDays) {
                    td.innerHTML = '&nbsp;';
                } else {
                    if (i === 1 && j < start) {
                        td.innerHTML = '&nbsp;';
                    } else {
                        td.innerText = day++;
                        td.classList.add('day');
                    }
                }
                tr.appendChild(td);
            }
            calendarBody.appendChild(tr);
        }
        document.querySelector('.calendar-table').appendChild(calendarBody);
        document.querySelector('#month').textContent = details.months[d.getMonth()];
        document.querySelector('#year').textContent = d.getFullYear();
    }
    document.querySelector('#left').addEventListener('click', () => {
        document.querySelector('.calendar-table').innerHTML = '';
        if (currentDate.getMonth() === 0) {
            currentDate = new Date(currentDate.getFullYear() - 1, 11);
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            generateCalendar(currentDate);
        }
    });
    document.querySelector('#right').addEventListener('click', () => {
        document.querySelector('.calendar-table').innerHTML = '';
        if (currentDate.getMonth() === 11) {
            currentDate = new Date(currentDate.getFullYear() + 1, 0);
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            generateCalendar(currentDate);
        }
    });
    generateCalendar(currentDate);
});