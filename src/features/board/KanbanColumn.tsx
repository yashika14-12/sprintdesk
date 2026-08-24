import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/task';
import type { User } from '@/types/user';
import { TaskCard } from './TaskCard';

const COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export interface KanbanColumnProps {
  column: TaskStatus;
  taskIds: number[];
  tasksById: Map<number, Task>;
  usersById: Map<number, User>;
  onOpenTask: (taskId: number) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  column,
  taskIds,
  tasksById,
  usersById,
  onOpenTask,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column });

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-gray-100 dark:bg-gray-800/60">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{COLUMN_LABELS[column]}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {taskIds.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex min-h-[4rem] flex-1 flex-col gap-2 p-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {taskIds.map((taskId) => {
            const task = tasksById.get(taskId);
            if (!task) return null;
            return (
              <TaskCard key={taskId} task={task} assignee={usersById.get(task.assigneeId)} onOpen={onOpenTask} />
            );
          })}
        </SortableContext>
      </div>
    </div>
  );
});
