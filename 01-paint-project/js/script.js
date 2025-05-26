const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Tools
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color input");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearBtn = document.querySelector(".clear-canvas");
const saveBtn = document.querySelector(".save-image");
const bgColorPicker = document.querySelector("#bg-color-picker");
const bgImagePicker = document.querySelector("#bg-image-picker");

// Settings
let selectedTool = "brush";
let isDrawing = false;
let brushSize = 5;
let selectedColor = "#000";
let prevMouseX, prevMouseY, snapshot;
let undoStack = [];
let redoStack = [];

window.addEventListener("load", () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Fon rasmi qo'shish
bgImagePicker.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    img.onload = () => {
      // Rasmni canvasga to‘liq yopadigan qilib chizish (cover usuli)
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;
      const x = (canvas.width - imgWidth) / 2;
      const y = (canvas.height - imgHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, imgWidth, imgHeight);
    };
  };
  reader.readAsDataURL(file);
});

// Drawing start
const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Holatni saqlash
  undoStack.push(snapshot); // push old holat
  redoStack = []; // redo ni tozalaymiz, yangi chizma boshlandi
};

// Drawing
const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  let currX = e.offsetX;
  let currY = e.offsetY;
  let width = currX - prevMouseX;
  let height = currY - prevMouseY;

  switch (selectedTool) {
    case "brush":
    case "eraser":
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(currX, currY);
      ctx.stroke();
      break;

    case "rectangle":
      if (fillColor.checked) {
        ctx.fillRect(prevMouseX, prevMouseY, width, height);
      } else {
        ctx.strokeRect(prevMouseX, prevMouseY, width, height);
      }
      break;

    case "circle":
      let radius = Math.sqrt(width ** 2 + height ** 2);
      ctx.beginPath();
      ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
      fillColor.checked ? ctx.fill() : ctx.stroke();
      break;

    case "triangle":
      ctx.beginPath();
      ctx.moveTo(prevMouseX, prevMouseY);
      ctx.lineTo(currX, currY);
      ctx.lineTo(prevMouseX * 2 - currX, currY);
      ctx.closePath();
      fillColor.checked ? ctx.fill() : ctx.stroke();
      break;
  }
};

// Stop draw
const stopDraw = () => {
  isDrawing = false;
};

// Tool tanlash
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".tool.active")?.classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

// Brush size
sizeSlider.addEventListener("change", () => (brushSize = sizeSlider.value));

// Ranglar tanlovi
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".option.selected")?.classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).backgroundColor;
  });
});

colorPicker.addEventListener("input", () => {
  selectedColor = colorPicker.value;
  document.querySelector(".option.selected")?.classList.remove("selected");
});

// Undo
const undo = () => {
  if (undoStack.length > 0) {
    const lastState = undoStack.pop();
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(lastState, 0, 0);
  }
};

// Redo
const redo = () => {
  if (redoStack.length > 0) {
    const nextState = redoStack.pop();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(nextState, 0, 0);
  }
};

// Redo & Undo
document.querySelector(".undo").addEventListener("click", undo);
document.querySelector(".redo").addEventListener("click", redo);

// Tozalash
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff"; // oq fon
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Saqlash
saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "chizma.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Event listeners
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
