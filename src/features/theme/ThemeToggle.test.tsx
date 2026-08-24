import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { themeReducer } from './themeSlice';
import ThemeToggle from './ThemeToggle';

function renderToggle() {
  const store = configureStore({ reducer: { theme: themeReducer } });
  render(
    <Provider store={store}>
      <ThemeToggle />
    </Provider>,
  );
  return store;
}

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an accessible button labelled with the current mode', () => {
    renderToggle();
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it('dispatches toggleTheme when clicked', async () => {
    const store = renderToggle();
    await userEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    expect(store.getState().theme.mode).toBe('dark');
  });
});
