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
   * Set quality
   * @param {string} key
   */
  setBodyPixModel(key) {
    localStorage.setItem('bodyPixModel', key);
  }

  /**
   * Get quality
   * @return {string}
   */
  getBodyPixModel() {
    return localStorage.getItem('bodyPixModel') || 'Middle';
  }

  /**
   * Get BodyPix model param
   * @return {string}
   */
  getBodyPixModelParam() {
    const key = this.getBodyPixModel();
    return this._bodyPixModelList()[key];
  }

  /**
   * BodyPix model list
   * @return {{high: object, low: object}}
   * @private
   */
  _bodyPixModelList() {
    return {
      Low: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      },
      Middle: {
        architecture: 'MobileNetV1',
        outputStride: 8,
        multiplier: 1.0,
        quantBytes: 4,
      },
      High: {
        architecture: 'ResNet50',
        outputStride: 16,
        multiplier: 1.0,
        quantBytes: 4,
      },
    };
  }
};
