import { clamp } from "../util/color.js";

// Returns a function intensityAt(t, x, y) -> [0..1]
export function makeIntensity(effect = "shimmer", width = 80, { intensity = 1, speed = 1 } = {}) {
  intensity = clamp(intensity, 0, 1);
  speed = Math.max(0, speed);

  if (effect === "none") {
    return () => 1;
  }

  if (effect === "flicker") {
    return (t, x, y) => {
      const seed = Math.floor(t * (6 + 24 * speed));
      const r = pseudoRand(seed * 13.37 + x * 0.77 + y * 1.01);
      const amp = 0.08 * intensity; // mild flicker
      return clamp(0.9 + (r - 0.5) * 2 * amp, 0.7, 1);
    };
  }

  // default: shimmer
  return (t, x, y) => {
    const phase = (x / Math.max(1, width - 1)) * Math.PI * 2;
    const amp = 0.2 * intensity;
    const base = 1 - amp * 0.5; // stay bright overall
    const s = Math.sin(phase + t * (1.5 + speed * 2));
    return clamp(base + s * amp, 0.7, 1);
  };
}

function pseudoRand(n) {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
}

export function listEffects() {
  return ["shimmer", "flicker", "none"];
}
