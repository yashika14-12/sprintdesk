import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types/notification';

export const NOTIFICATIONS_PER_PAGE = 20;

export interface NotificationsState {
  items: Notification[];
  page: number;
  isPanelOpen: boolean;
}

const initialState: NotificationsState = {
  items: [],
  page: 1,
  isPanelOpen: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hydrateInitialNotifications(state, action: PayloadAction<Notification[]>) {
      if (state.items.length === 0) {
        state.items = action.payload;
      }
    },
    notificationReceived(state, action: PayloadAction<Notification>) {
      if (state.items.some((item) => item.id === action.payload.id)) return;
      state.items.unshift(action.payload);
    },
    markAsRead(state, action: PayloadAction<number>) {
      const item = state.items.find((notification) => notification.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead(state) {
      for (const item of state.items) {
        item.read = true;
      }
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPanelOpen(state, action: PayloadAction<boolean>) {
      state.isPanelOpen = action.payload;
    },
  },
});

export const { hydrateInitialNotifications, notificationReceived, markAsRead, markAllAsRead, setPage, setPanelOpen } =
  notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
