import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '@/services/tasks.service';
import { tasksQueryKey } from './useTasksQuery';

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}
