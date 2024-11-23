const imageAInput = document.getElementById("imageA");
const imageBInput = document.getElementById("imageB");
const progressBar = document.getElementById("progressBar");
const generateButton = document.getElementById("generateButton");
const downloadButton = document.getElementById("downloadButton");

let imageA, imageBList = [];
let generatedImages = [];

imageAInput.addEventListener("change", handleImageUpload);
imageBInput.addEventListener("change", handleImageUpload);
generateButton.addEventListener("click", generateMosaic);
downloadButton.addEventListener("click", downloadAll);

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
          const name = file.name.replace(/\.[^/.]+$/, "");
          imageBList.push({ img, name });
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

  progressBar.value = 0;
  generatedImages = [];
  let completed = 0;

  imageBList.forEach((imageBObj, index) => {
    const imageB = imageBObj.img;
    const imageName = imageBObj.name;

    const bCanvas = document.createElement("canvas");
    const bCtx = bCanvas.getContext("2d");
    bCanvas.width = 16;
    bCanvas.height = 16;

    bCtx.drawImage(imageB, 0, 0, 16, 16);
    const imgData = bCtx.getImageData(0, 0, 16, 16);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = 104;
    tempCanvas.height = 104;

    // 変換後の画像を保存するための処理
    const outputCanvas = document.createElement("canvas");
    const outputCtx = outputCanvas.getContext("2d");
    outputCanvas.width = 104;
    outputCanvas.height = 104;

    // 空の画像を生成（透過部分を保つため）
    const emptyCanvas = document.createElement("canvas");
    const emptyCtx = emptyCanvas.getContext("2d");
    emptyCanvas.width = 104;
    emptyCanvas.height = 104;

    // 各ピクセルごとの処理
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const alpha = imgData.data[i + 3];  // アルファ（透過部分）

        // 透過部分はそのままにして、それ以外を処理
        if (alpha > 0) {
          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];

          tempCtx.clearRect(0, 0, 104, 104);
          tempCtx.drawImage(imageA, 0, 0);

          const aData = tempCtx.getImageData(0, 0, 104, 104);
          for (let j = 0; j < aData.data.length; j += 4) {
            aData.data[j] = (aData.data[j] * r) / 255;
            aData.data[j + 1] = (aData.data[j + 1] * g) / 255;
            aData.data[j + 2] = (aData.data[j + 2] * b) / 255;
          }
          tempCtx.putImageData(aData, 0, 0);

          // 透過部分を保持しつつ、画像Aを描画
          emptyCtx.clearRect(0, 0, 104, 104); // 空白で初期化
          emptyCtx.putImageData(aData, 0, 0);
        }
      }
    }

    // 変換後の画像をBase64形式で保存
    const dataURL = emptyCanvas.toDataURL("image/png");

    generatedImages.push({ name: `${imageName}_generated.png`, dataURL });

    completed++;
    progressBar.value = (completed / imageBList.length) * 100;
  });

  if (progressBar.value === 100) {
    alert("画像の生成が完了しました！");
    downloadButton.disabled = false;
  }
}

function downloadAll() {
  const zip = new JSZip();
  const folder = zip.folder("generated_images");

  generatedImages.forEach((image) => {
    const data = image.dataURL.split(",")[1];
    folder.file(image.name, data, { base64: true });
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "generated_images.zip";
    a.click();
  });
}
