import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { RootState, AppDispatch } from '@/app/store';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useUpdateTaskMutation } from '@/hooks/queries/useUpdateTaskMutation';
import { useDeleteTaskMutation } from '@/hooks/queries/useDeleteTaskMutation';
import { useToast } from '@/components/ui/useToast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { BOARD_COLUMNS, moveTask, syncBoardWithTasks } from './boardSlice';
import type { TaskStatus } from '@/types/task';
import { KanbanColumn } from './KanbanColumn';
import { TaskDrawer } from './TaskDrawer';
import { TaskFormModal } from './TaskFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

function findColumnOfTask(columns: Record<TaskStatus, number[]>, taskId: number): TaskStatus | undefined {
  return BOARD_COLUMNS.find((column) => columns[column].includes(taskId));
}

export function KanbanBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: tasks, isLoading } = useTasksQuery();
  const { data: users } = useUsersQuery();
  const columns = useSelector((state: RootState) => state.board.columns);
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const { showToast } = useToast();

  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (tasks) {
      dispatch(syncBoardWithTasks(tasks));
    }
  }, [tasks, dispatch]);

  const tasksById = useMemo(() => new Map((tasks ?? []).map((task) => [task.id, task])), [tasks]);
  const usersById = useMemo(() => new Map((users ?? []).map((user) => [user.id, user])), [users]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = String(over.id);

    const fromColumn = findColumnOfTask(columns, activeId);
    if (!fromColumn) return;

    let toColumn: TaskStatus;
    let toIndex: number;

    if ((BOARD_COLUMNS as string[]).includes(overId)) {
      toColumn = overId as TaskStatus;
      toIndex = columns[toColumn].length;
    } else {
      const overTaskId = Number(overId);
      toColumn = findColumnOfTask(columns, overTaskId) ?? fromColumn;
      toIndex = columns[toColumn].indexOf(overTaskId);
    }

    if (toColumn === fromColumn && toIndex === columns[fromColumn].indexOf(activeId)) return;

    dispatch(moveTask({ taskId: activeId, fromColumn, toColumn, toIndex }));

    if (toColumn !== fromColumn) {
      updateTaskMutation.mutate(
        { id: activeId, patch: { status: toColumn } },
        { onError: () => showToast('Failed to save the new task status', 'error') },
      );
    }
  }

  function handleConfirmDelete() {
    if (pendingDeleteId === null) return;
    deleteTaskMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        showToast('Task deleted', 'success');
        setPendingDeleteId(null);
        setOpenTaskId(null);
      },
      onError: () => showToast('Failed to delete task', 'error'),
    });
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {BOARD_COLUMNS.map((column) => (
          <Skeleton key={column} className="h-64 w-72" />
        ))}
      </div>
    );
  }

  const pendingDeleteTask = pendingDeleteId !== null ? tasksById.get(pendingDeleteId) : undefined;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sprint board</h1>
        <Button onClick={() => setIsCreateOpen(true)}>New task</Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              column={column}
              taskIds={columns[column]}
              tasksById={tasksById}
              usersById={usersById}
              onOpenTask={setOpenTaskId}
            />
          ))}
        </div>
      </DndContext>

      <TaskDrawer
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
        onRequestDelete={(taskId) => setPendingDeleteId(taskId)}
      />

      <TaskFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} defaultSprintId={3} />

      <DeleteConfirmDialog
        isOpen={pendingDeleteId !== null}
        taskTitle={pendingDeleteTask?.title ?? ''}
        isDeleting={deleteTaskMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
