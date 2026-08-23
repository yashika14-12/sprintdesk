# SprintDesk — Design Spec

Date: 2026-08-23
Status: Approved

## 1. Overview

SprintDesk is a single-page sprint management dashboard (React 18 + TypeScript
strict + Vite) built against the "Frontend Assignment — SprintDesk" brief.
It provides authentication, a drag-and-drop Kanban board, an analytics
dashboard, a polling-based notification system, and a from-scratch Tailwind
component library.

**Deviation from the brief, agreed with the candidate's stakeholder:** the
brief specifies Zustand for client/application state. This implementation
uses **Redux Toolkit** instead, everywhere the brief calls for Zustand
(auth, board, notifications, theme). TanStack Query v5 still owns all
server/API state — Redux Toolkit is not used as a data-fetching layer.

## 2. Scope

Only the **required** features of Tasks 01–06 in the brief are built.
Optional/bonus features (Remember Me, password strength meter, undo
drag-and-drop, board filtering, keyboard-accessible DnD, Storybook, axe-core
testing, PNG export, custom date-range filtering) are explicitly **out of
scope** for this pass and will be listed under "Future Improvements" in the
README, per the brief's own Scope Discipline section (7.1).

Deliverable is the codebase only: a working app runnable via `npm run dev`
and buildable via `npm run build`, plus README, architecture doc, and API
doc. Live deployment, GitHub hosting, and the screen recording are handled
by the candidate outside this implementation.

## 3. Tech Stack

| Area | Choice |
|---|---|
| Framework | React 18, TypeScript strict |
| Build | Vite |
| Client state | **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) |
| Persistence | `redux-persist` |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Drag & drop | `@dnd-kit/core` |
| Charts | Recharts |
| Testing | Vitest + React Testing Library |
| APIs | `mock-data.json` (primary data), DummyJSON (auth), JSONPlaceholder (notification polling) |

Not permitted (per brief): Next.js, Remix, CRA, Angular, Vue, MUI, Ant
Design, Chakra UI, Shadcn UI, other external UI component libraries,
react-beautiful-dnd, Zustand.

## 4. Folder Structure

```
src/
  app/
    store.ts               # configureStore, persistedReducer, persistor
    App.tsx                # providers: Redux, QueryClient, Router
    router.tsx              # route table, React.lazy route components
  routes/
    LoginPage.tsx
    DashboardPage.tsx
    BoardPage.tsx
    AnalyticsPage.tsx
  features/
    auth/
      authSlice.ts
      ProtectedRoute.tsx
      PublicOnlyRoute.tsx      # blocks authenticated users from /login
      LoginForm.tsx
      SessionBootstrap.tsx     # full-screen loader while silent refresh runs
    board/
      boardSlice.ts
      KanbanBoard.tsx
      KanbanColumn.tsx
      TaskCard.tsx
      TaskDrawer.tsx
      TaskFormModal.tsx
      DeleteConfirmDialog.tsx
      CommentList.tsx
    analytics/
      AnalyticsPage content: SprintVelocityChart.tsx, TaskStatusChart.tsx,
      PriorityBreakdownChart.tsx, CompletionTrendChart.tsx
      selectors.ts              # derive chart-ready data from board+sprint data
    notifications/
      notificationsSlice.ts
      NotificationBell.tsx
      NotificationPanel.tsx
    theme/
      themeSlice.ts
      ThemeToggle.tsx
  components/ui/
    Button.tsx, Input.tsx, Select.tsx, Modal.tsx, Toast.tsx (+ useToast.ts),
    DataTable.tsx, Skeleton.tsx
  services/
    mockDataSource.ts        # fetch+cache public/mock-data.json, simulated latency
    tasks.service.ts
    users.service.ts
    sprints.service.ts
    comments.service.ts
    auth.service.ts          # DummyJSON
    notifications.service.ts # JSONPlaceholder
    httpClient.ts            # fetch wrapper, Bearer attach, 401 refresh+retry
  hooks/queries/
    useTasksQuery.ts, useUsersQuery.ts, useSprintsQuery.ts,
    useCommentsQuery.ts (+ mutations for create/update/delete/comment),
    useLoginMutation.ts, useLogoutMutation.ts,
    useNotificationsPolling.ts
  types/
    task.ts, user.ts, sprint.ts, comment.ts, notification.ts, auth.ts
  test/
    setup.ts, test-utils.tsx (Provider wrapper for Redux+Query in tests)
public/
  mock-data.json
```

