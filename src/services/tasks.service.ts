import type { Task } from '@/types/task';
import { getMockData } from './mockDataSource';

export async function getTasks(): Promise<Task[]> {
  const data = await getMockData();
  return data.tasks;
}
