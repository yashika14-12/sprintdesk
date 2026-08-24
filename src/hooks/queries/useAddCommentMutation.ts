import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment } from '@/services/comments.service';
import { commentsQueryKey } from './useCommentsQuery';

export function useAddCommentMutation(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ authorId, message }: { authorId: number; message: string }) => addComment(taskId, authorId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(taskId) });
    },
  });
}
