const bodyPix = require('@tensorflow-models/body-pix');
const VideoManager = require('./video-manager');
const Settings = require('./settings');
const settings = new Settings;

const state = {
  deviceId: null,
  video: null,
  videoWidth: 0,
  videoHeight: 0,
  changingVideo: false,
  ratio() {
    return this.videoHeight / this.videoWidth;
  },
};

/**
 * Main
 * @param {string} deviceId
 * @return {Promise<void>}
 */
async function workload(deviceId) {
  _setupResizeGuide();
  await _loadVideo(deviceId);

  _resizeElement(window.innerWidth, window.innerHeight);

  const net = await bodyPix.load(settings.getBodyPixModel());

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const originalCanvas = document.getElementById('original-canvas');

  async function segmentationFrame() {
    if (!state.changingVideo) {
      const segmentation = await net.segmentPerson(state.video);

      const originalCtx = originalCanvas.getContext('2d');
      const scale = originalCanvas.width / video.videoWidth;
      originalCtx.setTransform(scale, 0, 0, scale, 0, 0);
      originalCtx.drawImage(state.video, 0, 0);
      const imageData = originalCtx.getImageData(
          0, 0, originalCanvas.width, originalCanvas.height,
      );
      _drawToCanvas(canvas, segmentation, imageData);
    }

    requestAnimationFrame(segmentationFrame);
  }
  segmentationFrame();
}

/**
 * Switch video
 * @param {string} deviceId
 */
function switchVideo(deviceId) {
  state.changingVideo = true;
  stopExistingVideoCapture();
  _loadVideo(deviceId).then(() => {
    state.changingVideo = false;
  });

  settings.setDeviceId(deviceId);
}

function stopExistingVideoCapture() {
  if (state.video && state.video.srcObject) {
    state.video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    state.video.srcObject = null;
  }
}

/**
 * Set up video stream
 * @return {Promise<void>}
 * @private
 */
async function _setupStream() {
  const video = document.getElementById('video');
  video.srcObject = await _getStream();

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

/**
 * Get video stream
 * @return {Promise<MediaStream>}
 * @private
 */
function _getStream() {
  const config = {
    video: {
      deviceId: state.deviceId,
      audio: false,
      facingMode: 'user',
    },
  };
  return navigator.mediaDevices.getUserMedia(config);
}

/**
 * Load video stream
 * @param {string} deviceId
 * @return {Promise<void>}
 * @private
 */
async function _loadVideo(deviceId) {
  state.deviceId = deviceId;
  state.video = await _setupStream();
  state.videoWidth = state.video.videoWidth;
  state.videoHeight = state.video.videoHeight;
  state.video.play();
}

/**
 * Draw to canvas from body-pix segmentation video
 * @param {HTMLCanvasElement} canvas
 * @param {SemanticPersonSegmentation} segmentation
 * @param {ImageData} originalImage
 * @private
 */
function _drawToCanvas(canvas, segmentation, originalImage) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const segmentIndex = y * width + x;
      if (segmentation.data[segmentIndex] === 1) {
        pixels[index] = originalImage.data[index];
        pixels[index + 1] = originalImage.data[index + 1];
        pixels[index + 2] = originalImage.data[index + 2];
        pixels[index + 3] = originalImage.data[index + 3];
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Resize element
 * @param {Number} width
 * @param {Number} height
 * @private
 */
function _resizeElement(width = 640, height = 480) {
  const borderBox = document.querySelector('.border-box');
  borderBox.style.width = `${width}px`;
  borderBox.style.height = `${height}px`;

  ['canvas', 'original-canvas', 'video'].forEach((id) => {
    const element = document.getElementById(id);

    const windowRatio = height / width;
    if (windowRatio > state.ratio()) {
      element.width = width;
      element.height = width * state.ratio();
    } else {
      element.width = height / state.ratio();
      element.height = height;
    }
  });
}

/**
 * Set up resize guide element
 * @private
 */
function _setupResizeGuide() {
  const wrap = document.querySelector('.wrap');
  const borderBox = document.querySelector('.border-box');
  wrap.addEventListener('mouseover', () => {
    borderBox.style.display = 'block';
  });
  wrap.addEventListener('mouseleave', () => {
    borderBox.style.display = 'none';
  });
}

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  _resizeElement(width, height);

  const borderBox = document.querySelector('.border-box');
  borderBox.style.display = 'block';
  const body = document.querySelector('body');
  body.classList.add('resizing');
  setTimeout(() => {
    body.classList.remove('resizing');
    borderBox.style.display = 'none';
  }, 500);
});

/**
 * Build context menu
 * @param {MediaDeviceInfo[]} videoList
 */
function buildContextMenu(videoList) {
  const remote = window.remote;
  const Menu = remote.Menu;

  const videoMenu = [];
  videoList.forEach((device) => {
    videoMenu.push({
      label: device.label,
      click() {
        switchVideo(device.deviceId);
      },
    });
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'Select Video',
      submenu: videoMenu,
    },
  ]);

  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    menu.popup(remote.getCurrentWindow());
  }, false);
}

function buildTrayMenu(videoList) {
  const remote = window.remote;
  const {Tray, Menu} = remote;
  const trayIcon = new Tray(__dirname + '/assets/TrayIconTemplate.png');

  const videoMenu = [];
  videoList.forEach((device) => {
    videoMenu.push({
      label: device.label,
      click() {
        switchVideo(device.deviceId);
      },
    });
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'Select Video',
      submenu: videoMenu,
    },
  ]);

  trayIcon.setContextMenu(menu);
}

const videoManager = new VideoManager;
videoManager.getVideoList().then((list) => {
  buildContextMenu(list);
  buildTrayMenu(list);

  const deviceId = settings.getDeviceId() || list[0].deviceId;
  workload(deviceId);
});
