import { describe, it, expect } from 'vitest';
import { themeReducer, setTheme, toggleTheme } from './themeSlice';

describe('themeSlice', () => {
  it('defaults to light mode', () => {
    const state = themeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('light');
  });

  it('setTheme sets the mode explicitly', () => {
    const state = themeReducer({ mode: 'light' }, setTheme('dark'));
    expect(state.mode).toBe('dark');
  });

  it('toggleTheme flips light to dark and back', () => {
    const afterFirst = themeReducer({ mode: 'light' }, toggleTheme());
    expect(afterFirst.mode).toBe('dark');
    const afterSecond = themeReducer(afterFirst, toggleTheme());
    expect(afterSecond.mode).toBe('light');
  });
});
