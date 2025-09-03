import { RESET, mix, fgCodeForColor, scaleColor } from "../util/color.js";

// Render a single frame with optional per-column intensity function.
export function renderNeon(textLines, start, end, options = {}) {
  return renderNeonFrame(textLines, start, end, () => 1, options);
}

export function renderNeonFrame(
  textLines,
  start,
  end,
  intensityAt = () => 1,
  { keepSpacesColorless = true, depth = 24 } = {}
) {
  if (!Array.isArray(textLines)) textLines = String(textLines).split("\n");
  const width = Math.max(...textLines.map((l) => l.length), 1);

  const out = [];
  const shadowScale = 0.35;

  // vertical offset line for shadow layer
  out.push("");

  // Shadow layer (offset +1 col)
  for (let y = 0; y < textLines.length; y++) {
    const src = textLines[y];
    let line = "";
    line += " "; // horizontal offset
    for (let x = 0; x < width; x++) {
      const ch = src[x] ?? " ";
      const t = width === 1 ? 0 : x / (width - 1);
      const i = intensityAt(x, y);
      const c = scaleColor(mix(start, end, t), shadowScale * i);
      if (keepSpacesColorless && ch === " ") line += ch;
      else line += fgCodeForColor(c, depth) + ch;
    }
    out.push(line + RESET);
  }

  // Core layer
  for (let y = 0; y < textLines.length; y++) {
    const src = textLines[y];
    let line = "";
    for (let x = 0; x < width; x++) {
      const ch = src[x] ?? " ";
      const t = width === 1 ? 0 : x / (width - 1);
      const i = intensityAt(x, y);
      const c = scaleColor(mix(start, end, t), i);
      if (keepSpacesColorless && ch === " ") line += ch;
      else line += fgCodeForColor(c, depth) + ch;
    }
    out.push(line + RESET);
  }

  return out.join("\n") + RESET;
}
