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

  /**
   * Set deviceId
   * @param {string} key
   */
  setBodyPixModel(key) {
    localStorage.setItem('bodyPixModel', key);
  }

  /**
   * Get deviceId
   * @return {string}
   */
  getBodyPixModel() {
    const key = localStorage.getItem('bodyPixModel') || 'low';
    return this._bodyPixModelList()[key];
  }

  /**
   * BodyPix model list
   * @return {{high: object, low: object}}
   * @private
   */
  _bodyPixModelList() {
    return {
      low: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.5,
        quantBytes: 2,
      },
      high: {
        architecture: 'ResNet50',
        outputStride: 16,
        multiplier: 1.0,
        quantBytes: 4,
      },
    };
  }
};
