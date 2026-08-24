import { useQuery } from '@tanstack/react-query';
import { getCommentsForTask } from '@/services/comments.service';

export const commentsQueryKey = (taskId: number) => ['comments', taskId] as const;

export function useCommentsQuery(taskId: number) {
  return useQuery({
    queryKey: commentsQueryKey(taskId),
    queryFn: () => getCommentsForTask(taskId),
  });
}
