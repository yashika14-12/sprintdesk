import { getMockData } from './mockDataSource';
import type { Notification } from '@/types/notification';

export async function getInitialNotifications(): Promise<Notification[]> {
  const data = await getMockData();
  return data.notifications;
}
