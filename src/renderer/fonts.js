import figlet from "figlet";

// Step 3: one font routed through figlet. We choose 'ANSI Shadow'
// as it evokes a stepped shadow similar to neon signage.
const FONT_MAP = {
  block: "ANSI Shadow",
};

export function renderFont(text, fontKey = "block") {
  const font = FONT_MAP[fontKey] || FONT_MAP.block;
  const ascii = figlet.textSync(text, {
    font,
    horizontalLayout: "default",
    verticalLayout: "default",
  });
  return ascii.split("\n");
}

