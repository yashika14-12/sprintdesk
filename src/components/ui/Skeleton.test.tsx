import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders an accessible loading placeholder', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('applies a custom className alongside its default styles', () => {
    render(<Skeleton className="h-4 w-32" />);
    const skeleton = screen.getByRole('status', { name: /loading/i });
    expect(skeleton).toHaveClass('h-4', 'w-32', 'animate-pulse');
  });
});