Component boundary rule: files under `components/ui/`, `features/*`, and
`routes/` never call `fetch`, import a `services/*` module directly, or
import `public/mock-data.json`. They only call hooks from
`hooks/queries/` or read/dispatch Redux slices. This is the mechanism that
satisfies brief section 7.3 (API Integration & Data Abstraction).

## 5. State Management (7.2 compliance)

**Server state — TanStack Query v5:**
- Tasks, users, sprints, comments (read from `mock-data.json` via the mock
  data source) — queries + mutations, with query invalidation on
  create/update/delete/comment.
- Auth login/refresh — mutations.
- Notification polling — a query with `refetchInterval`, paused via
  `refetchIntervalInBackground: false` combined with a
  `visibilitychange`-driven `enabled` flag.

**Client state — Redux Toolkit slices:**
- `authSlice`: `{ user, accessToken, status }`. **Not persisted** — the
  access token must not survive a hard reload; only the refresh token
  (kept outside Redux, directly in `localStorage`) allows silent
  session restoration.
- `boardSlice`: normalized `{ tasksById, columns: { backlog: id[], inProgress: id[], review: id[], done: id[] } }`, hydrated once from the first successful tasks query, then owned by Redux for reordering. Persisted via `redux-persist`.
- `notificationsSlice`: `{ itemsById, order: id[], unreadCount, page }`. Persisted.
- `themeSlice`: `{ mode: 'light' | 'dark' }`. Persisted.

**Local component state:** form field values, which modal/drawer is open,
filter/search inputs (none planned since filtering is out of scope this
pass), transient animation flags — plain `useState`, not lifted to Redux.

## 6. Data Flow

`mock-data.json` ships in `public/`. `mockDataSource.ts` fetches it once on
first use, caches the parsed object behind a module-level promise, and adds
a small artificial delay (~300–500ms) so TanStack Query's loading states are
genuinely exercised. `tasks.service.ts`, `users.service.ts`,
`sprints.service.ts`, `comments.service.ts` all read through this cache and
expose plain async functions returning typed domain objects — this is the
only place that knows the mock JSON's shape.

`auth.service.ts` and `notifications.service.ts` call real external APIs
(DummyJSON, JSONPlaceholder) through `httpClient.ts`, a thin `fetch`
wrapper that:
- attaches `Authorization: Bearer <accessToken>` from `authSlice` (read via
  the store, not React context, since the client is used outside React),
- on a simulated-expired 401, calls the refresh endpoint once using the
  refresh token from `localStorage`, updates the Redux access token, and
  retries the original request exactly once (no retry loops on repeated
  401s).

Because every consumer goes through `hooks/queries/*`, swapping
`mockDataSource` for a real backend later means changing only the
`services/*` internals — no UI change required, satisfying 7.3's "minimal
or no changes to the UI layer."

## 7. Authentication Flow (Task 01)

1. `LoginForm` posts to `POST https://dummyjson.com/auth/login` via
   `useLoginMutation`.
2. On success: access token → `authSlice` (memory only); refresh token →
   `localStorage`.
3. `SessionBootstrap` runs once at app start: if a refresh token exists in
   `localStorage`, it calls the refresh endpoint before rendering routes,
   showing a full-screen loader meanwhile; failure clears storage and
   routes to `/login`.
4. `ProtectedRoute` wraps `/dashboard`, `/board`, `/analytics`; redirects to
   `/login` when unauthenticated.
5. `PublicOnlyRoute` wraps `/login`; redirects authenticated users to
   `/dashboard`.
6. Logout clears `authSlice` and the stored refresh token, then navigates to
   `/login`.
7. `httpClient`'s 401→refresh→retry covers simulated token expiration
   during normal use (not just at boot).

## 8. Kanban Board (Task 02)

- Initial task data: first 30 tasks from `mock-data.json`, loaded via
  `useTasksQuery`, then written once into `boardSlice` (so drag/reorder
  operates on Redux-owned order arrays, while task *content* edits go
  through the query layer + mutation + invalidation).
- `@dnd-kit/core` `DndContext` on the board; `DragOverlay` for the dragged
  card; drop handlers dispatch `boardSlice` reducers: `moveTask({ taskId,
  fromColumn, toColumn, toIndex })`.
- Board state (column order) persisted via `redux-persist`; task *content*
  (title/status/assignee/etc.) stays server-state, refetched/invalidated
  through TanStack Query so a refresh always shows the latest saved values.
- `TaskDrawer` (side panel) shows full task detail + `CommentList`; editing
  a field triggers an update mutation; adding a comment triggers a create
  mutation on the comments resource.
- `TaskFormModal` for creating a task (title, priority, assignee, due
  date); `DeleteConfirmDialog` gates deletion.
