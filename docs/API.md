# SprintDesk — API Reference

SprintDesk has no backend of its own. This document covers the two external
APIs it calls over the network, and the internal service-layer functions
that stand in for a backend against the bundled mock dataset (documented
here in REST-endpoint style since that's the shape they'd take on a real
backend — see `docs/ARCHITECTURE.md` for why this layer exists).

## External APIs

### DummyJSON — authentication

Base URL: `https://dummyjson.com`

#### `POST /auth/login`

Request:

```json
{ "username": "emilys", "password": "emilyspass", "expiresInMins": 1 }
```

Response `200`:

```json
{
  "id": 1, "username": "emilys", "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily", "lastName": "Johnson", "image": "https://...",
  "accessToken": "<jwt>", "refreshToken": "<jwt>"
}
```

Response `400`: invalid credentials.

#### `POST /auth/refresh`

Request:

```json
{ "refreshToken": "<jwt>", "expiresInMins": 1 }
```

Response `200`:

```json
{ "accessToken": "<jwt>", "refreshToken": "<jwt>" }
```

#### `GET /auth/me`

Header: `Authorization: Bearer <accessToken>`

Response `200`: the same user fields as `/auth/login`, without the tokens.
Used by `SessionBootstrap` to restore `user` after a silent refresh.

### JSONPlaceholder — notification polling

Base URL: `https://jsonplaceholder.typicode.com`

#### `GET /posts?_limit={n}`

Response `200`: an array of `{ id, title, body }`. Polled on an interval by
`useNotificationsPolling`; `n` grows by one each poll so previously-seen
posts can be diffed against to simulate "new" arrivals (see README's Known
Limitations). Each unseen post becomes a `Notification` with
`message = post.title`.

## Internal service layer

All of the following are plain async TypeScript functions (not real HTTP
routes) reading from/writing to `public/mock-data.json` and a
localStorage-backed working copy. Documented endpoint-style for clarity.

### Tasks (`services/tasks.service.ts`)

| Function | Equivalent | Request | Response |
|---|---|---|---|
| `getTasks()` | `GET /tasks` | — | `Task[]` |
| `createTask(input)` | `POST /tasks` | `{ title, description, priority, assigneeId, dueDate, sprintId }` | `Task` (status defaults to `backlog`) |
| `updateTask(id, patch)` | `PATCH /tasks/:id` | any subset of `Task`'s editable fields | updated `Task` |
| `deleteTask(id)` | `DELETE /tasks/:id` | — | — |

`Task` shape:

```ts
{
  id: number; title: string; description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: number; dueDate: string; sprintId: number; order: number;
  createdAt: string; completedAt: string | null; updatedAt: string;
}
```

### Comments (`services/comments.service.ts`)

| Function | Equivalent | Request | Response |
|---|---|---|---|
| `getCommentsForTask(taskId)` | `GET /tasks/:id/comments` | — | `Comment[]` |
| `addComment(taskId, authorId, message)` | `POST /tasks/:id/comments` | `{ authorId, message }` | `Comment` |

### Users & sprints (read-only)

| Function | Equivalent | Response |
|---|---|---|
| `users.service.ts#getUsers()` | `GET /users` | `User[]` |
| `sprints.service.ts#getSprints()` | `GET /sprints` | `Sprint[]` |

### Notifications seed (`services/notificationSeed.service.ts`)

| Function | Equivalent | Response |
|---|---|---|
| `getInitialNotifications()` | `GET /notifications` | `Notification[]` (the 4 items from `mock-data.json`, used once to seed `notificationsSlice`) |
