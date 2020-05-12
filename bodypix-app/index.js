const bodyPix = require('@tensorflow-models/body-pix');

// TODO: 変更できるようにする
const width = 640;
const height = 480;

/**
 *
 * @return {Promise<unknown>}
 */
async function setupStream() {
  const video = document.getElementById('video');
  video.srcObject = await _getStream();

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.width = width;
      video.height = height;
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
};

async function loadVideo() {
  state.video = await setupStream();
  state.video.play();
}

async function workload() {
  await loadVideo();

  const net = await bodyPix.load(/** optional arguments, see below **/);

  const canvas = document.getElementById('canvas');

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;
  const originalCtx = originalCanvas.getContext('2d');

  async function segmentationFrame() {
    const segmentation = await net.segmentPerson(state.video);

    originalCtx.drawImage(state.video, 0, 0);
    const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    drawToCanvas(canvas, segmentation, imageData);

    requestAnimationFrame(segmentationFrame);
  }
  segmentationFrame();
}

function drawToCanvas(canvas, segmentation, originalImage) {
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const segmentIndex = y * width + x;
      if (segmentation.data[segmentIndex] == 1) {
        pixels[index + 0] = originalImage.data[index + 0];
        pixels[index + 1] = originalImage.data[index + 1];
        pixels[index + 2] = originalImage.data[index + 2];
        pixels[index + 3] = originalImage.data[index + 3];
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

workload();
