const bodyPix = require('@tensorflow-models/body-pix');

const state = {
  video: null,
  videoWidth: 0,
  videoHeight: 0,
  ratio() {
    return this.videoHeight / this.videoWidth;
  },
};

/**
 * Main
 * @return {Promise<void>}
 */
async function workload() {
  _setupResizeGuide();
  await _loadVideo();

  _resizeElement(window.innerWidth, window.innerHeight);

  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.5,
    quantBytes: 2,
  });

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const originalCanvas = document.getElementById('original-canvas');

  async function segmentationFrame() {
    const segmentation = await net.segmentPerson(state.video);

    const originalCtx = originalCanvas.getContext('2d');
    const scale = originalCanvas.width / video.videoWidth;
    originalCtx.setTransform(scale, 0, 0, scale, 0, 0);
    originalCtx.drawImage(state.video, 0, 0);
    const imageData = originalCtx.getImageData(
        0, 0, originalCanvas.width, originalCanvas.height,
    );
    _drawToCanvas(canvas, segmentation, imageData);

    requestAnimationFrame(segmentationFrame);
  }
  segmentationFrame();
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
      audio: false,
      facingMode: 'user',
    },
  };
  return navigator.mediaDevices.getUserMedia(config);
}

/**
 * Load video stream
 * @return {Promise<void>}
 * @private
 */
async function _loadVideo() {
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

workload();
