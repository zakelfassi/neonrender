#!/usr/bin/env node
// Simple smoke checks for README examples. No interactive commands.
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

function run(cmd, opts={}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'pipe', encoding: 'utf8', timeout: 20000, ...opts });
}

function main() {
  // 1) Demo should run
  run('node bin/neonrender.js "Information Beings" --no-anim');

  // 2) ANSI export works and contains escape sequences
  const out = join(process.cwd(), 'out.ansi');
  run(`node bin/neonrender.js -t "Hello" --export ansi --out ${out}`);
  if (!existsSync(out)) throw new Error('out.ansi was not created');
  const buf = readFileSync(out, 'utf8');
  if (!/\x1b\[/.test(buf)) throw new Error('out.ansi does not contain ANSI sequences');
  try { unlinkSync(out); } catch {}

  // 3) Palette/effect options parse without error
  run('node bin/neonrender.js -t "CI" --palette cyberpunk --effect shimmer+flicker --no-anim');

  console.log('README examples OK');
}

main();

