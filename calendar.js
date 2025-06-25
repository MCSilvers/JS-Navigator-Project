const ical = require('ical');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Resolve the path to the URL config file
const icsUrlPath = path.join(__dirname, 'icsurl.txt');

let icsUrl;

try {
  icsUrl = fs.readFileSync(icsUrlPath, 'utf-8').trim();
  console.log(`[CONFIG] 📂 Loaded ICS URL from calendar_url.txt: ${icsUrl}`);
} catch (err) {
  console.error(`❌ Failed to read ICS URL from file: ${err.message}`);
  icsUrl = ''; // fallback or force a failure
}


const eventsList = document.getElementById('events');

// Optional: log to a local file
function appendLog(line) {
  const timestamp = new Date().toISOString();
  const fullLine = `[${timestamp}] ${line}\n`;
  fs.appendFile('calendar.log', fullLine, err => {
    if (err) console.error('Failed to write log:', err);
  });
}

// Log to both console and file
function log(message) {
  console.log(message);
  appendLog(message);
}

function fetchCalendar() {
  log(`🔄 Attempting to fetch calendar from ${icsUrl}`);
  https.get(icsUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'text/calendar, text/plain, */*',
    'Connection': 'keep-alive'
  }
}, (res) => {
    log(`🌐 HTTP Status: ${res.statusCode}`);
    log(`📎 Headers: ${JSON.stringify(res.headers)}`);

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      log(`📦 Received ${data.length} bytes of .ics data`);
      try {
        const events = ical.parseICS(data);
        const parsedCount = Object.keys(events).length;
        log(`📅 Parsed ${parsedCount} calendar items`);

        const upcoming = getUpcomingEvents(events);
        log(`📌 Found ${upcoming.length} upcoming events`);
        displayEvents(upcoming);
      } catch (err) {
        log(`❌ Error parsing calendar: ${err.message}`);
        console.error(err);
        eventsList.innerHTML = '<li>Error parsing calendar</li>';
      }
    });

  }).on('error', (err) => {
    log(`❌ Error fetching .ics file: ${err.message}`);
    console.error(err);
    eventsList.innerHTML = '<li>Error fetching calendar data</li>';
  });
}

function getUpcomingEvents(events) {
  const now = new Date();
  let upcoming = [];

  for (let eventId in events) {
    const event = events[eventId];
    if (event.type === 'VEVENT' && event.start instanceof Date && event.start > now) {
      upcoming.push({
        summary: event.summary,
        start: event.start,
        end: event.end,
      });
    }
  }

  upcoming.sort((a, b) => a.start - b.start);
  return upcoming.slice(0, 3);
}

function displayEvents(events) {
  eventsList.innerHTML = '';

  if (events.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No upcoming events.';
    eventsList.appendChild(li);
    return;
  }

  events.forEach(event => {
    const eventDate = new Date(event.start).toLocaleDateString([], {
      month: 'numeric',
      day: 'numeric'
    });

    const eventTime = new Date(event.start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const eventEnd = new Date (event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, });

    const listItem = document.createElement('li');
    listItem.textContent = `${eventDate} - ${event.summary} at ${eventTime}  until ${eventEnd}`;
    eventsList.appendChild(listItem);
  });
}

// Initial fetch + refresh every 5 minutes
fetchCalendar();
setInterval(fetchCalendar, 5 * 60 * 1000);
