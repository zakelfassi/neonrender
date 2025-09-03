// Optional PNG exporter using node-canvas (install with: npm i canvas)
// Draws the ASCII-art lines to an offscreen canvas with a horizontal gradient
// and a soft shadow to simulate glow.

import { mix, rgb } from "../util/color.js";

export async function writePng(lines, start, end, outPath, {
  scale = 2,
  bg = "#0b0b0e",
  fontSize = 14,
  fontFamily = "monospace",
  shadowBlur = 8,
  shadowOffset = { x: 1, y: 1 },
} = {}) {
  let createCanvas;
  try {
    ({ createCanvas } = await import("canvas"));
  } catch (e) {
    const help = "PNG export requires optional dependency 'canvas'. Install with: npm i canvas";
    e.message = e.message + "\n" + help;
    throw e;
  }

  if (!Array.isArray(lines)) lines = String(lines).split("\n");
  const cols = Math.max(...lines.map((l) => l.length), 1);
  const rows = lines.length;
  const charW = Math.round(fontSize * 0.6);
  const charH = Math.round(fontSize * 1.2);
  const pad = Math.round(fontSize * 2);
  const width = cols * charW * scale + pad * 2;
  const height = rows * charH * scale + pad * 2;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Gradient for entire width
  const grad = ctx.createLinearGradient(pad, 0, pad + cols * charW, 0);
  grad.addColorStop(0, `rgb(${start.r},${start.g},${start.b})`);
  grad.addColorStop(1, `rgb(${end.r},${end.g},${end.b})`);

  // Shadow layer
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.shadowColor = `rgba(${Math.round(start.r*0.6)},${Math.round(start.g*0.6)},${Math.round(start.b*0.6)},0.9)`;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = `rgba(${Math.round(start.r*0.35)},${Math.round(start.g*0.35)},${Math.round(start.b*0.35)},1)`;
  for (let y = 0; y < rows; y++) {
    const line = lines[y];
    const x0 = pad + shadowOffset.x;
    const y0 = pad + y * charH + shadowOffset.y;
    ctx.fillText(line, x0, y0);
  }

  // Core layer with gradient fill
  ctx.shadowBlur = Math.round(shadowBlur * 0.6);
  ctx.shadowColor = `rgba(${end.r},${end.g},${end.b},0.9)`;
  ctx.fillStyle = grad;
  for (let y = 0; y < rows; y++) {
    const line = lines[y];
    const x0 = pad;
    const y0 = pad + y * charH;
    ctx.fillText(line, x0, y0);
  }

  // Write file
  const fs = await import("fs");
  await fs.promises.writeFile(outPath, canvas.toBuffer("image/png"));
}

