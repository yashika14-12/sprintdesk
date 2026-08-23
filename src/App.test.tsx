import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App placeholder', () => {
  it('renders the SprintDesk heading', () => {
    render(<App />);
    expect(screen.getByText('SprintDesk')).toBeInTheDocument();
  });
});
