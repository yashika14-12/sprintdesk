import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskStatus } from '@/types/task';

export const BOARD_COLUMNS: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

export interface BoardState {
  columns: Record<TaskStatus, number[]>;
}

const initialState: BoardState = {
  columns: {
    backlog: [],
    'in-progress': [],
    review: [],
    done: [],
  },
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    /** Keeps column membership in sync with the latest server-fetched tasks, without disturbing existing order. */
    syncBoardWithTasks(state, action: PayloadAction<Task[]>) {
      const tasks = action.payload;
      const incomingIds = new Set(tasks.map((task) => task.id));
      const knownIds = new Set(Object.values(state.columns).flat());

      for (const column of BOARD_COLUMNS) {
        state.columns[column] = state.columns[column].filter((id) => incomingIds.has(id));
      }

      const newTasks = [...tasks]
        .filter((task) => !knownIds.has(task.id))
        .sort((a, b) => a.order - b.order);

      for (const task of newTasks) {
        state.columns[task.status].push(task.id);
      }
    },

    addTaskToColumn(state, action: PayloadAction<{ taskId: number; column: TaskStatus }>) {
      const { taskId, column } = action.payload;
      state.columns[column].push(taskId);
    },

    moveTask(
      state,
      action: PayloadAction<{ taskId: number; fromColumn: TaskStatus; toColumn: TaskStatus; toIndex: number }>,
    ) {
      const { taskId, fromColumn, toColumn, toIndex } = action.payload;
      state.columns[fromColumn] = state.columns[fromColumn].filter((id) => id !== taskId);
      state.columns[toColumn].splice(toIndex, 0, taskId);
    },

    removeTaskFromColumn(state, action: PayloadAction<{ taskId: number }>) {
      for (const column of BOARD_COLUMNS) {
        state.columns[column] = state.columns[column].filter((id) => id !== action.payload.taskId);
      }
    },
  },
});

export const { syncBoardWithTasks, addTaskToColumn, moveTask, removeTaskFromColumn } = boardSlice.actions;
export const boardReducer = boardSlice.reducer;
