## neonrender

Neon text renderer for terminals. Prints high‑contrast gradients with a faux glow, optional animation, and export to ANSI/PNG.

![CI](https://img.shields.io/github/actions/workflow/status/zakelfassi/neonrender/ci.yml?branch=main)
![release-please](https://img.shields.io/github/actions/workflow/status/zakelfassi/neonrender/release-please.yml?label=release)
![license](https://img.shields.io/badge/license-MIT-blue)

<video width="100%" controls>
  <source src="demo/neonrender.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Requirements
- Node.js 18+ on macOS, Linux, or Windows Terminal.

### Install & Run
```bash
npm install
# Quick demo
npm run demo

# Or pass your own text
node bin/neonrender.js "Information Beings"
```

### Usage
```bash
neonrender [text...] [options]

Options:
  -t, --text <text>          Text to render (overrides arg)
      --font <name>          block (default)
      --palette <name>       neon-violet | cyberpunk | matrix | amber
      --effect <name>        shimmer|flicker|pulse|breathe|marquee|comet|wave|ripple|scanline|strobe|sparkle|none
                              (combos allowed: shimmer+flicker, glow, pulse-glow)
      --speed <n>            Effect speed (default: 1)
      --intensity <0..1>     Effect intensity (default: 1)
      --no-anim              Render a single static frame
  -i,  --interactive         Arrow keys cycle palette/effect; q quits
      --export <type|path>   ansi|png or a file path (infers type)
      --out <file>           Output file path
```

### Examples
- Static cyberpunk shimmer: `neonrender -t "Zaigood Labs" --palette cyberpunk --effect shimmer --no-anim`
- ANSI export: `neonrender -t "Hello" --export ansi --out demo.ansi`
- PNG export: `npm i canvas && neonrender -t "Hello" --export png --out hello.png`
- Interactive: `neonrender -t "Hello" --interactive` (←/→ palettes, ↑/↓ effects, f toggles +flicker)

### Palettes
- neon-violet (default), cyberpunk-pinkblue (alias: cyberpunk), matrix-green (alias: matrix), neon-amber (alias: amber)

### How it Works (quick)
- ASCII font via figlet → layered renderer draws a dim offset shadow + bright core → gradient across columns → effect modulates brightness over time.
- Truecolor first with 256/16‑color fallback (auto‑detected).

### Development
- Layout: `bin/` entry, `src/cli.js`, `src/renderer/*` (palettes, effects, fonts, renderer), `src/util/*` (ansi, term), `src/exporters/*`.
- Tests: `npm test` (vitest). Try `tests/*` for examples.
- Contributing: see AGENTS.md for style, PR, and test expectations.

### Releasing (GitHub)
- Conventional Commits drive automated releases via Release Please.
- Merge PRs to `main`; the bot will open a release PR. When merged, a GitHub Release is created.
- Optional npm publish: add `NPM_TOKEN` repo secret; publish runs on release tag.

Repository: https://github.com/zakelfassi/neonrender
