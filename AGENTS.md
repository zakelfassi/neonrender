# Repository Guidelines

## Project Structure & Module Organization
- `bin/neonrender.js`: CLI entry. Keep this file tiny; delegate to `src/`.
- `src/cli.js`: argument parsing and top‑level orchestration.
- `src/renderer/*`: rendering strategies (palettes, effects, fonts). Add modules, don’t bloat `cli.js`.
- `src/util/*`: color math, ANSI helpers, terminal detection.
- `tests/*`: Vitest specs (rendering presence, fallbacks). 80%+ lines for core utils.
- `demo/`: tiny scripts and sample outputs.

## Build, Test, and Development Commands
- `npm run demo`: print a neon “Hello, Neon”.
- `node bin/neonrender.js "Your Text"`: run locally without install.
- `npm test`: run unit tests (added in Step 5).
- `npm run lint` / `npm run format`: lint/format once configured.

## Coding Style & Naming Conventions
- Language: Node.js (ESM). Indent 2 spaces, LF line endings.
- Filenames: `kebab-case` for binaries, `camelCase` for functions, `PascalCase` for classes.
- Keep modules small (≤200 LOC); prefer pure functions in `util/`.
- Use ANSI constants and color math from `src/util/`—no inline escape codes.

## Testing Guidelines
- Framework: Vitest. Add tests for: ANSI presence, truecolor→256/16 fallback, and no-crash on wide glyphs.
- Naming: mirror paths, e.g., `tests/util.color.test.js`.
- Snapshot tests allowed for deterministic static renders; avoid for animations.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`). Scope example: `feat(renderer): add shimmer`.
- PRs: include description, screenshots or ANSI capture, reproduction steps, and linked issue.
- Keep PRs under ~400 lines diff; split by feature (renderer, effect, export).

## Security & Configuration Tips
- Never execute untrusted input. Treat `--file` content as text only.
- Detect terminal color depth via env (`COLORTERM`) or `tput`; fall back safely.
- Support macOS/Linux/Windows Terminal; avoid shell‑specific escape sequences.

## Agent-Specific Instructions
- Add new palettes/effects via new modules, not conditionals.
- Keep `Renderer` interface stable; add strategies (palette/effect/font) as plug‑ins under `styles/` when introduced.

