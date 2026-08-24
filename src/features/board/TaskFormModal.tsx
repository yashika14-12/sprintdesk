import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/useToast';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useCreateTaskMutation } from '@/hooks/queries/useCreateTaskMutation';
import type { Task } from '@/types/task';

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSprintId: number;
}

const PRIORITY_OPTIONS: { value: Task['priority']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskFormModal({ isOpen, onClose, defaultSprintId }: TaskFormModalProps) {
  const { data: users } = useUsersQuery();
  const createTaskMutation = useCreateTaskMutation();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const userOptions = (users ?? []).map((user) => ({ value: String(user.id), label: user.name }));

  function resetForm() {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssigneeId('');
    setDueDate('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assigneeId) {
      showToast('Please choose an assignee', 'error');
      return;
    }

    createTaskMutation.mutate(
      {
        title,
        description,
        priority,
        assigneeId: Number(assigneeId),
        dueDate,
        sprintId: defaultSprintId,
      },
      {
        onSuccess: () => {
          showToast('Task created', 'success');
          resetForm();
          onClose();
        },
        onError: () => {
          showToast('Failed to create task', 'error');
        },
      },
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <Input
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={(value) => setPriority(value as Task['priority'])} />
        <Select
          label="Assignee"
          options={[{ value: '', label: 'Select an assignee' }, ...userOptions]}
          value={assigneeId}
          onChange={setAssigneeId}
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTaskMutation.isPending}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
