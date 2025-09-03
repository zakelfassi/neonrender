import { describe, it, expect } from 'vitest';
import { gradientLine, rgb } from '../src/util/color.js';

describe('render truecolor gradient', () => {
  it('emits 24-bit ANSI sequences', () => {
    const s = gradientLine('Neon', rgb(255,0,255), rgb(0,255,255), true, 24);
    expect(/\x1b\[38;2;/.test(s)).toBe(true);
  });
});

