import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, type DataTableColumn } from './DataTable';

interface Row {
  id: number;
  name: string;
  priority: string;
}

const columns: DataTableColumn<Row>[] = [
  { header: 'Name', accessor: (row) => row.name },
  { header: 'Priority', accessor: (row) => row.priority },
];

const rows: Row[] = [
  { id: 1, name: 'Task A', priority: 'high' },
  { id: 2, name: 'Task B', priority: 'low' },
];

describe('DataTable', () => {
  it('renders a column header for each configured column', () => {
    render(<DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Priority' })).toBeInTheDocument();
  });

  it('renders one row per data item, with cells from each accessor', () => {
    render(<DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />);
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header row + 2 data rows
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('renders an empty state message when there is no data', () => {
    render(<DataTable columns={columns} data={[]} getRowKey={(row) => row.id} emptyMessage="No tasks yet" />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
