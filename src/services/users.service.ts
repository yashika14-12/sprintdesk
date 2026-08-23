import type { User } from '@/types/user';
import { getMockData } from './mockDataSource';

export async function getUsers(): Promise<User[]> {
  const data = await getMockData();
  return data.users;
}
