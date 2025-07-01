const ical = require('ical');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
// DOM target
const eventsList = document.getElementById('events');

// Log file path

const logFile = path.join(__dirname, 'calendar.log');


// Helper: append to log file
function appendLog(line) {
  const timestamp = new Date().toISOString();
  const fullLine = `[${timestamp}] ${line}\n`;
  fs.appendFile(logFile, fullLine, err => {
    if (err) console.error(' Failed to write to log:', err);
  });
}

// Helper: log to console and file
function log(message) {
  console.log(message);
  appendLog(message);
}

// Determine ICS URL from hostname
const hostname = os.hostname();
const hostnameToUrlMap = {
  'gulchnav-20': 'https://outlook.office365.com/owa/calendar/ccbf098dfe694e7ab0043377bd46dce3@tvacloud.onmicrosoft.com/d00fbb675c6847199b163cef04309eda2645765481983974838/calendar.ics',
  'gulchnav-21': 'https://outlook.office365.com/owa/calendar/97e57fb22ee34d138625c400be42ab4f@tvacloud.onmicrosoft.com/05e252e24c10443bb3e9183467cff7fa13968498876892711110/calendar.ics',
  'gulchnav-22': 'https://outlook.office365.com/owa/calendar/b274c99d70234ed3b1b3d169fe100c42@tvacloud.onmicrosoft.com/2080ae4bc9a94c50950f228d001b8c616621876099623775533/calendar.ics', 
  'gulchnav-23': 'https://outlook.office365.com/owa/calendar/4160e7befbaf4b069cca5c7e7be61121@tvacloud.onmicrosoft.com/f35e0043785641ee8dcdc6ea49777fcd9729536541883880676/calendar.ics',
  'gulchnav-24': 'https://outlook.office365.com/owa/calendar/d900d70bd0e24f02bc2c88a40611b187@tvacloud.onmicrosoft.com/acd2a8df51d34a8d9cbbde43a4a0f5a7864230737557210783/calendar.ics',
  'gulchnav-25': 'https://outlook.office365.com/owa/calendar/09c98bfaae8842eba7a4873ec0433df0@tvacloud.onmicrosoft.com/3567e20035544c2698abc444ed2ed6e916433175724485423902/calendar.ics',
  'gulchnav-26': 'https://outlook.office365.com/owa/calendar/588e7baa61434baf81b6770856c3797e@tvacloud.onmicrosoft.com/742e64ab1c4e45e0a42cffa806d92aa36896206625979860895/calendar.ics',
  'gulchnav-27': 'https://outlook.office365.com/owa/calendar/87ca0697c5e143aa8774a84e051aa425@tvacloud.onmicrosoft.com/e6a8b52d331d4db5b8f579c380aa09b615261404765018429805/calendar.ics',
  'gulchnav-28': 'https://outlook.office365.com/owa/calendar/3adf0c7198504d8a81bc0cfd0fb7d9d7@tvacloud.onmicrosoft.com/a276c716af3847bead8b2f7e582cf20617759224915357691503/calendar.ics',
  'gulchnav-29': 'https://outlook.office365.com/owa/calendar/9080ea5bd1834001b0e0acf8f5c30547@tvacloud.onmicrosoft.com/4dbc12584e824479afcc3a88249b76984348319527597092478/calendar.ics',
  'gulchnav-30': 'https://outlook.office365.com/owa/calendar/f0093029946447e0a9cb5d665184207c@tvacloud.onmicrosoft.com/90ad89621a3f43a7bbfd8a08742a2aa01705673817014936012/calendar.ics',
  'gulchnav-31': 'https://outlook.office365.com/owa/calendar/45b4137ece4e44c3b9804af4d3b280a4@tvacloud.onmicrosoft.com/3ff7339b49854ca9bec1f4231bbfba3e12425025843831253110/calendar.ics',
  'gulchnav-32': 'https://outlook.office365.com/owa/calendar/b4acc27bf31b4bc78feea4f1a1808e99@tvacloud.onmicrosoft.com/b02eafab53a242ba8f4f3ca0563890e817187598572443996957/calendar.ics',
  'gulchnav-33': 'https://outlook.office365.com/owa/calendar/906b29a346054c5fbe45f2d6d9902c21@tvacloud.onmicrosoft.com/48ae9a66367a47b1a93904c010172fc76561425194763978250/calendar.ics',
  'gulchnav-34': 'https://outlook.office365.com/owa/calendar/9d0631690e7142e997731236ea4a4865@tvacloud.onmicrosoft.com/0ac7f4b4300a4bb38b356e9b74880ee77953025746017223116/calendar.ics',
  'gulchnav-35': 'https://outlook.office365.com/owa/calendar/db79159c9c6d4505b9351996cb37b94a@tvacloud.onmicrosoft.com/4810319fc66a4654bacf25c42de0c9624205656288542873123/calendar.ics',
  'gulchnav-36': 'https://outlook.office365.com/owa/calendar/6e331676c99b44079e9575d92436caad@tvacloud.onmicrosoft.com/627ec09e5a8c4a7cae485478cd4f494812318218843863020494/calendar.ics',
  'gulchnav-37': 'https://outlook.office365.com/owa/calendar/d948e938e13d47beb92faa62f65ae83d@tvacloud.onmicrosoft.com/c33838235ee9424a89153d23a292262011041193684747398769/calendar.ics',
  'gulchnav-38': 'https://outlook.office365.com/owa/calendar/ca82724faea94628bdf7909de113c247@tvacloud.onmicrosoft.com/8cc33997ff4a4646876ea37ff386b2656446210767523379810/calendar.ics',
  'gulchnav-39': 'https://outlook.office365.com/owa/calendar/fc44f87a96fc46cd94b17fb538322587@tvacloud.onmicrosoft.com/e4ead5cb78fb42eca01a1d594a3baa1e13816051930660848024/calendar.ics',
  'gulchnav-40': 'https://outlook.office365.com/owa/calendar/e11125980c3c403e82482c1e775d3abe@tvacloud.onmicrosoft.com/936d4353b2284ead9f9a38c464e3f64f7343241789169429553/calendar.ics',
  'gulchnav-41': 'https://outlook.office365.com/owa/calendar/cc7a8ad0c60c42c4a2ca78cca746a15e@tvacloud.onmicrosoft.com/7a6dcc36e48741078f68d302736a05cf2495417243403941211/calendar.ics',
  'gulchnav-42': 'https://outlook.office365.com/owa/calendar/d035cbde67c84195b8351e86ff141a57@tvacloud.onmicrosoft.com/31794ebf79f042acbd588e16efe01f596126871730226553744/calendar.ics',
  'gulchnav-43': 'https://outlook.office365.com/owa/calendar/ad7dca44a8e74acda6a965a616708c8a@tvacloud.onmicrosoft.com/7e314604014f412e91d3de4313bbf05615385170361807049553/calendar.ics',
  'gulchnav-44': 'https://outlook.office365.com/owa/calendar/36b5d8a6659342a3b525b66dedb1cf78@tvacloud.onmicrosoft.com/1b95d6c3a3b649ae84ec9e46ee47bf163928232457283237119/calendar.ics',
  'gulchnav-45': 'https://outlook.office365.com/owa/calendar/eb886ab6fc3d4b09b2604f9fb4e4274a@tvacloud.onmicrosoft.com/0df2e156f9294c6f97f8eaa009ac61b614300625258505441694/calendar.ics',
  'gulchnav-46': 'https://outlook.office365.com/owa/calendar/3168a539fb2a4251b97035197b7058d7@tvacloud.onmicrosoft.com/4dd62bca91064cc19bf2ae221583aec71074434864415831463/calendar.ics',
  'gulchnav-47': 'https://outlook.office365.com/owa/calendar/bc1dcab76abb48f0be076dfaaf200341@tvacloud.onmicrosoft.com/aba5c7b120be44f0b8ff8c49b685805915485861298438662435/calendar.ics',
  'gulchnav-48': 'https://outlook.office365.com/owa/calendar/b93ccd379c9a4223b89dfdfd97123f6d@tvacloud.onmicrosoft.com/48f6a5228fd5413dbfcc30bc54d277f816909762531098832172/calendar.ics',
  'gulchnav-49': 'https://outlook.office365.com/owa/calendar/04868ac6837b41929ee7aa2dbca1eb19@tvacloud.onmicrosoft.com/9760bdad0e894c82be50ab4ebad94ffc384684190512683931/calendar.ics',
  'gulchnav-50': 'https://outlook.office365.com/owa/calendar/7f99424439034ec4bf85f189eaa17299@tvacloud.onmicrosoft.com/67e6ea9778224e499e4271d3c9af64d717381169099441376012/calendar.ics',
  'gulchnav-51': 'https://outlook.office365.com/owa/calendar/780d35edbc9141c8b6bf145c4b1011d1@tvacloud.onmicrosoft.com/402f0a7f0f8f4506a04db382d6c3990012907302508815790012/calendar.ics',
  'gulchnav-52': 'https://outlook.office365.com/owa/calendar/d4e5a587d71e4d698c930cad3f2b5e32@tvacloud.onmicrosoft.com/56edd95afa954798a6de11ea0be0f4f414402504736556493409/calendar.ics',
  'gulchnav-53': 'https://outlook.office365.com/owa/calendar/cd961b281a4140c8a73fdfef8268dd7c@tvacloud.onmicrosoft.com/261b8cdbf1db467c8c2ff9973a99dce96890028655394757006/calendar.ics',
  'gulchnav-54': 'https://outlook.office365.com/owa/calendar/b4b0bcfc4cb14c68a77968a674b4a34a@tvacloud.onmicrosoft.com/673d6577bb844c31bed0bab2887c33354432174510172680962/calendar.ics',
  'gulchnav-55': 'https://outlook.office365.com/owa/calendar/64310cd671134f21abc48e13c130bd4e@tvacloud.onmicrosoft.com/99cf16044e324cf9be0df72ee9f3ae4c1458438354468526291/calendar.ics',
  'gulchnav-56': 'https://outlook.office365.com/owa/calendar/233457b409be480c82309103e6af9d77@tvacloud.onmicrosoft.com/07b703ba10e54b29b0d041334e295f418760000073796028359/calendar.ics',
  // add hostnames and ICS files within this block when needed
};


