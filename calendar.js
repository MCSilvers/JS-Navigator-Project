const ical = require('ical');
const https = require('https');

// Replace with the actual URL of your .ics file
const icsUrl = 'https://outlook.office365.com/owa/calendar/1dd1acc9d7984d849bb307a590d71815@tva.gov/c32b555949a544c68eca92b9ccb3214115895975242393471215/calendar.ics';

function fetchCalendar() {
  https.get(icsUrl, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const events = ical.parseICS(data);
      const upcomingEvents = getUpcomingEvents(events);

      displayEvents(upcomingEvents);
    });
  }).on('error', (err) => {
    console.error('Error fetching .ics file:', err);
  });
}

function getUpcomingEvents(events) {
  const now = new Date();
  let upcoming = [];

  for (let eventId in events) {
    const event = events[eventId];

    if (event.type === 'VEVENT' && event.start > now && event.summary == 'Busy') {
      upcoming.push({
        summary: event.summary,
        start: event.start,
        end: event.end,
      });
    }
   
  }

  // Sort events by start date
  upcoming.sort((a, b) => a.start - b.start);

  // Return the first 3 upcoming events
  return upcoming.slice(0, 3);

}

function displayEvents(events) {
  const eventsList = document.getElementById('events');
  eventsList.innerHTML = ''; // Clear the previous events

  events.forEach(event => {
    const listItem = document.createElement('li');
    const eventDate = new Date(event.start).toLocaleDateString();
    const eventTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eventEnd = new Date (event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    listItem.textContent = `${event.summary} at ${eventTime} until ${eventEnd}`;
    eventsList.appendChild(listItem);
  });
}


/*troubleshooting
function printEventsToTerminal(eventsList){
    console.log(eventsList);
    eventList.forEach(event => {
        const eventDate = new Date(event.start).toLocaleDateString();
        const eventTime = new Date(event.start).toLocaleTimeString();
    
        // Print to terminal
        console.log(`${eventDate} - ${event.summary} at ${eventTime} until ${eventEnd}`);
      });
}
*/


// Fetch the calendar when the app starts and refresh every 5 minutes
fetchCalendar();
setInterval(fetchCalendar, 5 * 60 * 1000); // 5 minutes
