const {app, BrowserWindow, ipcMain} = require('electron');
const isDev = require('electron-is-dev');
const os = require('os');
const path = require('path');
require('./auto-update');

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
}


/**
 * @type {BrowserWindow}
 */
let win = null;

/**
 * MainWindow
 */
function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 240,
    hasShadow: false,
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, '/preload.js'),
    },
  });

  const osName = os.platform();
  // MagickCode
  if (osName === 'darwin') {
    app.dock.hide();
    win.setAlwaysOnTop(true, 'floating');
    win.setVisibleOnAllWorkspaces(true);
    win.setFullScreenable(false);
    app.dock.show();
  } else if (osName === 'win32' || osName === 'cygwin') {
    win.setAlwaysOnTop(true);
  }

  win.addListener('resize', () => {
    win.setOpacity(0.5);
    setTimeout(() => {
      win.setOpacity(1.0);
    }, 250);
  });

  win.loadURL(isDev ? 'http://localhost:1234' : `file://${__dirname}/../dist-bodypix-app/index.html`);

  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('windowResize', (event, arg) => {
  let size = [320, 240];
  if (arg === 'Small') {
    size = [160, 120];
  } else if (arg === 'Big') {
    size = [640, 480];
  }
  win.setSize(...size);
});
