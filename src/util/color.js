// Minimal gradient + ANSI helpers (Step 2)

export const RESET = "\x1b[0m";

export function rgb(r, g, b) {
  return { r, g, b };
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mix(c1, c2, t) {
  return rgb(
    Math.round(lerp(c1.r, c2.r, t)),
    Math.round(lerp(c1.g, c2.g, t)),
    Math.round(lerp(c1.b, c2.b, t))
  );
}

export function ansiFg24({ r, g, b }) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

// Apply a two-stop gradient across characters of a string.
export function gradientText(text, start, end, depth = 24) {
  if (!text || text.length === 0) return "";
  const len = Math.max(1, text.length - 1);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const t = len === 0 ? 0 : i / len;
    const c = mix(start, end, t);
    out += fgCodeForColor(c, depth) + text[i];
  }
  return out + RESET;
}

export function scaleColor({ r, g, b }, s) {
  return rgb(
    Math.max(0, Math.min(255, Math.round(r * s))),
    Math.max(0, Math.min(255, Math.round(g * s))),
    Math.max(0, Math.min(255, Math.round(b * s)))
  );
}

// Gradient across a whole line, preserving spaces (option keepSpacesColorless).
export function gradientLine(line, start, end, keepSpacesColorless = true, depth = 24) {
  const width = Math.max(1, line.length - 1);
  let out = "";
  for (let x = 0; x < line.length; x++) {
    const t = width === 0 ? 0 : x / width;
    const c = mix(start, end, t);
    const ch = line[x] ?? " ";
    if (keepSpacesColorless && ch === " ") {
      out += ch;
    } else {
      out += fgCodeForColor(c, depth) + ch;
    }
  }
  return out + RESET;
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ---------- Fallbacks ----------
export function fgCodeForColor(color, depth = 24) {
  if (depth >= 24) return ansiFg24(color);
  if (depth >= 8) return ansiFg256(rgbToAnsi256(color.r, color.g, color.b));
  const idx16 = rgbToAnsi16(color.r, color.g, color.b);
  return ansiFg16(idx16);
}

export function ansiFg256(n) {
  return `\x1b[38;5;${n}m`;
}

export function ansiFg16(idx) {
  if (idx < 8) return `\x1b[${30 + idx}m`;
  return `\x1b[${90 + (idx - 8)}m`;
}

export function rgbToAnsi256(r, g, b) {
  // Grayscale approximation
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  // 6x6x6 cube
  const rC = Math.round((r / 255) * 5);
  const gC = Math.round((g / 255) * 5);
  const bC = Math.round((b / 255) * 5);
  return 16 + 36 * rC + 6 * gC + bC;
}

export function rgbToAnsi16(r, g, b) {
  // Map to closest of 16 ANSI colors
  const palette = [
    [0, 0, 0],        // 0 black
    [205, 49, 49],    // 1 red
    [13, 188, 121],   // 2 green
    [229, 229, 16],   // 3 yellow
    [36, 114, 200],   // 4 blue
    [188, 63, 188],   // 5 magenta
    [17, 168, 205],   // 6 cyan
    [229, 229, 229],  // 7 white
    [102, 102, 102],  // 8 bright black (gray)
    [241, 76, 76],    // 9 bright red
    [35, 209, 139],   // 10 bright green
    [245, 245, 67],   // 11 bright yellow
    [59, 142, 234],   // 12 bright blue
    [214, 112, 214],  // 13 bright magenta
    [41, 184, 219],   // 14 bright cyan
    [255, 255, 255],  // 15 bright white
  ];
  let idx = 0;
  let best = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dr = r - palette[i][0];
    const dg = g - palette[i][1];
    const db = b - palette[i][2];
    const d = dr * dr + dg * dg + db * db;
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return idx;
}
