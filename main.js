const imageAInput = document.getElementById("imageA");
const imageBInput = document.getElementById("imageB");
const progressBar = document.getElementById("progressBar");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");

imageAInput.addEventListener("change", handleImageUpload);
imageBInput.addEventListener("change", handleImageUpload);

let imageA, imageBList = [];

function handleImageUpload(event) {
  const files = event.target.files;
  if (event.target.id === "imageA") {
    if (files.length > 0) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageA = img;
        };
        img.src = e.target.result;
      };
      fileReader.readAsDataURL(files[0]);
    }
  } else if (event.target.id === "imageB") {
    imageBList = [];
    Array.from(files).forEach((file, index) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageBList.push(img);
          if (imageBList.length === files.length) {
            generateMosaic();
          }
        };
        img.src = e.target.result;
      };
      fileReader.readAsDataURL(file);
    });
  }
}

function generateMosaic() {
  if (!imageA || imageBList.length === 0) return;

  const mosaicSize = 1440;
  canvas.width = mosaicSize;
  canvas.height = mosaicSize;
  const pixelSize = mosaicSize / 16;

  let completed = 0;
  imageBList.forEach((imageB, index) => {
    const offsetX = (index % 16) * pixelSize;
    const offsetY = Math.floor(index / 16) * pixelSize;

    ctx.drawImage(imageA, offsetX, offsetY, pixelSize, pixelSize);
    applyColorFilter(imageB, offsetX, offsetY, pixelSize);

    completed++;
    progressBar.value = (completed / imageBList.length) * 100;
  });
}

function applyColorFilter(imageB, x, y, size) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = 16;
  tempCanvas.height = 16;
  tempCtx.drawImage(imageB, 0, 0, 16, 16);

  const imgData = tempCtx.getImageData(0, 0, 16, 16).data;
  const avgColor = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < imgData.length; i += 4) {
    avgColor.r += imgData[i];
    avgColor.g += imgData[i + 1];
    avgColor.b += imgData[i + 2];
  }

  const totalPixels = 16 * 16;
  avgColor.r = Math.round(avgColor.r / totalPixels);
  avgColor.g = Math.round(avgColor.g / totalPixels);
  avgColor.b = Math.round(avgColor.b / totalPixels);

  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
  ctx.fillRect(x, y, size, size);
  ctx.globalCompositeOperation = "source-over";
}
