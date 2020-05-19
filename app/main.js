const {app, BrowserWindow} = require('electron');
const isDev = require('electron-is-dev');
const os = require('os');
const path = require('path');

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
}

/**
 * MainWindow
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 640,
    height: 480,
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

  win.loadURL(isDev ? 'http://localhost:1234' : './dist-body-pix-app/index.html');

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
