export function hideCursor() {
  process.stdout.write("\x1b[?25l");
}

export function showCursor() {
  process.stdout.write("\x1b[?25h");
}

export function moveCursorUp(n) {
  if (n > 0) process.stdout.write(`\x1b[${n}A`);
}

export function clearLine() {
  process.stdout.write("\x1b[2K\r");
}

// Detect terminal color depth with fallbacks.
export function detectColorSupport({ env = process.env, stream = process.stdout } = {}) {
  const colorterm = (env.COLORTERM || "").toLowerCase();
  if (colorterm.includes("truecolor") || colorterm.includes("24bit")) return 24;
  if (env.WT_SESSION) return 24; // Windows Terminal
  if (env.TERM_PROGRAM === "iTerm.app") return 24;

  if (stream && typeof stream.getColorDepth === "function") {
    const d = stream.getColorDepth();
    if (d >= 24) return 24;
    if (d >= 8) return 8;
    return 4;
  }
  // Fallback conservative
  return 8;
}

