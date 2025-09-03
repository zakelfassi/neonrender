import { resolvePalette } from "./renderer/palettes.js";
import { renderFont } from "./renderer/fonts.js";
import { renderNeon, renderNeonFrame } from "./renderer/renderer.js";
import { Command } from "commander";
import { makeIntensity, listEffects, makeCompositeIntensity, parseEffectSpec, listEffectPresets } from "./renderer/effects.js";
import { hideCursor, showCursor, moveCursorUp, detectColorSupport } from "./util/term.js";
import { writeAnsiFile } from "./exporters/ansi.js";

export async function main() {
  const program = new Command();
  program
    .name("neonrender")
    .description("Render neon-style gradients and glow in your terminal")
    .argument("[text...]", "text to render")
    .option("-t, --text <text>", "text to render (overrides arg)")
    .option("--font <name>", "font style (block)", "block")
    .option("--palette <name>", "palette name (neon-violet)", "neon-violet")
    .option("--effect <name>", "effect or combo (e.g. shimmer, flicker, pulse, shimmer+flicker, glow)", "shimmer")
    .option("--speed <n>", "effect speed (1)", parseFloat, 1)
    .option("--intensity <0..1>", "effect intensity (1)", parseFloat, 1)
    .option("--no-anim", "render a single static frame")
    .option("-i, --interactive", "interactive mode: arrow keys cycle palette/effect; q quits", false)
    .option("--export <typeOrPath>", "export: ansi|png|gif or output path")
    .option("--out <file>", "output file path");

  program.parse(process.argv);
  const opts = program.opts();
  const argText = program.args.length ? program.args.join(" ") : null;
  const text = opts.text ?? argText ?? "Hello, Neon";

  const [start, end] = resolvePalette(opts.palette);
  const lines = renderFont(text, opts.font);
  const depth = detectColorSupport();

  // Interactive mode overrides export/animation flags
  if (opts.interactive) {
    await runInteractive({ text, font: opts.font, paletteName: opts.palette, effect: opts.effect });
    return;
  }

  // Handle export requests
  const exportArg = opts.export;
  if (exportArg) {
    const { exportType, outPath } = parseExportArgs(exportArg, opts.out, text);
    if (exportType === "ansi") {
      const frame = renderNeon(lines, start, end, { depth: 24 }); // always save truecolor
      writeAnsiFile(frame, outPath);
      process.stdout.write(`Saved ANSI to ${outPath}\n`);
      return;
    } else if (exportType === "png") {
      const { writePng } = await import("./exporters/png.js");
      await writePng(lines, start, end, outPath, {});
      process.stdout.write(`Saved PNG to ${outPath}\n`);
      return;
    } else {
      process.stderr.write(`Unsupported export: ${exportType}\n`);
      process.exit(2);
    }
  }

  if (opts.anim === false || opts.effect === "none") {
    const output = renderNeon(lines, start, end, { depth });
    process.stdout.write(output + "\n");
    return;
  }

  // Animated path
  const width = Math.max(...lines.map((l) => l.length), 1);
  const spec = parseEffectSpec(opts.effect);
  const intensityAtFactory = makeCompositeIntensity(spec, width, {
    intensity: opts.intensity,
    speed: opts.speed,
    height: lines.length,
  });

  let prevLines = 0;
  hideCursor();
  const startMs = Date.now();
  const fps = 24;
  const tick = () => {
    const t = (Date.now() - startMs) / 1000;
    const output = renderNeonFrame(
      lines,
      start,
      end,
      (x, y) => intensityAtFactory(t, x, y),
      { depth }
    );
    if (prevLines > 0) moveCursorUp(prevLines);
    const toWrite = output + "\n";
    process.stdout.write(toWrite);
    prevLines = output.split("\n").length;
  };
  const handleExit = () => {
    showCursor();
    process.stdout.write("\n");
    process.exit(0);
  };
  process.on("SIGINT", handleExit);
  process.on("exit", () => showCursor());
  tick();
  setInterval(tick, Math.round(1000 / fps));
}

