import type { Sprint } from '@/types/sprint';
import { getMockData } from './mockDataSource';

export async function getSprints(): Promise<Sprint[]> {
  const data = await getMockData();
  return data.sprints;
}
