import { describe, expect, it } from 'vitest';
import {
  addTaskToColumn,
  boardReducer,
  type BoardState,
  moveTask,
  removeTaskFromColumn,
  syncBoardWithTasks,
} from './boardSlice';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task> & { id: number }): Task {
  return {
    title: 'Task',
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2026-09-01',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  };
}

const emptyState: BoardState = {
  columns: { backlog: [], 'in-progress': [], review: [], done: [] },
};

describe('boardSlice', () => {
  describe('syncBoardWithTasks', () => {
    it('places tasks into columns matching their status, ordered by their order field', () => {
      const tasks: Task[] = [
        makeTask({ id: 1, status: 'backlog', order: 2 }),
        makeTask({ id: 2, status: 'backlog', order: 1 }),
        makeTask({ id: 3, status: 'done', order: 1 }),
      ];

      const state = boardReducer(emptyState, syncBoardWithTasks(tasks));

      expect(state.columns.backlog).toEqual([2, 1]);
      expect(state.columns.done).toEqual([3]);
    });

    it('does not disturb the order of tasks already known to the board', () => {
      const initial: BoardState = {
        columns: { backlog: [2, 1], 'in-progress': [], review: [], done: [] },
      };
      const tasks: Task[] = [
        makeTask({ id: 1, status: 'backlog', order: 1 }),
        makeTask({ id: 2, status: 'backlog', order: 2 }),
      ];

      const state = boardReducer(initial, syncBoardWithTasks(tasks));

      expect(state.columns.backlog).toEqual([2, 1]);
    });

    it('removes tasks that are no longer present in the incoming data', () => {
      const initial: BoardState = {
        columns: { backlog: [1, 2], 'in-progress': [], review: [], done: [] },
      };
      const tasks: Task[] = [makeTask({ id: 1, status: 'backlog', order: 1 })];

      const state = boardReducer(initial, syncBoardWithTasks(tasks));

      expect(state.columns.backlog).toEqual([1]);
    });
  });

  describe('addTaskToColumn', () => {
    it('appends a new task id to the given column', () => {
      const state = boardReducer(emptyState, addTaskToColumn({ taskId: 5, column: 'backlog' }));
      expect(state.columns.backlog).toEqual([5]);
    });
  });

  describe('moveTask', () => {
    it('reorders a task within the same column', () => {
      const initial: BoardState = {
        columns: { backlog: [1, 2, 3], 'in-progress': [], review: [], done: [] },
      };

      const state = boardReducer(
        initial,
        moveTask({ taskId: 1, fromColumn: 'backlog', toColumn: 'backlog', toIndex: 2 }),
      );

      expect(state.columns.backlog).toEqual([2, 3, 1]);
    });

    it('moves a task from one column to another at the given index', () => {
      const initial: BoardState = {
        columns: { backlog: [1, 2], 'in-progress': [3], review: [], done: [] },
      };

      const state = boardReducer(
        initial,
        moveTask({ taskId: 2, fromColumn: 'backlog', toColumn: 'in-progress', toIndex: 0 }),
      );

      expect(state.columns.backlog).toEqual([1]);
      expect(state.columns['in-progress']).toEqual([2, 3]);
    });
  });

  describe('removeTaskFromColumn', () => {
    it('removes a task id from whichever column contains it', () => {
      const initial: BoardState = {
        columns: { backlog: [1, 2], 'in-progress': [], review: [], done: [] },
      };

      const state = boardReducer(initial, removeTaskFromColumn({ taskId: 2 }));

      expect(state.columns.backlog).toEqual([1]);
    });

    it('is a no-op when the task id is not present in any column', () => {
      const initial: BoardState = {
        columns: { backlog: [1], 'in-progress': [], review: [], done: [] },
      };

      const state = boardReducer(initial, removeTaskFromColumn({ taskId: 999 }));

      expect(state.columns.backlog).toEqual([1]);
    });
  });
});
