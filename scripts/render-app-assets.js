const fs = require("node:fs");
const { PNG } = require("pngjs");

const SIZE = 1024;
const DARK = [32, 33, 36, 255];
const YELLOW = [255, 210, 31, 255];
const CREAM = [255, 248, 223, 255];

function makePng(background = [0, 0, 0, 0]) {
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let i = 0; i < png.data.length; i += 4) png.data.set(background, i);
  return png;
}

function set(png, x, y, color) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  png.data[i] = color[0]; png.data[i + 1] = color[1]; png.data[i + 2] = color[2]; png.data[i + 3] = color[3];
}

function roundedRect(png, left, top, right, bottom, radius, color) {
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const dx = Math.max(left + radius - x, 0, x - (right - radius - 1));
      const dy = Math.max(top + radius - y, 0, y - (bottom - radius - 1));
      if (dx * dx + dy * dy <= radius * radius) set(png, x, y, color);
    }
  }
}

function line(png, x1, y1, x2, y2, width, color) {
  const minX = Math.floor(Math.min(x1, x2) - width); const maxX = Math.ceil(Math.max(x1, x2) + width);
  const minY = Math.floor(Math.min(y1, y2) - width); const maxY = Math.ceil(Math.max(y1, y2) + width);
  const radius = width / 2;
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const dx = x2 - x1; const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    const px = x1 + t * dx; const py = y1 + t * dy;
    if ((x - px) ** 2 + (y - py) ** 2 <= radius ** 2) set(png, x, y, color);
  }
}

function drawMark(png, withBackground) {
  if (withBackground) roundedRect(png, 0, 0, SIZE, SIZE, 220, DARK);
  roundedRect(png, 184, 184, 840, 840, 152, YELLOW);
  line(png, 334, 518, 450, 634, 76, DARK);
  line(png, 450, 634, 690, 388, 76, DARK);
  line(png, 296, 318, 528, 318, 34, CREAM);
  line(png, 296, 734, 480, 734, 34, CREAM);
}

function save(name, background, withBackground) {
  const png = makePng(background);
  drawMark(png, withBackground);
  png.pack().pipe(fs.createWriteStream(`assets/images/${name}.png`));
}

save("app-icon", [0, 0, 0, 0], true);
save("splash-icon", [0, 0, 0, 0], false);
save("android-icon-foreground", [0, 0, 0, 0], false);
save("android-icon-background", DARK, false);
save("android-icon-monochrome", [0, 0, 0, 0], false);
save("favicon", [0, 0, 0, 0], true);
