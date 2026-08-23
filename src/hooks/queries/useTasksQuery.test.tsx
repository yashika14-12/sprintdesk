import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/test-utils';
import type { Task } from '@/types/task';
import * as tasksService from '@/services/tasks.service';
import { useTasksQuery } from './useTasksQuery';

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Sample task',
    description: 'A sample task for testing.',
    status: 'backlog',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-08-01',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

describe('useTasksQuery', () => {
  it('resolves to the tasks returned by the tasks service', async () => {
    vi.spyOn(tasksService, 'getTasks').mockResolvedValue(sampleTasks);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useTasksQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sampleTasks);
  });
});