const icsUrl = hostnameToUrlMap[hostname];
if (!icsUrl) {
  const msg = ` No ICS URL configured for hostname: ${hostname}`;
  log(msg);
  eventsList.innerHTML = `<li>${msg}</li>`;
  throw new Error(msg);
}

// Fetch the calendar from the URL
function fetchCalendar() {
  log(`Attempting to fetch calendar from ${icsUrl}`);
  https.get(icsUrl, (res) => {
    log(` HTTP Status: ${res.statusCode}`);
    log(` Headers: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      log(` Received ${data.length} bytes of .ics data`);
      try {
        const events = ical.parseICS(data);
        log(` Parsed ${Object.keys(events).length} calendar items`);

        const upcoming = getUpcomingEvents(events);
        log(` Found ${upcoming.length} upcoming events`);
        displayEvents(upcoming);
      } catch (err) {
        log(` Error parsing calendar: ${err.message}`);
        eventsList.innerHTML = '<li>Error parsing calendar</li>';
      }
    });

  }).on('error', (err) => {
    log(` Error fetching .ics file: ${err.message}`);
    eventsList.innerHTML = '<li>Error fetching calendar data</li>';
  });
}

// Extract upcoming events
function getUpcomingEvents(events) {
  const now = new Date();
  let upcoming = [];

  for (let eventId in events) {
    const event = events[eventId];
    if (
      event.type === 'VEVENT' &&
      event.start instanceof Date &&
      event.start > now &&
      event.summary.toLowerCase().includes('busy') // Only "Busy" events
    ) {
      upcoming.push({
        summary: event.summary,
        start: event.start,
        end: event.end
      });
    }
  }

  // Sort and limit to first 3
  upcoming.sort((a, b) => a.start - b.start);
  return upcoming.slice(0, 3);
}

// Display to DOM
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

    const listItem = document.createElement('li');
    listItem.textContent = `${eventDate} - ${event.summary} at ${eventTime}`;
    eventsList.appendChild(listItem);
  });
}

// Start the calendar fetch cycle
fetchCalendar();
setInterval(fetchCalendar, 5 * 60 * 1000); // every 5 minutes
