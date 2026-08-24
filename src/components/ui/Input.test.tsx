import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('links the label to the input via htmlFor/id', () => {
    render(<Input label="Email" id="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('generates an id automatically when none is given, and still links the label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows helper text when there is no error', () => {
    render(<Input label="Email" helperText="We will never share this." />);
    expect(screen.getByText('We will never share this.')).toBeInTheDocument();
  });

  it('shows an error message and marks the input invalid, hiding helper text', () => {
    render(<Input label="Email" helperText="helper" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('helper')).not.toBeInTheDocument();
  });

  it('passes through disabled and other native input props', () => {
    render(<Input label="Email" disabled placeholder="you@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });
});
