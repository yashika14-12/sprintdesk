import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import type { User } from '@/types/user';

const PRIORITY_CLASSES: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export interface TaskCardProps {
  task: Task;
  assignee: User | undefined;
  onOpen: (taskId: number) => void;
}

export function TaskCard({ task, assignee, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task.id);
        }
      }}
      className={`cursor-pointer rounded-md border border-gray-200 bg-white p-3 shadow-sm hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_CLASSES[task.priority]}`}>
          {task.priority}
        </span>
        <span>{task.dueDate}</span>
      </div>
      {assignee && (
        <div className="mt-2 flex items-center gap-2">
          <img src={assignee.avatar} alt={assignee.name} className="h-5 w-5 rounded-full" />
          <span className="text-xs text-gray-600 dark:text-gray-300">{assignee.name}</span>
        </div>
      )}
    </div>
  );
}
