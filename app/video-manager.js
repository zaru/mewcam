/**
 * VideoManager class
 */
module.exports = class VideoManager {
  /**
   * constructor
   */
  constructor() {
  }

  /**
   * Get video list
   * @return {Promise<MediaDeviceInfo[]>}
   */
  getVideoList() {
    return navigator.mediaDevices.enumerateDevices().then((info) => {
      return info.filter((device) => {
        return device.kind === 'videoinput';
      });
    });
  }
};
