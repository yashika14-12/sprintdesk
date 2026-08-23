# SprintDesk — Phase 1: Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the SprintDesk project — Vite/React/TypeScript-strict scaffold, Tailwind, path aliases, Vitest/RTL, Redux Toolkit + redux-persist, TanStack Query, a read-only mock-data pipeline (types → service layer → query hooks), and a lazy-loaded router — so every later phase (design system, auth, board, analytics, notifications) builds on working, tested infrastructure instead of inventing it ad hoc.

**Architecture:** Redux Toolkit owns client state (this phase wires the store + one real slice, `theme`, to prove the pattern); TanStack Query owns server state via a service layer that reads from `public/mock-data.json` through a cached, latency-simulating `mockDataSource`. Components never call `fetch` or import a service directly — only query hooks and Redux slices.

**Tech Stack:** React 18, TypeScript strict, Vite, Tailwind CSS v3, React Router v6, Redux Toolkit + redux-persist + react-redux, TanStack Query v5, Vitest + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-23-sprintdesk-design.md`

## Global Constraints

- Framework: React 18+. Language: TypeScript with strict mode. Build tool: Vite.
- Global client state: **Redux Toolkit** (this project replaces the spec's Zustand references with Redux Toolkit — see design spec §1).
- Styling: Tailwind CSS v3+. Routing: React Router v6+. Server state: TanStack Query v5.
- Testing: Vitest + React Testing Library; all tests must pass via `npm run test`.
- Not permitted: Next.js, Remix, Create React App, Angular, Vue, MUI, Ant Design, Chakra UI, Shadcn UI, other external UI component libraries, react-beautiful-dnd, Zustand.
- Only required features are in scope this pass (design spec §2) — no bonus features.
- No dead code: no unused components/hooks/utilities/imports/variables, no commented-out code, no unused dependencies.
- `mock-data.json` must not be modified — only read from `public/mock-data.json` unchanged.

---

### Task 1: Project scaffold — Vite, TypeScript strict, Tailwind, path alias, Vitest/RTL

**Files:**
- Create (generator + edits): `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/main.tsx`, `src/App.tsx` (temporary placeholder, replaced in Task 5), `src/test/setup.ts`, `src/App.test.tsx` (temporary, deleted in Task 5)
- Modify: `.gitignore` (generator default is fine as-is)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a buildable, testable Vite project; the `@/` → `src/` path alias used by every subsequent task's imports; `npm run dev`, `npm run build`, `npm run test`, `npm run test:run` scripts.

- [ ] **Step 1: Scaffold via create-vite into a temp dir, then move into the repo root**

```bash
npm create vite@latest _scaffold_tmp -- --template react-ts
shopt -s dotglob
mv _scaffold_tmp/* .
rmdir _scaffold_tmp
```

- [ ] **Step 2: Install runtime and dev dependencies**

```bash
npm install react-router-dom@6 @reduxjs/toolkit react-redux redux-persist @tanstack/react-query
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 3: Configure Tailwind**

```bash
npx tailwindcss init -p
```

Edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Configure the `@/` path alias**

Edit `tsconfig.app.json`, add inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Replace `vite.config.ts` with:

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 5: Add the Vitest setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` `"scripts"`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 6: Replace the generator's placeholder App**

Replace `src/App.tsx`:

```tsx
export default function App() {
  return <h1 className="p-4 text-xl font-semibold">SprintDesk</h1>;
}
```

Delete `src/App.css` and remove its import from `src/App.tsx` (already omitted above). Delete `src/assets/react.svg` if present.

- [ ] **Step 7: Write a smoke test for the placeholder**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App placeholder', () => {
  it('renders the SprintDesk heading', () => {
    render(<App />);
    expect(screen.getByText('SprintDesk')).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run the test and verify it passes**

Run: `npm run test:run`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 9: Verify the production build succeeds**

Run: `npm run build`
Expected: build completes with no TypeScript or bundling errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite/React/TS project with Tailwind, path alias, Vitest"
```

---

### Task 2: Redux store + redux-persist + `theme` slice

**Files:**
- Create: `src/app/store.ts`, `src/features/theme/themeSlice.ts`, `src/features/theme/themeSlice.test.ts`

**Interfaces:**
- Consumes: nothing beyond the scaffold.
- Produces: `store`, `persistor`, `RootState`, `AppDispatch` (from `src/app/store.ts`); `themeReducer`, `setTheme(mode)`, `toggleTheme()` (from `src/features/theme/themeSlice.ts`). Later phases (auth, board, notifications) add their reducers into `combineReducers` and their persisted slice names into the `whitelist` array in `store.ts` — this file is extended, not rewritten, by those plans.

- [ ] **Step 1: Write the failing test for the theme slice**

Create `src/features/theme/themeSlice.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { themeReducer, setTheme, toggleTheme } from './themeSlice';

describe('themeSlice', () => {
  it('defaults to light mode', () => {
    const state = themeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('light');
  });

  it('setTheme sets the mode explicitly', () => {
    const state = themeReducer({ mode: 'light' }, setTheme('dark'));
    expect(state.mode).toBe('dark');
  });

  it('toggleTheme flips light to dark and back', () => {
    const afterFirst = themeReducer({ mode: 'light' }, toggleTheme());
    expect(afterFirst.mode).toBe('dark');
    const afterSecond = themeReducer(afterFirst, toggleTheme());
    expect(afterSecond.mode).toBe('light');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- themeSlice`
Expected: FAIL — `./themeSlice` has no exported member.

- [ ] **Step 3: Implement the theme slice**

Create `src/features/theme/themeSlice.ts`:

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:run -- themeSlice`
Expected: PASS, 3 tests.

- [ ] **Step 5: Implement the store**

Create `src/app/store.ts`:

```ts
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
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { themeReducer } from '@/features/theme/themeSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
});

const persistConfig = {
  key: 'sprintdesk',
  storage,
  whitelist: ['theme'],
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
```

- [ ] **Step 6: Verify the whole project still type-checks and builds**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/store.ts src/features/theme
git commit -m "feat: add Redux store with redux-persist and theme slice"
```

---

### Task 3: Domain types + mock data source

**Files:**
- Create: `public/mock-data.json`, `src/types/user.ts`, `src/types/sprint.ts`, `src/types/task.ts`, `src/types/comment.ts`, `src/types/notification.ts`, `src/services/mockDataSource.ts`, `src/services/mockDataSource.test.ts`, `src/app/queryClient.ts`

**Interfaces:**
- Consumes: nothing beyond the scaffold.
- Produces: `User`, `Sprint`, `Task` (+ `TaskStatus`, `TaskPriority`), `Comment`, `Notification` types; `MockData` interface; `getMockData(): Promise<MockData>` and `__resetMockDataCache(): void` (test-only) from `mockDataSource.ts`; `queryClient` (a configured `QueryClient`) from `queryClient.ts`. Task 4's services call `getMockData()`. This task is read-only — mutation/persistence support for tasks/comments is added in the Board phase plan, not here.

- [ ] **Step 1: Add the provided mock data file unchanged**

Create `public/mock-data.json` with exactly the JSON content provided in the assignment's `mock-data.json` (users, sprints, tasks, comments, notifications — 6 users, 3 sprints, 30 tasks, 5 comments, 4 notifications). Do not reformat or alter any field.

- [ ] **Step 2: Add the domain types**

Create `src/types/user.ts`:

```ts
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}
```

Create `src/types/sprint.ts`:

```ts
export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}
```

Create `src/types/task.ts`:

```ts
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}
```

Create `src/types/comment.ts`:

```ts
export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}
```

Create `src/types/notification.ts`:

```ts
export type NotificationType = 'task' | 'review';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
```

- [ ] **Step 3: Write the failing tests for the mock data source**

Create `src/services/mockDataSource.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetMockDataCache, getMockData } from './mockDataSource';

const sampleData = {
  users: [],
  sprints: [],
  tasks: [],
  comments: [],
  notifications: [],
};

describe('mockDataSource', () => {
  beforeEach(() => {
    __resetMockDataCache();
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fetches /mock-data.json and returns the parsed data', async () => {
    const promise = getMockData();
    await vi.runAllTimersAsync();
    const data = await promise;
    expect(data).toEqual(sampleData);
    expect(fetch).toHaveBeenCalledWith('/mock-data.json');
  });

  it('caches the result so a second call does not refetch', async () => {
    const first = getMockData();
    await vi.runAllTimersAsync();
    await first;
    await getMockData();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const promise = getMockData().catch((error: Error) => error);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('Failed to load mock data: 500');
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm run test:run -- mockDataSource`
Expected: FAIL — `./mockDataSource` module not found.

- [ ] **Step 5: Implement the mock data source**

Create `src/services/mockDataSource.ts`:

```ts
import type { Comment } from '@/types/comment';
import type { Notification } from '@/types/notification';
import type { Sprint } from '@/types/sprint';
import type { Task } from '@/types/task';
import type { User } from '@/types/user';

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
}

const SIMULATED_LATENCY_MS = 400;

let cachedData: Promise<MockData> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMockData(): Promise<MockData> {
  if (!cachedData) {
    cachedData = fetch('/mock-data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load mock data: ${response.status}`);
        }
        return response.json() as Promise<MockData>;
      })
      .then(async (data) => {
        await delay(SIMULATED_LATENCY_MS);
        return data;
      });
  }
  return cachedData;
}

export function __resetMockDataCache(): void {
  cachedData = null;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run test:run -- mockDataSource`
Expected: PASS, 3 tests.

- [ ] **Step 7: Add the TanStack Query client**

Create `src/app/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 8: Commit**

```bash
git add public/mock-data.json src/types src/services/mockDataSource.ts src/services/mockDataSource.test.ts src/app/queryClient.ts
git commit -m "feat: add domain types, mock data source, and query client"
```

---

### Task 4: Read-only service layer + query hooks

**Files:**
- Create: `src/services/tasks.service.ts`, `src/services/users.service.ts`, `src/services/sprints.service.ts`, `src/hooks/queries/useTasksQuery.ts`, `src/hooks/queries/useUsersQuery.ts`, `src/hooks/queries/useSprintsQuery.ts`, `src/hooks/queries/useTasksQuery.test.tsx`, `src/test/test-utils.ts`

**Interfaces:**
- Consumes: `getMockData()` (Task 3), `Task`/`User`/`Sprint` types (Task 3).
- Produces: `getTasks()`, `getUsers()`, `getSprints()`; `useTasksQuery()`, `useUsersQuery()`, `useSprintsQuery()` (each returning a TanStack Query `UseQueryResult`); `createTestQueryClient()` test helper, reused by every later phase's hook tests. Board phase adds `comments.service.ts` plus create/update/delete mutations on top of `tasks.service.ts` — not built here. The first future test that renders (not `renderHook`s) a component needing a query client adds a `renderWithQueryClient()` helper to this same file — not added now because nothing in this phase would call it, and an unused export would violate the spec's dead-code rule.

- [ ] **Step 1: Write the failing test for `useTasksQuery`**

Create `src/test/test-utils.ts`:

```tsx
import { QueryClient } from '@tanstack/react-query';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}
```

Create `src/hooks/queries/useTasksQuery.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/test-utils';
import type { Task } from '@/types/task';
import * as tasksService from '@/services/tasks.service';
import { useTasksQuery } from './useTasksQuery';

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Sample task',
    description: 'A sample task for testing.',
    status: 'backlog',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-08-01',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

describe('useTasksQuery', () => {
  it('resolves to the tasks returned by the tasks service', async () => {
    vi.spyOn(tasksService, 'getTasks').mockResolvedValue(sampleTasks);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useTasksQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sampleTasks);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- useTasksQuery`
Expected: FAIL — `./useTasksQuery` module not found.

- [ ] **Step 3: Implement the services**

Create `src/services/tasks.service.ts`:

```ts
import type { Task } from '@/types/task';
import { getMockData } from './mockDataSource';

export async function getTasks(): Promise<Task[]> {
  const data = await getMockData();
  return data.tasks;
}
```

Create `src/services/users.service.ts`:

```ts
import type { User } from '@/types/user';
import { getMockData } from './mockDataSource';

export async function getUsers(): Promise<User[]> {
  const data = await getMockData();
  return data.users;
}
```

Create `src/services/sprints.service.ts`:

```ts
import type { Sprint } from '@/types/sprint';
import { getMockData } from './mockDataSource';

export async function getSprints(): Promise<Sprint[]> {
  const data = await getMockData();
  return data.sprints;
}
```

- [ ] **Step 4: Implement the query hooks**

Create `src/hooks/queries/useTasksQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/services/tasks.service';

export const tasksQueryKey = ['tasks'] as const;

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: getTasks,
  });
}
```

Create `src/hooks/queries/useUsersQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/services/users.service';

export const usersQueryKey = ['users'] as const;

export function useUsersQuery() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: getUsers,
  });
}
```

Create `src/hooks/queries/useSprintsQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { getSprints } from '@/services/sprints.service';

export const sprintsQueryKey = ['sprints'] as const;

export function useSprintsQuery() {
  return useQuery({
    queryKey: sprintsQueryKey,
    queryFn: getSprints,
  });
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test:run -- useTasksQuery`
Expected: PASS, 1 test.

- [ ] **Step 6: Run the full test suite**

Run: `npm run test:run`
Expected: all tests across all files PASS (App placeholder, themeSlice, mockDataSource, useTasksQuery).

- [ ] **Step 7: Commit**

```bash
git add src/services/tasks.service.ts src/services/users.service.ts src/services/sprints.service.ts src/hooks/queries src/test/test-utils.ts
git commit -m "feat: add read-only tasks/users/sprints service layer and query hooks"
```

---

### Task 5: Router, route stubs, and App shell wiring

**Files:**
- Create: `src/routes/LoginPage.tsx`, `src/routes/DashboardPage.tsx`, `src/routes/BoardPage.tsx`, `src/routes/AnalyticsPage.tsx`, `src/app/router.tsx`, `src/app/App.tsx`, `src/app/App.test.tsx`
- Modify: `src/main.tsx`
- Delete: `src/App.tsx`, `src/App.test.tsx` (Task 1's temporary placeholder and its test)

**Interfaces:**
- Consumes: `store`/`persistor` (Task 2), `queryClient` (Task 3).
- Produces: `App` (named export from `src/app/App.tsx`) — the root component `main.tsx` renders. Auth phase wraps `/dashboard`, `/board`, `/analytics` in `ProtectedRoute` and `/login` in `PublicOnlyRoute` by editing `src/app/router.tsx`; it also replaces each route stub's placeholder body with the real page, one phase at a time — this task's stubs are intentionally temporary and are expected to be edited, not deleted, by later phases.

- [ ] **Step 1: Write the route stub pages**

Create `src/routes/LoginPage.tsx`:

```tsx
export default function LoginPage() {
  return <div className="p-4">Login page placeholder</div>;
}
```

Create `src/routes/DashboardPage.tsx`:

```tsx
export default function DashboardPage() {
  return <div className="p-4">Dashboard page placeholder</div>;
}
```

Create `src/routes/BoardPage.tsx`:

```tsx
export default function BoardPage() {
  return <div className="p-4">Board page placeholder</div>;
}
```

Create `src/routes/AnalyticsPage.tsx`:

```tsx
export default function AnalyticsPage() {
  return <div className="p-4">Analytics page placeholder</div>;
}
```

- [ ] **Step 2: Write the router**

Create `src/app/router.tsx`:

```tsx
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const LoginPage = lazy(() => import('@/routes/LoginPage'));
const DashboardPage = lazy(() => import('@/routes/DashboardPage'));
const BoardPage = lazy(() => import('@/routes/BoardPage'));
const AnalyticsPage = lazy(() => import('@/routes/AnalyticsPage'));

function RouteFallback() {
  return <div className="flex h-screen items-center justify-center">Loading…</div>;
}

function withSuspense(children: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/dashboard', element: withSuspense(<DashboardPage />) },
  { path: '/board', element: withSuspense(<BoardPage />) },
  { path: '/analytics', element: withSuspense(<AnalyticsPage />) },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 3: Write the App shell**

Create `src/app/App.tsx`:

```tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistor, store } from './store';
import { queryClient } from './queryClient';
import { AppRouter } from './router';

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
```

- [ ] **Step 4: Delete the temporary placeholder App**

```bash
rm src/App.tsx src/App.test.tsx
```

- [ ] **Step 5: Wire `main.tsx` to the real App**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Write the failing integration smoke test**

Create `src/app/App.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('boots the provider tree and redirects the root route to the dashboard placeholder', async () => {
    render(<App />);
    expect(await screen.findByText(/dashboard page placeholder/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test to verify it fails first (before the file existed it would error; re-run now to confirm the real assertion passes cleanly)**

Run: `npm run test:run -- App`
Expected: PASS (the App shell already exists from Step 3, so this step is the confirming run, not a red/green cycle — the meaningful gate is Step 8's full-suite run).

- [ ] **Step 8: Run the full test suite and the production build**

Run: `npm run test:run`
Expected: all test files PASS (themeSlice, mockDataSource, useTasksQuery, App).

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add router, route stubs, and wire App shell with Redux/persist/Query providers"
```

---

## What this plan intentionally defers

These are real requirements from the spec, not omissions — each is picked up by the named future plan so it's built once, in the phase that actually needs it, against real (not guessed) neighboring code:

- `authSlice`, `httpClient` (Bearer attach + 401 refresh/retry), `auth.service.ts`, `ProtectedRoute`/`PublicOnlyRoute`, `SessionBootstrap` → **Auth phase plan**.
- `boardSlice`, mutable/localStorage-backed task+comment persistence layered on top of `mockDataSource`, `comments.service.ts`, drag-and-drop, task drawer/modal → **Board phase plan**.
- `notificationsSlice`, `notifications.service.ts`, polling hook → **Notifications phase plan**.
- `components/ui/*` (Button, Input, Select, Modal, Toast/`useToast`, DataTable, Skeleton) → **Design System phase plan**; the route `Suspense` fallback and any manual loading UI are upgraded from the plain-text placeholder to `Skeleton` once it exists.
- Chart components and analytics selectors → **Analytics phase plan**.
- `React.memo`/`useMemo`/`useCallback` pass, Lighthouse pass, README/architecture/API docs → **Cross-cutting phase plan**, done last against the finished app.
