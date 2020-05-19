/**
 * Settings class
 */
module.exports = class Settings {
  /**
   * constructor
   */
  constructor() {
  }

  /**
   * Set deviceId
   * @param {string} deviceId
   */
  setDeviceId(deviceId) {
    localStorage.setItem('deviceId', deviceId);
  }

  /**
   * Get deviceId
   * @return {string}
   */
  getDeviceId() {
    return localStorage.getItem('deviceId');
  }
};
