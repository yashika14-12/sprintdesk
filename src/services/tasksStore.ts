import { getMockData } from './mockDataSource';
import type { Task } from '@/types/task';

const STORAGE_KEY = 'sprintdesk:tasks';

let cachedTasks: Promise<Task[]> | null = null;

function readPersisted(): Task[] | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return null;
  }
}

function persist(tasks: Task[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

async function loadTasks(): Promise<Task[]> {
  const persisted = readPersisted();
  if (persisted) return persisted;

  const data = await getMockData();
  persist(data.tasks);
  return data.tasks;
}

function getTasksInternal(): Promise<Task[]> {
  if (!cachedTasks) {
    cachedTasks = loadTasks();
  }
  return cachedTasks;
}

export async function getTasks(): Promise<Task[]> {
  return getTasksInternal();
}

export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'assigneeId' | 'dueDate' | 'sprintId'>;

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const tasks = await getTasksInternal();
  const now = new Date().toISOString();
  const status: Task['status'] = 'backlog';
  const newTask: Task = {
    ...input,
    id: tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1,
    status,
    order: tasks.filter((task) => task.status === status).length + 1,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  const updated = [...tasks, newTask];
  cachedTasks = Promise.resolve(updated);
  persist(updated);
  return newTask;
}

export type UpdateTaskInput = Partial<
  Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate' | 'sprintId' | 'order'>
>;

export async function updateTask(id: number, patch: UpdateTaskInput): Promise<Task> {
  const tasks = await getTasksInternal();
  const now = new Date().toISOString();
  let updatedTask: Task | undefined;

  const updated = tasks.map((task) => {
    if (task.id !== id) return task;

    const nextStatus = patch.status ?? task.status;
    updatedTask = {
      ...task,
      ...patch,
      updatedAt: now,
      completedAt: nextStatus === 'done' ? (task.completedAt ?? now) : nextStatus !== task.status ? null : task.completedAt,
    };
    return updatedTask;
  });

  if (!updatedTask) {
    throw new Error(`Task ${id} not found`);
  }

  cachedTasks = Promise.resolve(updated);
  persist(updated);
  return updatedTask;
}

export async function deleteTask(id: number): Promise<void> {
  const tasks = await getTasksInternal();
  const updated = tasks.filter((task) => task.id !== id);
  cachedTasks = Promise.resolve(updated);
  persist(updated);
}

export function __resetTasksStore(): void {
  cachedTasks = null;
  window.localStorage.removeItem(STORAGE_KEY);
}
