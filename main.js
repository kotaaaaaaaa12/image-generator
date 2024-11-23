const imageAInput = document.getElementById("imageA");
const imageBInput = document.getElementById("imageB");
const progressBar = document.getElementById("progressBar");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");
const generateButton = document.getElementById("generateButton");

let imageA, imageBList = [];

imageAInput.addEventListener("change", handleImageUpload);
imageBInput.addEventListener("change", handleImageUpload);
generateButton.addEventListener("click", generateMosaic);

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
    Array.from(files).forEach((file) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageBList.push(img);
        };
        img.src = e.target.result;
      };
      fileReader.readAsDataURL(file);
    });
  }
}

function generateMosaic() {
  if (!imageA || imageBList.length === 0) {
    alert("画像Aと画像Bを選択してください。");
    return;
  }

  const mosaicSize = 1440;
  canvas.width = mosaicSize;
  canvas.height = mosaicSize;
  const pixelSize = mosaicSize / 16;

  let completed = 0;
  progressBar.value = 0;

  imageBList.forEach((imageB, index) => {
    const offsetX = (index % 16) * pixelSize;
    const offsetY = Math.floor(index / 16) * pixelSize;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = 16;
    tempCanvas.height = 16;

    tempCtx.drawImage(imageB, 0, 0, 16, 16);
    const imgData = tempCtx.getImageData(0, 0, 16, 16);

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const alpha = imgData.data[i + 3];

        if (alpha > 0) {
          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];

          ctx.drawImage(imageA, offsetX + x * pixelSize / 16, offsetY + y * pixelSize / 16, pixelSize / 16, pixelSize / 16);
          ctx.globalCompositeOperation = "source-in";
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha / 255})`;
          ctx.fillRect(offsetX + x * pixelSize / 16, offsetY + y * pixelSize / 16, pixelSize / 16, pixelSize / 16);
          ctx.globalCompositeOperation = "source-over";
        }
      }
    }

    completed++;
    progressBar.value = (completed / imageBList.length) * 100;
  });

  if (progressBar.value === 100) {
    alert("画像の生成が完了しました！");
  }
}
