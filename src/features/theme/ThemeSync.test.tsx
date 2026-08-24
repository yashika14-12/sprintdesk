import { afterEach, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { themeReducer, setTheme } from './themeSlice';
import ThemeSync from './ThemeSync';

function renderWithTheme(mode: 'light' | 'dark') {
  const store = configureStore({ reducer: { theme: themeReducer } });
  store.dispatch(setTheme(mode));
  render(
    <Provider store={store}>
      <ThemeSync />
    </Provider>,
  );
  return store;
}

describe('ThemeSync', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('adds the dark class when the theme is dark', () => {
    renderWithTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the dark class when the theme is light', async () => {
    const store = renderWithTheme('dark');
    store.dispatch(setTheme('light'));
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
