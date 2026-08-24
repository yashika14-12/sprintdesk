# SprintDesk — Architecture

## Overview

SprintDesk is a client-only single-page application. There is no application
server of its own — it talks to two public third-party APIs (DummyJSON for
auth, JSONPlaceholder for notification polling) and to a bundled mock dataset
(`public/mock-data.json`) that stands in for a real backend for everything
else (users, sprints, tasks, comments, initial notifications).

## Layering

```
UI components (routes/, features/*, components/ui/)
        │  only import hooks — never fetch() or a service directly
        ▼
Query hooks (hooks/queries/*)         Redux slices (features/*/*.slice.ts)
   TanStack Query: server state          Redux Toolkit: client state
        │                                       │
        ▼                                       │
Service layer (services/*.service.ts)            │
   plain async functions, one per domain          │
        │                                       │
        ▼                                       │
Data source                                     │
   mockDataSource.ts (read-only seed data)       │
   tasksStore.ts / commentsStore.ts (mutable,    │
     localStorage-backed, seeded once from       │
     mockDataSource)                             │
   httpClient.ts (DummyJSON, Bearer + refresh)    │
   jsonPlaceholder.service.ts (polling)           │
                                                  ▼
                                          localStorage (persisted slices)
```

**The rule this enforces:** no component ever imports `fetch`, a service
module, or `mockDataSource` directly — only a query hook or a Redux
slice/selector. Replacing the mock data source with a real backend later
means changing the `services/*` layer only.

## Why two state systems, and where the line is

| State | Owner | Why |
|---|---|---|
| Tasks, users, sprints, comments, initial notifications | TanStack Query | Server-shaped data: needs loading/error states, caching, invalidation on mutation |
| Auth (`user`, in-memory `accessToken`) | Redux (`authSlice`) | Global, but explicitly **not persisted** — the access token must not survive a reload |
| Refresh token | `localStorage` directly, outside Redux | Deliberately outside the store so it isn't accidentally serialized/logged with the rest of app state |
| Kanban column order | Redux (`boardSlice`), persisted | Client-owned ordering; task *content* still comes from the query cache |
| Theme | Redux (`themeSlice`), persisted | Simple global UI state |
| Notifications (items, read state, pagination, panel open) | Redux (`notificationsSlice`), persisted | Needs to be read/written from multiple components (bell, panel, the polling hook) and outlives any one component's lifetime |
| Toast queue | A `useSyncExternalStore` singleton in `components/ui/` | Deliberately **not** Redux — the design system stays portable and has no dependency on the app's store |
| Form inputs, which modal/drawer is open, filter fields | Local `useState` | No cross-component sharing need |

The assignment's brief specifies **Zustand** for client state; this
implementation uses **Redux Toolkit** instead, everywhere the brief calls for
Zustand. TanStack Query still owns all server state exactly as specified.

## Simulating a backend without a backend

`mock-data.json` is treated as read-only (per the assignment) and is fetched
once through `mockDataSource.ts`, which adds a small artificial delay so
loading states are genuinely exercised.

Task and comment **mutations** (create/update/delete, add comment) can't be
written back to that static file, so `tasksStore.ts` / `commentsStore.ts`
seed a working copy from `mockDataSource` on first use and persist every
change to `localStorage` under their own keys (`sprintdesk:tasks`,
`sprintdesk:comments`). This is the layer a real backend would replace —
everything above it (`tasks.service.ts`, the query hooks, every component)
is unaffected by the swap.

## Auth flow

1. `LoginForm` → `useLoginMutation` → `POST /auth/login` (DummyJSON). Access
   token goes into `authSlice` (memory only); refresh token goes into
   `localStorage`.
2. `SessionBootstrap` runs once at app start: if a refresh token exists, it
   silently refreshes and fetches the current user (`GET /auth/me`) before
   rendering any route, showing a full-screen skeleton meanwhile.
3. `authenticatedFetch` (in `services/httpClient.ts`) attaches
   `Authorization: Bearer <token>` to any authenticated request. On a 401 it
   refreshes exactly once (deduping concurrent 401s into a single refresh
   call), retries the original request, and — if the refresh itself fails —
   clears the session and surfaces the error.
4. `ProtectedRoute` / `PublicOnlyRoute` gate the router based on
   `authSlice.status`.

## Board data flow

1. `useTasksQuery` reads through `tasks.service.ts` → `tasksStore.ts`.
2. On the first successful load, `KanbanBoard` dispatches
   `syncBoardWithTasks`, which places any task id it doesn't already know
   about into the column matching that task's `status` — existing column
   order for tasks it already knows about is left untouched.
3. Dragging a card dispatches `moveTask` (immediate, optimistic reordering in
   Redux) and, if the card crossed columns, fires `useUpdateTaskMutation`
   (`PATCH`-equivalent) to persist the new `status`, which invalidates the
   tasks query.
4. Creating/deleting a task goes through its own mutation, invalidates the
   tasks query, and the board's `useEffect` re-syncs column membership from
   the refreshed data.

## Routing

`/login` (public-only) and `/dashboard`, `/board`, `/analytics` (protected,
wrapped in `AppLayout`'s header/nav) are all lazy-loaded route chunks behind a
shared `Suspense` boundary. An unmatched path redirects to `/dashboard` (which
itself redirects unauthenticated visitors to `/login`).