function parseExportArgs(typeOrPath, outOpt, baseName = "neon") {
  const lower = String(typeOrPath).toLowerCase();
  const looksLikeFile = /[.\\/]/.test(lower);
  let exportType;
  let outPath = outOpt || null;
  if (!looksLikeFile) {
    exportType = lower;
  } else {
    // derive type from extension
    outPath = outPath || typeOrPath;
    const ext = lower.split('.').pop();
    exportType = (ext === 'png' || ext === 'gif') ? ext : 'ansi';
  }
  if (!outPath) {
    outPath = exportType === 'png' ? `${sanitize(baseName)}.png` : `${sanitize(baseName)}.ansi`;
  }
  return { exportType, outPath };
}

function sanitize(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 64) || 'neon';
}

async function runInteractive({ text, font, paletteName, effect }) {
  const { listPalettes, resolvePalette } = await import("./renderer/palettes.js");
  const paletteNames = listPalettes();
  let paletteIndex = Math.max(0, paletteNames.indexOf(paletteName));
  const baseEffects = listEffects();
  let effectIndex = Math.max(0, baseEffects.indexOf(effect));
  let comboFlicker = false; // overlay toggle
  let speed = 1;
  let intensity = 1;

  let [start, end] = resolvePalette(paletteNames[paletteIndex]);
  const lines = renderFont(text, font);
  const width = Math.max(...lines.map((l) => l.length), 1);
  const depth = detectColorSupport();
  let make = () => {
    const names = [baseEffects[effectIndex]].concat(comboFlicker ? ["flicker"] : []);
    return makeCompositeIntensity(names, width, { speed, intensity, height: lines.length });
  };
  let intensityAtFactory = make();

  let prevLines = 0;
  const fps = 24;
  const startMs = Date.now();
  hideCursor();

  const stdin = process.stdin;
  const restore = () => { try { stdin.setRawMode(false); } catch {} showCursor(); process.stdout.write("\n"); };
  process.on("SIGINT", () => { restore(); process.exit(0); });
  process.on("exit", restore);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  const helpLine = () => `\x1b[2K\r←/→ palette: ${paletteNames[paletteIndex]}  ↑/↓ effect: ${baseEffects[effectIndex]}${comboFlicker?'+flicker':''}  (f toggles flicker)  q: quit`;

  const tick = () => {
    const t = (Date.now() - startMs) / 1000;
    const frame = renderNeonFrame(
      lines,
      start,
      end,
      (x, y) => intensityAtFactory(t, x, y),
      { depth }
    );
    const output = helpLine() + "\n" + frame;
    if (prevLines > 0) moveCursorUp(prevLines);
    process.stdout.write(output + "\n");
    prevLines = output.split("\n").length;
  };

  const onKey = (ch) => {
    if (!ch) return;
    if (ch === 'q' || ch === 'Q' || ch === '\u0003') { // ctrl+c
      restore();
      process.exit(0);
    }
    if (ch === '\u001b[D') { // left
      paletteIndex = (paletteIndex - 1 + paletteNames.length) % paletteNames.length;
      [start, end] = resolvePalette(paletteNames[paletteIndex]);
    } else if (ch === '\u001b[C') { // right
      paletteIndex = (paletteIndex + 1) % paletteNames.length;
      [start, end] = resolvePalette(paletteNames[paletteIndex]);
    } else if (ch === '\u001b[A') { // up
      effectIndex = (effectIndex + 1) % baseEffects.length;
      intensityAtFactory = make();
    } else if (ch === '\u001b[B') { // down
      effectIndex = (effectIndex - 1 + baseEffects.length) % baseEffects.length;
      intensityAtFactory = make();
    } else if (ch === 'f' || ch === 'F') {
      comboFlicker = !comboFlicker;
      intensityAtFactory = make();
    }
  };

  stdin.on('data', onKey);
  tick();
  setInterval(tick, Math.round(1000 / fps));
}
