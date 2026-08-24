import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('boots the provider tree and redirects an unauthenticated visit to the login page', async () => {
    render(<App />);
    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
  });
});
