import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const options = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

describe('Select', () => {
  it('links the label to the select and renders all options', () => {
    render(<Select label="Priority" options={options} value="low" onChange={() => {}} />);
    const select = screen.getByLabelText('Priority');
    expect(select).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn();
    render(<Select label="Priority" options={options} value="low" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Priority'), 'high');
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('shows an error message and marks the select invalid', () => {
    render(
      <Select label="Priority" options={options} value="low" onChange={() => {}} error="Required" />,
    );
    expect(screen.getByLabelText('Priority')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('supports a disabled state', () => {
    render(<Select label="Priority" options={options} value="low" onChange={() => {}} disabled />);
    expect(screen.getByLabelText('Priority')).toBeDisabled();
  });
});