- Column task counts are derived directly from `boardSlice.columns[x].length`
  — no separate counter state.

## 9. Analytics (Task 03)

`analytics/selectors.ts` derives all four chart datasets from the same
underlying task/sprint query data (never hardcoded):
- **Sprint Velocity** — completed task count grouped by `sprintId`.
- **Task Status** — count grouped by `status` (current board columns).
- **Priority Breakdown** — count grouped by `priority`, optionally split by
  column.
- **Completion Trend** — completed task count bucketed by `completedAt`
  date.

Charts re-derive automatically because selectors read from the same
TanStack Query cache / Redux board state the Kanban board mutates —
editing/moving a task and revisiting `/analytics` reflects the change with
no separate analytics fetch. Recharts `ResponsiveContainer` for the 375px
mobile requirement; Recharts' built-in animation covers "basic chart
animations."

## 10. Notifications (Task 05)

- `useNotificationsPolling` polls `GET
  https://jsonplaceholder.typicode.com/posts?_limit=5` on an interval;
  new post IDs not already in `notificationsSlice` are appended as
  unread notifications (title/message derived from the post's `title`).
- Polling pauses on `document.visibilitychange` (`hidden`) and resumes on
  visible, implemented as an `enabled`/interval gate in the query hook.
- `NotificationBell` shows unread count; `NotificationPanel` lists the
  latest 20 with pagination controls once more than 20 exist; "mark as
  read" / "mark all as read" dispatch `notificationsSlice` reducers.
- A toast (via the `components/ui/Toast` system) fires when a new
  notification arrives while the panel is closed.
- Persisted via `redux-persist` (notifications slice), per the brief.

## 11. Design System (Task 04)

Built from scratch on Tailwind, no headless-UI/Radix/etc. dependency:
`Button` (variants: primary/secondary/danger/ghost; states: default,
hover, disabled, loading), `Input` (label, error, helper text, disabled),
`Select`, `Modal` (focus trap, Escape-to-close, backdrop click),
`Toast` + `useToast` hook (queue, auto-dismiss, manual dismiss), `DataTable`
(generic column config, used at minimum for any tabular list needed),
`Skeleton` (used for board/analytics/notification loading states driven by
TanStack Query's `isLoading`).

## 12. Routing (Task 06 area)

Four routes minimum, as recommended: `/login`, `/dashboard`, `/board`,
`/analytics`. All except `/login` are behind `ProtectedRoute`. Each route
component is loaded via `React.lazy` + a shared `Suspense` boundary with a
skeleton fallback, satisfying the code-splitting requirement.

## 13. Performance & Accessibility (Task 06)

- `React.memo` on `TaskCard`, chart components; `useMemo` for derived
  analytics datasets and board column arrays; `useCallback` for drag
  handlers and mutation callbacks passed to memoized children.
- Keyboard-operable Modal/Drawer/Dropdown (focus management, Escape,
  labelled controls); form inputs always paired with `<label>`; all
  meaningful images (avatars) get descriptive `alt` text.
- Manual Lighthouse pass at the end of the build against the targets
  (Performance ≥ 88, Accessibility ≥ 92); any shortfall documented in the
  README with the specific fix that would close the gap.

## 14. Testing (Task 06 required set)

Vitest + React Testing Library, run via `npm run test`:
1. `useToast` — add/dismiss/auto-dismiss/queue behavior.
2. `boardSlice` reducers — add task, move task (within/between columns),
   delete task.
3. `httpClient` auth interceptor — attaches Bearer token; on a mocked 401,
   refreshes exactly once and retries the original request; surfaces the
   error if refresh itself fails.

## 15. Build Phases (implementation milestones)

1. **Scaffold** — Vite/React/TS strict/Tailwind/Router/Redux
   store+persist/TanStack Query client, app shell, route stubs behind
   `ProtectedRoute`, `services/`+`hooks/queries/` skeleton wired to
   `mockDataSource`.
2. **Design system** — `components/ui/*` in isolation.
3. **Auth** (Task 01).
4. **Kanban board** (Task 02).
5. **Analytics** (Task 03).
6. **Notifications** (Task 05).
7. **Cross-cutting pass** — perf/accessibility/testing sweep (Task 06),
   README, architecture doc, API doc.

## 16. Known Limitations (to disclose in README)

- Bonus features listed in §2 are intentionally not implemented.
- Lighthouse scores depend on the local machine/build; the README will
  state the measured scores and, if short, what would close the gap.
- DummyJSON/JSONPlaceholder are third-party sandboxes outside this
  project's control; transient outages affect auth/notifications demoing
  but not the app's own logic.
