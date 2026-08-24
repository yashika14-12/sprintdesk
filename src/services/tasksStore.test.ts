import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mockDataSource from './mockDataSource';
import type { MockData } from './mockDataSource';
import { __resetTasksStore, createTask, deleteTask, getTasks, updateTask } from './tasksStore';
import type { Task } from '@/types/task';

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Task one',
    description: 'desc',
    status: 'backlog',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-09-01',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

function stubMockData(tasks: Task[]) {
  const data: MockData = { users: [], sprints: [], tasks, comments: [], notifications: [] };
  vi.spyOn(mockDataSource, 'getMockData').mockResolvedValue(data);
}

describe('tasksStore', () => {
  beforeEach(() => {
    __resetTasksStore();
    stubMockData(sampleTasks);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('seeds from mockDataSource on first read', async () => {
    const tasks = await getTasks();
    expect(tasks).toEqual(sampleTasks);
  });

  it('createTask assigns the next sequential id, defaults status to backlog, and appends the task', async () => {
    const created = await createTask({
      title: 'New task',
      description: '',
      priority: 'medium',
      assigneeId: 2,
      dueDate: '2026-09-05',
      sprintId: 1,
    });

    expect(created.id).toBe(2);
    expect(created.status).toBe('backlog');
    expect(created.completedAt).toBeNull();

    const tasks = await getTasks();
    expect(tasks).toHaveLength(2);
  });

  it('updateTask sets completedAt when the task moves to done', async () => {
    const updated = await updateTask(1, { status: 'done' });
    expect(updated.status).toBe('done');
    expect(updated.completedAt).not.toBeNull();
  });

  it('updateTask clears completedAt when the task moves away from done', async () => {
    await updateTask(1, { status: 'done' });
    const updated = await updateTask(1, { status: 'in-progress' });
    expect(updated.completedAt).toBeNull();
  });

  it('updateTask throws for an unknown id', async () => {
    await expect(updateTask(999, { title: 'x' })).rejects.toThrow('Task 999 not found');
  });

  it('deleteTask removes the task', async () => {
    await deleteTask(1);
    const tasks = await getTasks();
    expect(tasks).toEqual([]);
  });

  it('persists mutations to localStorage', async () => {
    await updateTask(1, { title: 'Renamed' });
    const stored = JSON.parse(window.localStorage.getItem('sprintdesk:tasks') ?? '[]') as Task[];
    expect(stored[0].title).toBe('Renamed');
  });
});
