import { clamp } from "../util/color.js";

// Returns a function intensityAt(t, x, y) -> [0..1]
export function makeIntensity(effect = "shimmer", width = 80, { intensity = 1, speed = 1, height = 1 } = {}) {
  intensity = clamp(intensity, 0, 1);
  speed = Math.max(0, speed);

  const w = Math.max(1, width);
  const h = Math.max(1, height);

  switch ((effect || "shimmer").toLowerCase()) {
    case "none":
      return () => 1;

    case "flicker":
      return (t, x, y) => {
        const seed = Math.floor(t * (6 + 24 * speed));
        const r = pseudoRand(seed * 13.37 + x * 0.77 + y * 1.01);
        const amp = 0.08 * intensity; // mild flicker
        return clamp(0.9 + (r - 0.5) * 2 * amp, 0.7, 1);
      };

    case "pulse":
      return (t) => {
        const amp = 0.25 * intensity;
        const base = 1 - amp;
        const s = Math.sin(t * (1.0 + speed) * 2 * Math.PI);
        return clamp(base + s * amp, 0.6, 1);
      };

    case "breathe":
      return (t) => {
        const amp = 0.22 * intensity;
        const base = 1 - amp * 0.8;
        const s = 0.5 - 0.5 * Math.cos(t * (0.6 + speed * 0.6) * 2 * Math.PI);
        return clamp(base + s * amp, 0.6, 1);
      };

    case "marquee":
      return (t, x) => {
        const bw = Math.max(2, Math.round((w * 0.12) * (0.5 + intensity)));
        const head = (t * (6 + 10 * speed)) % w;
        const d = Math.abs(x - head);
        const fall = Math.max(0, 1 - d / bw);
        const amp = 0.35 * intensity;
        return clamp(0.85 + fall * amp, 0.7, 1);
      };

    case "comet":
      return (t, x) => {
        const head = (t * (5 + 12 * speed)) % w;
        const d = Math.abs(x - head);
        const trail = Math.exp(-d / (2 + 6 * intensity));
        const amp = 0.35 * intensity;
        return clamp(0.85 + trail * amp, 0.7, 1);
      };

    case "wave":
      return (t, x, y) => {
        const kx = 2 * Math.PI / w;
        const ky = 2 * Math.PI / Math.max(2, h);
        const s = Math.sin(kx * x + ky * y + t * (1.5 + speed * 1.5));
        const amp = 0.2 * intensity;
        return clamp(1 - amp * 0.5 + s * amp, 0.7, 1);
      };

    case "ripple":
      return (t, x, y) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const s = Math.sin(dist * (0.8 + 1.2 * intensity) - t * (2 + 4 * speed));
        const amp = 0.3 * intensity;
        return clamp(0.85 + s * amp, 0.6, 1);
      };

    case "scanline":
      return (t, x, y) => {
        const pos = (t * (4 + 10 * speed)) % h;
        const d = Math.abs(y - pos);
        const fall = Math.max(0, 1 - d / (1 + 2 * intensity));
        const amp = 0.4 * intensity;
        return clamp(0.8 + fall * amp, 0.6, 1);
      };

    case "strobe":
      return (t) => {
        const freq = 6 + 24 * speed;
        const phase = t * freq;
        const on = (phase % 1) < 0.2;
        const amp = 0.5 * intensity;
        return clamp(on ? 1 : 1 - amp, 0.5, 1);
      };

    case "sparkle":
      return (t, x, y) => {
        const cellX = Math.floor(x / 2);
        const cellY = Math.floor(y / 2);
        const seed = Math.floor(t * (2 + 10 * speed));
        const r = pseudoRand(seed * 19.19 + cellX * 97.97 + cellY * 13.13);
        const amp = 0.35 * intensity;
        const spike = r > 0.92 ? (r - 0.92) / 0.08 : 0; // sparse spikes
        return clamp(0.85 + spike * amp, 0.7, 1);
      };

    // default: shimmer
    case "shimmer":
    default:
      return (t, x) => {
        const phase = (x / Math.max(1, w - 1)) * Math.PI * 2;
        const amp = 0.2 * intensity;
        const base = 1 - amp * 0.5; // stay bright overall
        const s = Math.sin(phase + t * (1.5 + speed * 2));
        return clamp(base + s * amp, 0.7, 1);
      };
  }
}

function pseudoRand(n) {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
}

export function listEffects() {
  return [
    "shimmer",
    "flicker",
    "pulse",
    "breathe",
    "marquee",
    "comet",
    "wave",
    "ripple",
    "scanline",
    "strobe",
    "sparkle",
    "none",
  ];
}

// ---- Composition helpers ----
const PRESETS = {
  glow: ["shimmer", "flicker"],
  "pulse-glow": ["pulse", "sparkle"],
  "scan-comet": ["scanline", "comet"],
  "ocean-wave": ["wave", "breathe"],
};

export function parseEffectSpec(spec) {
  if (!spec) return ["shimmer"];
  const s = String(spec).trim().toLowerCase();
  if (PRESETS[s]) return PRESETS[s];
  const parts = s.split(/[,+]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return ["shimmer"];
  return parts;
}

export function makeCompositeIntensity(spec, width, opts = {}) {
  const names = Array.isArray(spec) ? spec : parseEffectSpec(spec);
  const fns = names.map((n) => makeIntensity(n, width, opts));
  if (fns.length === 1) return fns[0];
  return (t, x, y) => {
    let v = 0;
    for (const fn of fns) v = Math.max(v, fn(t, x, y));
    return clamp(v, 0.5, 1);
  };
}

export function listEffectPresets() {
  return Object.keys(PRESETS);
}
