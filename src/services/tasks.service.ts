import type { Task } from '@/types/task';
import * as tasksStore from './tasksStore';
import type { CreateTaskInput, UpdateTaskInput } from './tasksStore';

const SIMULATED_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTasks(): Promise<Task[]> {
  await delay(SIMULATED_LATENCY_MS);
  return tasksStore.getTasks();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await delay(SIMULATED_LATENCY_MS);
  return tasksStore.createTask(input);
}

export async function updateTask(id: number, patch: UpdateTaskInput): Promise<Task> {
  await delay(SIMULATED_LATENCY_MS);
  return tasksStore.updateTask(id, patch);
}

export async function deleteTask(id: number): Promise<void> {
  await delay(SIMULATED_LATENCY_MS);
  return tasksStore.deleteTask(id);
}

export type { CreateTaskInput, UpdateTaskInput };
