import { describe, it, expect } from 'vitest';
import { makeCompositeIntensity, parseEffectSpec } from '../src/renderer/effects.js';

describe('effect composition', () => {
  it('parses combos', () => {
    expect(parseEffectSpec('shimmer+flicker')).toEqual(['shimmer','flicker']);
    expect(parseEffectSpec('glow')).toEqual(['shimmer','flicker']);
  });

  it('composed intensity stays in range', () => {
    const fn = makeCompositeIntensity(['pulse','sparkle'], 40, { intensity: 1, speed: 1, height: 6 });
    const val = fn(0.5, 10, 2);
    expect(val).toBeGreaterThanOrEqual(0.5);
    expect(val).toBeLessThanOrEqual(1);
  });
});

