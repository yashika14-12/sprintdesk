# SprintDesk

A sprint management dashboard for software teams — authentication, a drag-and-drop
Kanban board, sprint analytics, and a polling-based notification system.

Built with React 18, TypeScript (strict), Vite, Redux Toolkit, TanStack Query v5,
Tailwind CSS, React Router v6, @dnd-kit, and Recharts.

## Getting started

```bash
npm install
npm run dev      # start the dev server (prints the local URL)
npm run build    # type-check and produce a production build in dist/
npm run preview  # serve the production build locally
npm run test:run # run the full test suite once
npm run test     # run tests in watch mode
```

No environment variables are required — the app talks to two public,
credential-free APIs (DummyJSON for auth, JSONPlaceholder for notification
polling) and to its own bundled mock dataset.

**Test account** (DummyJSON's standard demo user):

- Username: `emilys`
- Password: `emilyspass`

## What's implemented

- **Authentication** — DummyJSON login, an access token kept in memory only,
  a refresh token in `localStorage`, an `authenticatedFetch` interceptor that
  attaches the Bearer token and silently refreshes-and-retries once on a 401,
  protected/public-only routes, and a full-screen loading state while an
  existing session is validated on load.
- **Kanban board** — the first 30 tasks from the provided mock data, drag-and-drop
  across all four columns (`@dnd-kit/core`), a task drawer for viewing/editing
  and commenting, task creation, and delete-with-confirmation. Task and comment
  edits persist across reloads via a small localStorage-backed simulated
  backend layered on top of the read-only mock data (see
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)); column order persists via
  Redux + `redux-persist`.
- **Analytics** — Sprint Velocity, Task Status, Priority Breakdown, and
  Completion Trend, all derived live from the same task/sprint data the board
  uses (never hardcoded), built with Recharts and responsive down to a 375px
  viewport.
- **Notifications** — polls JSONPlaceholder for new posts, pausing while the
  browser tab is hidden and resuming when it's visible again; a bell with an
  unread badge, a panel with mark-as-read / mark-all-as-read and pagination
  past 20 items, and a toast when new notifications arrive while the panel is
  closed.
- **Design system** — Button, Input, Select, Modal, Toast/`useToast`,
  DataTable, and Skeleton, built from scratch on Tailwind, no external
  component library.
- **Theming** — a light/dark toggle wired through Tailwind's class-based dark
  mode and persisted.

## Required unit tests

`npm run test:run` covers, among others, the three targets the assignment
calls out specifically:

- `src/components/ui/useToast.test.ts`
- `src/features/board/boardSlice.test.ts` (add / move / delete)
- `src/services/httpClient.test.ts` (auth interceptor: Bearer attach, 401 →
  refresh → retry, concurrent-refresh dedup, refresh failure)

## Performance & accessibility

Measured with Lighthouse against a production build (`npm run build && npm run
preview`), both authenticated and unauthenticated:

| Page | Performance | Accessibility |
|---|---|---|
| `/login` | 99 | 100 |
| `/board` | 90 | 100 |
| `/analytics` | 90 | 100 |

(Targets: Performance ≥ 88, Accessibility ≥ 92.)

## Known limitations / what I'd do with more time

- **Bonus features are intentionally out of scope**: Remember Me, a password
  strength meter, undo-last-drag, board filtering by priority/assignee,
  keyboard-accessible drag-and-drop, Storybook, and axe-core testing were all
  left out per the assignment's own scope-discipline guidance, in favor of a
  focused, fully-working required feature set.
- **Real-time notifications are simulated by polling**, per the assignment —
  JSONPlaceholder's `/posts` list never actually changes, so the poll widens
  its requested page size by one post each cycle to keep surfacing "new"
  items for demo purposes; a real backend would push genuinely new data.
- **DummyJSON session lifetime is shortened to ~1 minute** (`expiresInMins`)
  so the silent-refresh flow is observable in a normal demo session instead
  of requiring a 30+ minute wait.
- With more time: a table-view fallback for the charts, keyboard-operable
  drag-and-drop, and Storybook documentation for the component library.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture,
  layering, state ownership, and data flow.
- [`docs/API.md`](docs/API.md) — every external and internal data endpoint
  the app talks to, with request/response shapes.
