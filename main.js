const {app, BrowserWindow} = require('electron');

/**
 * MainWindow
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 1200,
    hasShadow: false,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    fullscreen: false,
  });
  app.dock.hide();
  win.setVisibleOnAllWorkspaces(true);

  win.loadFile('pages/index.html');

  // win.webContents.openDevTools()
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
