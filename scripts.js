let CLIENT_ID = '<636417669223-toj9k2ek2ml7tdg8e685bv9h1s7qf0qb.apps.googleusercontent.com>';
let API_KEY = '<AIzaSyCPhJB2v5TWBIdwMTdr_ERH_wLg_LZf_Kc>';
let CALENDAR_ID = '<d653bef41065058693319bb482c206cc2794d84f25408785e4d1755bcd37d37b@group.calendar.google.com>'; // Specify the calendar ID here
let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
let SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let calendarContainer = document.getElementById('calendar-container');
let calendarHeader = document.getElementById('calendar-header');
let monthYearDisplay = document.getElementById('month-year');
let prevMonthButton = document.getElementById('prev-month');
let nextMonthButton = document.getElementById('next-month');
let calendarBody = document.querySelector('#calendar tbody');

let currentDate = new Date();

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function (error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        renderCalendar(currentDate);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        calendarBody.innerHTML = '';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarBody.innerHTML = '';

    let row = document.createElement('tr');
    for (let i = 0; i < firstDayOfMonth; i++) {
        const cell = document.createElement('td');
        row.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }

        const cell = document.createElement('td');
        cell.textContent = day;
        cell.dataset.date = new Date(year, month, day).toISOString();

        if (isToday(year, month, day)) {
            cell.classList.add('today');
        }

        row.appendChild(cell);
    }

    calendarBody.appendChild(row);

    fetchEvents(year, month);
}

function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function fetchEvents(year, month) {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

    gapi.client.calendar.events.list({
        'calendarId': CALENDAR_ID,
        'timeMin': startDate,
        'timeMax': endDate,
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
    }).then(function (response) {
        const events = response.result.items;

        if (events.length > 0) {
            for (const event of events) {
                const eventDate = new Date(event.start.dateTime || event.start.date);
                const eventDayCell = document.querySelector(`td[data-date="${eventDate.toISOString()}"]`);

                if (eventDayCell) {
                    const eventDiv = document.createElement('div');
                    eventDiv.textContent = event.summary;
                    eventDayCell.appendChild(eventDiv);
                }
            }
        }
    });
}

prevMonthButton.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

document.addEventListener("DOMContentLoaded", handleClientLoad);