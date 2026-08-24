import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
  type WebStorage,
} from 'redux-persist';
import { themeReducer } from '@/features/theme/themeSlice';
import { authReducer } from '@/features/auth/authSlice';
import { boardReducer } from '@/features/board/boardSlice';
import { notificationsReducer } from '@/features/notifications/notificationsSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  board: boardReducer,
  notifications: notificationsReducer,
});

const storage: WebStorage = {
  getItem: (key) => new Promise((resolve) => resolve(window.localStorage.getItem(key))),
  setItem: (key, value) => new Promise((resolve) => resolve(window.localStorage.setItem(key, value))),
  removeItem: (key) => new Promise((resolve) => resolve(window.localStorage.removeItem(key))),
};

const persistConfig = {
  key: 'sprintdesk',
  storage,
  whitelist: ['theme', 'board', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
