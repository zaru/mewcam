/**
 * TrayMenu class
 */
module.exports = class TrayMenu {
  /**
   * Constractor
   * @param {Window} window
   */
  constructor(window) {
    this.window = window;

    this._deviceId = '';
    this._videoList = [];

    this.tray = null;
    this.trayMenu = null;
    this.callbackVideoMenu = null;
  }

  /**
   * Set deviceId
   * @param {string} deviceId
   */
  set deviceId(deviceId) {
    this._deviceId = deviceId;
  }
  /**
   * Set video list
   * @param {MediaDeviceInfo[]} videoList
   */
  set videoList(videoList) {
    this._videoList = videoList;
  }

  /**
   * Add event listener to video menu
   * @param {function} callback
   */
  addEventListenerToVideoMenu(callback) {
    this.callbackVideoMenu = callback;
  }

  /**
   * Launch tray menu
   */
  launch() {
    this._buildTrayMenu();
  }

  /**
   * Build video sub menu
   * @return {[]}
   * @private
   */
  _buildVideoSubMenu() {
    const videoMenu = [];
    this._videoList.forEach((device) => {
      videoMenu.push({
        label: device.label,
        click: () => {
          if (this.callbackVideoMenu) {
            this.callbackVideoMenu(device.deviceId);
          }
        },
        type: 'radio',
        checked: this._deviceId === device.deviceId,
      });
    });
    return videoMenu;
  }

  /**
   * Build window size sub menu
   * @return {{checked: boolean, label: string, type: string, click(): void}[]}
   * @private
   */
  _buildSizeSubMenu() {
    const menu = [];
    ['Big', 'Middle', 'Small'].forEach((size) => {
      menu.push({
        label: size,
        click() {
          this.window.ipcRenderer.send('windowResize', size);
        },
        type: 'radio',
        checked: size === 'Middle',
      });
    });
    return menu;
  }

  /**
   * Build video sub menu
   */
  _buildTrayMenu() {
    const remote = this.window.remote;
    const {Tray, Menu} = remote;
    const icon = this.window.os.platform() === 'darwin' ?
      'TrayIconTemplate.png' : 'TrayIconTemplate@2x.png';
    this.tray = new Tray(this.window.__dirname + `/assets/${icon}`);

    const menu = Menu.buildFromTemplate([
      {
        label: 'Select video',
        submenu: this._buildVideoSubMenu(),
      },
      {
        label: 'Select size',
        submenu: this._buildSizeSubMenu(),
      },
    ]);

    this.tray.setContextMenu(menu);
  }
};
