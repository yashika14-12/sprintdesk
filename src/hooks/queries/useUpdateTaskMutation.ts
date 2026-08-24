import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '@/services/tasks.service';
import type { UpdateTaskInput } from '@/services/tasks.service';
import { tasksQueryKey } from './useTasksQuery';

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateTaskInput }) => updateTask(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}
