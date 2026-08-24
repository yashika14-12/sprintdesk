import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/useToast';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useUpdateTaskMutation } from '@/hooks/queries/useUpdateTaskMutation';
import { CommentList } from './CommentList';
import type { Task } from '@/types/task';

export interface TaskDrawerProps {
  taskId: number | null;
  onClose: () => void;
  onRequestDelete: (taskId: number) => void;
}

const PRIORITY_OPTIONS: { value: Task['priority']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskDrawer({ taskId, onClose, onRequestDelete }: TaskDrawerProps) {
  const { data: tasks, isLoading } = useTasksQuery();
  const { data: users } = useUsersQuery();
  const updateTaskMutation = useUpdateTaskMutation();
  const { showToast } = useToast();

  const task = tasks?.find((candidate) => candidate.id === taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (taskId !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [taskId, onClose]);

  if (taskId === null) return null;

  function saveField(patch: Partial<Task>) {
    if (!task) return;
    updateTaskMutation.mutate(
      { id: task.id, patch },
      { onError: () => showToast('Failed to save changes', 'error') },
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        {isLoading || !task ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <>
            <div className="flex items-start justify-between">
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => title !== task.title && saveField({ title })}
              />
              <Button variant="ghost" onClick={onClose} aria-label="Close task details">
                ✕
              </Button>
            </div>

            <Input
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => description !== task.description && saveField({ description })}
            />

            <Select
              label="Status"
              value={task.status}
              onChange={(value) => saveField({ status: value as Task['status'] })}
              options={[
                { value: 'backlog', label: 'Backlog' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'done', label: 'Done' },
              ]}
            />

            <Select
              label="Priority"
              value={task.priority}
              onChange={(value) => saveField({ priority: value as Task['priority'] })}
              options={PRIORITY_OPTIONS}
            />

            <Select
              label="Assignee"
              value={String(task.assigneeId)}
              onChange={(value) => saveField({ assigneeId: Number(value) })}
              options={(users ?? []).map((user) => ({ value: String(user.id), label: user.name }))}
            />

            <Input
              label="Due date"
              type="date"
              value={task.dueDate}
              onChange={(event) => saveField({ dueDate: event.target.value })}
            />

            <hr className="border-gray-200 dark:border-gray-700" />

            <CommentList taskId={task.id} />

            <div className="mt-auto flex justify-end">
              <Button variant="danger" onClick={() => onRequestDelete(task.id)}>
                Delete task
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
