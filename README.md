## neonrender

Minimal scaffold (Step 2). Prints a neon-gradient message to your terminal.

### Quickstart

```bash
npm install
npm run demo    # prints a neon "Hello, Neon"

# Or pass your own text
node bin/neonrender.js "Information Beings"
```

### Interactive mode
```bash
node bin/neonrender.js -t "Hello" --interactive
# Arrow keys: ←/→ cycle palettes, ↑/↓ cycle effects, q quits
```

### What’s here now
- Runnable CLI printing a truecolor gradient.
- Defaults: violet → cyan gradient on dark terminals.

### Roadmap (next steps)
1. Gradient engine + fonts/palettes
2. More palettes + effects (shimmer, flicker)
3. Fallback logic + tests (vitest)
4. Export (ansi, then png)
5. Interactive mode (arrow keys; q to quit)

### Export
- ANSI: `neonrender -t "Hello" --export ansi --out demo.ansi`
- Also accepted: `--export demo.ansi` (infers ANSI). The file contains ANSI escape sequences.
- PNG (optional): install node-canvas first `npm i canvas`, then:
  `neonrender -t "Hello" --export png --out hello.png`
