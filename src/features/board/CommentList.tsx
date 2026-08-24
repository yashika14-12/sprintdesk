import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCommentsQuery } from '@/hooks/queries/useCommentsQuery';
import { useAddCommentMutation } from '@/hooks/queries/useAddCommentMutation';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import type { RootState } from '@/app/store';
import { useSelector } from 'react-redux';

export interface CommentListProps {
  taskId: number;
}

export function CommentList({ taskId }: CommentListProps) {
  const { data: comments, isLoading } = useCommentsQuery(taskId);
  const { data: users } = useUsersQuery();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const addCommentMutation = useAddCommentMutation(taskId);
  const [message, setMessage] = useState('');

  const usersById = new Map((users ?? []).map((user) => [user.id, user]));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    addCommentMutation.mutate(
      { authorId: currentUser?.id ?? 1, message: message.trim() },
      { onSuccess: () => setMessage('') },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Comments</h3>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <ul className="flex flex-col gap-2">
          {(comments ?? []).map((comment) => (
            <li key={comment.id} className="rounded-md bg-gray-50 p-2 text-sm dark:bg-gray-700">
              <p className="text-gray-800 dark:text-gray-100">{comment.message}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {usersById.get(comment.authorId)?.name ?? 'Unknown'}
              </p>
            </li>
          ))}
          {comments?.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Add a comment"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
        <Button type="submit" isLoading={addCommentMutation.isPending}>
          Post
        </Button>
      </form>
    </div>
  );
}
