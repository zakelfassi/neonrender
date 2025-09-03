import { describe, it, expect } from 'vitest';
import { gradientLine, rgb } from '../src/util/color.js';

describe('fallbacks', () => {
  it('emits 256-color when depth=8', () => {
    const s = gradientLine('Neon', rgb(255,0,255), rgb(0,255,255), true, 8);
    expect(/\x1b\[38;5;/.test(s)).toBe(true);
    expect(/\x1b\[38;2;/.test(s)).toBe(false);
  });

  it('emits 16-color when depth=4', () => {
    const s = gradientLine('Neon', rgb(255,0,255), rgb(0,255,255), true, 4);
    expect(/\x1b\[(3[0-7]|9[0-7])m/.test(s)).toBe(true);
    expect(/\x1b\[38;2;/.test(s)).toBe(false);
  });
});

