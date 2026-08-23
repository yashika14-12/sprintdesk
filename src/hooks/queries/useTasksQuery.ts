import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/services/tasks.service';

export const tasksQueryKey = ['tasks'] as const;

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: getTasks,
  });
}
