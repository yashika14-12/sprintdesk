import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('boots the provider tree and redirects the root route to the dashboard placeholder', async () => {
    render(<App />);
    expect(await screen.findByText(/dashboard page placeholder/i)).toBeInTheDocument();
  });
});
