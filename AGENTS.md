# Repository Guidelines

## Project Structure & Ownership
- `bin/neonrender.js`: CLI entry. Keep minimal; all logic in `src/`.
- `src/cli.js`: argument parsing, I/O, orchestration only.
- `src/renderer/*`: pure rendering strategies (palettes, effects, fonts, frame composer).
- `src/util/*`: color math, ANSI/terminal helpers. No business logic here.
- `src/exporters/*`: file exporters (ansi, png). Avoid side effects outside given path.
- `tests/*`: vitest. Mirror source tree; keep tests close to utilities.

## Build, Test, and Dev Commands
- `npm run demo` – quick sanity render.
- `node bin/neonrender.js "Your Text"` – local run without linking.
- `npm test` – unit tests (ANSI presence, fallbacks, composition bounds).
- Optional PNG: `npm i canvas` then `--export png`.

## Coding Style & Conventions
- ESM, 2‑space indent, LF, no trailing spaces. Prefer pure functions and small modules (≤200 LOC).
- Names: files `kebab-case`, functions `camelCase`, classes `PascalCase`.
- Never inline escape codes—use helpers from `src/util/color.js`.
- Favor data‑driven strategies (palettes/effects tables) over conditionals.

## Testing Guidelines
- Minimum: tests for ANSI emission (24‑bit, 256, 16), effect range [0.5..1], and non‑crash on wide glyphs.
- No snapshots for animations; static frames only. Keep tests <100ms each.

## Commit & PR Workflow
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`. Scope example: `feat(effects): add ripple`.
- One feature per PR (< ~400 lines). Include before/after screenshot or ANSI capture and tests.
- CI (optional): run `npm test` on push/PR.

## Architecture Notes
- Renderer = layered compose: shadow (dim, offset) + core (bright) using column gradient.
- Effect = function `(t,x,y)->[0..1]`; compose via `makeCompositeIntensity(names)`.
- Palette = `[startRGB, endRGB]`. Add in `palettes.js`; expose alias if handy.

## Security & Performance
- Treat all text as data. Never eval/exec. Avoid blocking I/O in the render loop.
- Color depth autoselects (24/8/4). Ensure fallback paths stay readable on dark backgrounds.

## How to Extend Quickly
- Add effect: implement in `effects.js`, export via `listEffects()`, add a short test.
- Add palette: extend `palettes.js` and alias map; update README palettes list.
- Add exporter: create `src/exporters/<type>.js`, wire `--export` in `src/cli.js`.
