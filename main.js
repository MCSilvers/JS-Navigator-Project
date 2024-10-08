const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        fullscreen: true, 
        webPreferences:{
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('main.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () => {
    if(mainWindow == null) {
        createWindow();
    }
})