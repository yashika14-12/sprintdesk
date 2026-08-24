import type { Key, ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  accessor: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => Key;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, getRowKey, emptyMessage = 'No data available' }: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          {columns.map((column) => (
            <th key={column.header} scope="col" className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((column) => (
                <td key={column.header} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
