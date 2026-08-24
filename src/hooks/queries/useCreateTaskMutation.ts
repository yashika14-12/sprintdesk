import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '@/services/tasks.service';
import { tasksQueryKey } from './useTasksQuery';

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}
