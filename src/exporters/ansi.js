import fs from "fs";

export function writeAnsiFile(ansiString, outPath) {
  if (!outPath) throw new Error("Output path required for ANSI export");
  fs.writeFileSync(outPath, ansiString.endsWith("\n") ? ansiString : ansiString + "\n", "utf8");
}

