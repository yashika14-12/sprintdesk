import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/auth';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionEstablished(state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
    },
    accessTokenRefreshed(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    sessionCleared(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { sessionEstablished, accessTokenRefreshed, sessionCleared } = authSlice.actions;
export const authReducer = authSlice.reducer;
