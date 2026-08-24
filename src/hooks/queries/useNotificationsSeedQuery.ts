import { useQuery } from '@tanstack/react-query';
import { getInitialNotifications } from '@/services/notificationSeed.service';

export const notificationsSeedQueryKey = ['notifications', 'seed'] as const;

export function useNotificationsSeedQuery() {
  return useQuery({
    queryKey: notificationsSeedQueryKey,
    queryFn: getInitialNotifications,
    staleTime: Infinity,
  });
}
