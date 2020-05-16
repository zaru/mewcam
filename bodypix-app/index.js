const bodyPix = require('@tensorflow-models/body-pix');

/**
 *
 * @return {Promise<unknown>}
 */
async function setupStream() {
  const video = document.getElementById('video');
  video.srcObject = await _getStream();

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

function _getStream() {
  const config = {
    video: {
      audio: false,
      facingMode: 'user',
    },
  };
  return navigator.mediaDevices.getUserMedia(config);
}

const state = {
  video: null,
  videoWidth: 0,
  videoHeight: 0,
  ratio() {
    return this.videoHeight / this.videoWidth;
  },
};

async function loadVideo() {
  state.video = await setupStream();
  state.videoWidth = state.video.videoWidth;
  state.videoHeight = state.video.videoHeight;
  state.video.play();
}

async function workload() {
  setupResizeGuide();
  await loadVideo();

  const net = await bodyPix.load(/** optional arguments, see below **/);
  resizeElement(window.innerWidth, window.innerHeight);


  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const originalCanvas = document.getElementById('original-canvas');

  async function segmentationFrame() {
    const segmentation = await net.segmentPerson(state.video);

    const originalCtx = originalCanvas.getContext('2d');
    const scale = originalCanvas.width / video.videoWidth;
    originalCtx.setTransform(scale, 0, 0, scale, 0, 0);
    originalCtx.drawImage(state.video, 0, 0);
    const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    drawToCanvas(canvas, segmentation, imageData);

    requestAnimationFrame(segmentationFrame);
  }
  segmentationFrame();
}

function drawToCanvas(canvas, segmentation, originalImage) {
  const ctx = canvas.getContext('2d');
  const width = parseInt(canvas.width);
  const height = parseInt(canvas.height);
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

function resizeElement(width = 640, height = 480) {
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

function setupResizeGuide() {
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
  resizeElement(width, height);

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
