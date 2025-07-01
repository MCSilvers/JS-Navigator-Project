// preload.js
const os = require('os');
window.getHostname = () => os.hostname();
