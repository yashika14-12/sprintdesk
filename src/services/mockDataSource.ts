import type { Comment } from '@/types/comment';
import type { Notification } from '@/types/notification';
import type { Sprint } from '@/types/sprint';
import type { Task } from '@/types/task';
import type { User } from '@/types/user';

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
}

const SIMULATED_LATENCY_MS = 400;

let cachedData: Promise<MockData> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMockData(): Promise<MockData> {
  if (!cachedData) {
    cachedData = fetch('/mock-data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load mock data: ${response.status}`);
        }
        return response.json() as Promise<MockData>;
      })
      .then(async (data) => {
        await delay(SIMULATED_LATENCY_MS);
        return data;
      });
  }
  return cachedData;
}

export function __resetMockDataCache(): void {
  cachedData = null;
}
