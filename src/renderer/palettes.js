import { rgb } from "../util/color.js";

// Palettes
export const palettes = {
  "neon-violet": [rgb(255, 0, 255), rgb(0, 255, 255)], // violet → cyan
  "cyberpunk-pinkblue": [rgb(255, 0, 127), rgb(0, 209, 255)], // hot pink → neon blue
  "matrix-green": [rgb(0, 255, 136), rgb(0, 255, 0)], // mint → lime
  "neon-amber": [rgb(255, 122, 0), rgb(255, 191, 0)], // amber orange → amber yellow
};

const aliases = {
  cyberpunk: "cyberpunk-pinkblue",
  matrix: "matrix-green",
  amber: "neon-amber",
  violet: "neon-violet",
};

export function resolvePalette(name = "neon-violet") {
  const key = aliases[name] || name;
  return palettes[key] || palettes["neon-violet"];
}

export function listPalettes() {
  return Object.keys(palettes);
}
