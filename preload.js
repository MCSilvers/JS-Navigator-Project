// preload.js
const os = require('os');
const fs = require('fs');
// Expose the hostname
window.getHostname = () => os.hostname();

// Expose the log appending function
window.appendLog = (message) => {
  const logPath = path.join(__dirname, 'calendar.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, logMessage, 'utf8');
};
