# Calendar Task Manager

A full-stack calendar application for task management with inline editing, drag-and-drop reordering, search filtering, and worldwide holiday display. Built without external calendar libraries — all calendar grid logic, time-slot management, and date math are implemented from scratch.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green)

## Features

- **Inline task editing** — create, edit, and view tasks directly inside day cells without page navigation
- **Drag & drop** — move tasks between days and reorder within a single day or hour slot
- **Three view modes** — month grid (desktop), week time-grid (desktop), and mobile compact view
- **Text search** — filter tasks by title with live highlighting of matched text
- **Worldwide holidays** — display public holidays from 12 countries, fetched from the Nager API
- **Light/dark themes** — toggle between themes with cookie-based SSR-safe persistence
- **Persistent ordering** — stable task order within each day/hour bucket, surviving page reloads

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| Next.js 16 (App Router) | Framework, SSR, routing |
| React 19 | UI rendering |
| TypeScript | Type safety |
| Emotion | CSS-in-JS styling with SSR support |
| dayjs | Date formatting and calendar math |
| Zustand | Client state management (4 slices + DnD store) |
| @dnd-kit | Drag-and-drop (core + sortable) |
| lucide-react | Icon set |

### Backend

| Technology | Role |
|---|---|
| Node.js | Runtime |
| Hono | API routing layer |
| MongoDB | Data persistence |
| zod | Input validation |
| Nager Date API | Public holiday source |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, SSR theme, Providers
│   ├── page.tsx                    # Entry page: renders CalendarShell
│   ├── providers.tsx               # Emotion cache SSR + ThemeProvider + Zustand hydration
│   ├── globals.css                 # Minimal CSS reset
│   └── api/[[...route]]/route.ts   # Next.js route handler → Hono backend
│
├── backend/
│   ├── index.ts                    # Hono app: routes, middleware
│   ├── config/
│   │   └── env.ts                  # Zod-validated env: MONGODB_URI, MONGODB_DB
│   ├── db/
│   │   ├── client.ts               # MongoDB singleton client with connection pooling
│   │   ├── collections.ts          # Collection name constants
│   │   └── indexes.ts              # Compound unique index: {day, bucket, order}
│   ├── modules/
│   │   ├── tasks/
│   │   │   ├── tasks.routes.ts     # GET/POST/PATCH/DELETE /api/tasks
│   │   │   ├── tasks.controller.ts # Request parsing, Zod validation, service calls
│   │   │   ├── tasks.service.ts    # Business logic, DTO mapping
│   │   │   ├── tasks.repository.ts # CRUD + move with order rebalancing
│   │   │   ├── tasks.types.ts      # Domain types, DB document types, DTOs
│   │   │   └── tasks.validators.ts # Zod schemas for all task inputs
│   │   └── holidays/
│   │       ├── holidays.routes.ts  # GET /api/holidays
│   │       ├── holidays.controller.ts
│   │       ├── holidays.service.ts
│   │       └── holidays.validators.ts
│   ├── integrations/
│   │   └── nager/
│   │       └── nager.client.ts     # Nager API client with timeout/abort handling
│   ├── middleware/
│   │   ├── error.middleware.ts     # Unified error → JSON response conversion
│   │   └── request-logger.middleware.ts
│   ├── utils/
│   │   ├── api-error.ts            # ApiError class (code, status, details)
│   │   ├── date.ts                 # UTC-safe ISO date helpers
│   │   ├── id.ts                   # ObjectId validation/conversion
│   │   └── sort.ts                 # Stable sort utility
│   └── types/
│       └── api.types.ts            # ApiOk / ApiErrorBody envelope types
│
├── components/
│   ├── calendar/
│   │   ├── CalendarShell.tsx        # Root client component
│   │   ├── CalendarDataSync.tsx     # Invisible: triggers data fetching
│   │   ├── StatusBar.tsx            # Busy/error/search status display
│   │   ├── layout.constants.ts      # Pixel constants for layout
│   │   ├── platform/
│   │   │   ├── DesktopCalendar.tsx   # MonthView or WeekView
│   │   │   └── MobileCalendar.tsx    # MobileView
│   │   ├── toolbar/
│   │   │   ├── Toolbar.tsx           # Top bar composition
│   │   │   ├── Logo.tsx              # Branding
│   │   │   ├── MonthNav.tsx          # Period navigation
│   │   │   ├── TodayButton.tsx       # Jump to today
│   │   │   ├── Search.tsx            # Task filter input
│   │   │   ├── ViewModeSwitcher.tsx  # Month/Week toggle
│   │   │   ├── Settings.tsx          # Theme + country popover
│   │   │   └── settings.constants.ts
│   │   └── view/
│   │       ├── MonthView.tsx         # 7-column month grid
│   │       ├── WeekView.tsx          # 24-hour time grid
│   │       ├── week-view.styles.ts
│   │       └── mobile/
│   │           ├── MobileView.tsx
│   │           ├── MobileMonthGrid.tsx
│   │           ├── MobileDayPanel.tsx
│   │           └── mobile-view.styles.ts
│   ├── dnd/
│   │   ├── DndProvider.tsx               # DndContext + sensors
│   │   ├── dnd-provider.helpers.ts       # Hit-testing, auto-scroll
│   │   ├── DraggableTask.tsx             # Sortable wrapper
│   │   ├── DroppableDay.tsx              # Day-level drop target
│   │   ├── DroppableHour.tsx             # Hour-level drop target
│   │   └── TaskDragOverlay.tsx           # Drag ghost overlay
│   ├── tasks/
│   │   ├── card/
│   │   │   ├── TaskItemCard.tsx
│   │   │   ├── TaskCardSurface.tsx       # Visual card with dots + title
│   │   │   └── parts/
│   │   │       ├── TaskTitle.tsx         # Title with search highlighting
│   │   │       └── TaskDots.tsx          # Color dot indicators
│   │   ├── cell/
│   │   │   ├── TaskDayCell.tsx           # Month-view day cell
│   │   │   ├── TaskDayCellHeader.tsx     # Date number + add button
│   │   │   ├── TaskDayCellTaskList.tsx   # Sortable task list
│   │   │   ├── TaskHourCell.tsx          # Week-view hour cell
│   │   │   └── task-hour-cell.styles.ts
│   │   └── editor/
│   │       ├── TaskInlineEditor.tsx       # View vs create/edit router
│   │       ├── TaskInlineEditorForm.tsx   # Create/edit form
│   │       ├── TaskInlineEditorView.tsx   # Read-only viewer
│   │       ├── TaskEditorPanel.tsx        # Editor orchestration
│   │       ├── TaskEditorTextarea.tsx     # Auto-resizing textarea
│   │       ├── TaskEditorActions.tsx      # Cancel/Save buttons
│   │       ├── TaskEditorErrorMessage.tsx
│   │       ├── TaskDotsPicker.tsx         # Color picker (5 presets + custom)
│   │       ├── task-inline-editor.types.ts
│   │       └── task-inline-editor.styles.ts
│   └── holidays/
│       ├── HolidaysList.tsx              # Up to 2 + "+N more" tooltip
│       └── HolidayLine.tsx               # Non-draggable holiday display
│
├── hooks/
│   ├── useTasksSync.ts              # Hydrate tasks for a date range
│   ├── useHolidays.ts               # Fetch + cache holidays
│   ├── useDndMotionQueues.ts        # RAF-batched DnD motion
│   ├── useDayTasks.ts               # Day tasks with DnD overlay
│   ├── useDaySummariesSelector.ts   # Task count + hasHoliday per day
│   ├── useClickOutside.ts           # Click-outside detection
│   └── useDebouncedValue.ts         # Value debounce
│
├── lib/
│   ├── api/
│   │   ├── http.ts                  # Centralized fetch with timeout
│   │   ├── routes.ts                # Route constants
│   │   ├── tasks.client.ts          # Task API client
│   │   └── holidays.client.ts       # Holiday API client
│   ├── date/
│   │   └── utils.ts                 # Date helpers, grid generation
│   ├── dnd/
│   │   └── ids.ts                   # DnD ID conventions
│   ├── holidays/
│   │   └── holidays-mapper.ts       # Group holidays by day
│   ├── store/
│   │   ├── app.store.ts             # Main Zustand store
│   │   ├── dnd.store.ts             # Isolated DnD store
│   │   ├── slices/
│   │   │   ├── calendar.slice.ts    # Navigation, country
│   │   │   ├── tasks.slice.ts       # CRUD + range hydration
│   │   │   ├── holidays.slice.ts    # Holiday fetching
│   │   │   └── ui.slice.ts          # Search, view, theme, editor
│   │   ├── selectors/
│   │   │   ├── calendar.selectors.ts
│   │   │   ├── tasks.selectors.ts
│   │   │   ├── holidays.selectors.ts
│   │   │   ├── ui.selectors.ts
│   │   │   └── cache/
│   │   │       ├── selector-caches.ts
│   │   │       └── lru-map.ts
│   │   ├── utils/
│   │   │   ├── bucket.ts
│   │   │   ├── date-keys.ts
│   │   │   ├── task-order.ts
│   │   │   ├── resolve-drop-target.ts
│   │   │   └── apply-dnd-overlay.ts
│   │   └── types/
│   │       ├── common.ts
│   │       ├── app.types.ts
│   │       ├── calendar.types.ts
│   │       ├── tasks.types.ts
│   │       ├── holidays.types.ts
│   │       ├── ui.types.ts
│   │       └── dnd.types.ts
│
├── styles/
│   ├── theme.ts                     # Light/dark theme tokens
│   ├── globalStyles.tsx             # Global Emotion styles
│   └── emotion.d.ts                 # Theme type augmentation
│
└── types/
    ├── task.ts
    ├── holiday.ts
    └── api.ts
```

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** (comes with Node.js)
- **MongoDB** instance (local or cloud-hosted)

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=calendar_task_manager
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | No | Database name (defaults to `calendar_task_manager`) |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run lint     # ESLint check
npm run build    # Production build
npm run start    # Start production server
```

## API Reference

All endpoints are served under `/api`. Successful responses follow `{ ok: true, data: ... }`. Errors follow `{ ok: false, error: { code, message, requestId?, details? } }`.

### Tasks

#### `GET /api/tasks`

Retrieve tasks within a date range.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | Yes | Start date (inclusive) |
| `to` | `YYYY-MM-DD` | Yes | End date (inclusive) |
| `search` | `string` | No | Filter by title (case-insensitive substring) |

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": "67a1b2c3d4e5f6a7b8c9d0e1",
      "day": "2026-03-19",
      "bucket": "allDay",
      "title": "Team standup",
      "order": 1024,
      "dots": ["#6257d4"],
      "allDay": true,
      "timeMinutes": 0,
      "createdAt": "2026-03-19T10:00:00.000Z",
      "updatedAt": "2026-03-19T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/tasks`

Create a new task.

**Body:**

```json
{
  "day": "2026-03-19",
  "title": "Review PR",
  "dots": ["#3bb89a"],
  "allDay": false,
  "timeMinutes": 600
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `day` | `YYYY-MM-DD` | Yes | Target date |
| `title` | `string` (1-500 chars) | Yes | Task title |
| `dots` | `string[]` (hex colors, max 5) | No | Color indicators |
| `allDay` | `boolean` | No | All-day flag (default: `true`) |
| `timeMinutes` | `0-1439` | Yes | Minutes from midnight (`0` when `allDay`) |

#### `PATCH /api/tasks/:id`

Update a task. All fields optional, at least one required.

#### `PATCH /api/tasks/:id/move`

Move a task to a different day/time slot with positional ordering.

**Body:**

```json
{
  "toDay": "2026-03-20",
  "toBucket": "hour:14",
  "beforeId": null,
  "afterId": "67a1b2c3d4e5f6a7b8c9d0e2"
}
```

#### `DELETE /api/tasks/:id`

Delete a task. Returns `{ ok: true, data: null }`.

### Holidays

#### `GET /api/holidays`

Retrieve public holidays. Results are cached with `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `year` | `1900-2100` | Yes | Calendar year |
| `country` | 2-letter ISO code | Yes | Country code (e.g., `US`, `UA`, `DE`) |

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "date": "2026-07-04",
      "localName": "Independence Day",
      "name": "Independence Day",
      "countryCode": "US"
    }
  ]
}
```

### Database

#### `GET /api/db/ping`

Health check. Returns `{ ok: true, data: { mongo: true } }` if MongoDB is reachable.

## Architecture Decisions

### No Calendar Libraries

All calendar grid math is implemented with pure functions in `src/lib/date/utils.ts`. The month view generates a 42-cell grid (6 rows x 7 columns) including overflow days from adjacent months. The week view computes a 7-day range from an anchor date.

### Two Zustand Stores

1. **`useAppStore`** — main application store with 4 slices (calendar, tasks, holidays, UI). Persisted to `localStorage` for theme, country code, view mode, and week start preference.

2. **`useDndStore`** — isolated store for drag-and-drop state. Separated to prevent re-renders of the entire app during drag operations. It captures a snapshot at drag start, applies optimistic preview moves, and commits or rolls back on drag end.

### Snapshot-Based DnD

During a drag, the DnD store captures `entities`, `orderByBucket`, and `bucketByTaskId`. Visual positions are computed from base state + pending move via `applyDndOverlay`, keeping the main store untouched until commit.

### Order Stepping with Rebalancing

Tasks within each `day+bucket` are assigned an `order` spaced by `ORDER_STEP = 1024`. Moving a task between neighbors uses the midpoint. If the gap is exhausted, the entire bucket is rebalanced to evenly spaced values. A unique compound index on `{ day, bucket, order }` guarantees deterministic ordering and catches race conditions.

### Bucket System

Tasks are placed into buckets — `"allDay"` or `"hour:N"` (N = 0-23). This determines visual grouping and database-level ordering. Moving between buckets normalizes `timeMinutes` automatically.

### SSR-Safe Theming

The theme mode is persisted in two places:
- **Cookie** (`ctm-theme`) — read server-side in `layout.tsx` to set `data-theme` on `<html>`, preventing theme flash.
- **localStorage** — managed by Zustand's `persist` middleware for fast client access after hydration.

Emotion styles are injected via `useServerInsertedHTML` during SSR to prevent unstyled content flash.

## Data Model

### Task

```typescript
{
  id: string;           // MongoDB ObjectId as hex string
  day: string;          // "YYYY-MM-DD"
  bucket: string;       // "allDay" | "hour:0" ... "hour:23"
  title: string;        // 1-500 characters
  order: number;        // Stable sort position within bucket
  dots: string[];       // Hex color codes (e.g. "#ff0000"), max 5
  allDay: boolean;      // All-day vs timed task
  timeMinutes: number;  // 0-1439, minutes from midnight (0 when allDay)
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

### Holiday

```typescript
{
  date: string;         // "YYYY-MM-DD"
  localName: string;    // Local language name
  name: string;         // English name
  countryCode: string;  // ISO 3166-1 alpha-2
}
```

## Drag & Drop

Built on `@dnd-kit/core` and `@dnd-kit/sortable`:

- **Sensors**: Mouse (5px activation), Touch (160ms delay, 8px tolerance), Keyboard
- **Cross-day moves**: Drag between day cells in month view or hour slots in week view
- **Within-day reordering**: Sortable with vertical strategy
- **Auto-scroll**: Pointer-proximity scrolling via RAF-batched hooks
- **Pointer fallback**: `document.elementsFromPoint` for drop resolution
- **Touch support**: Custom handling with visual feedback
- **Visual overlay**: Portal-based ghost with cubic-bezier drop animation

## Supported Countries

| Code | Country | Code | Country |
|---|---|---|---|
| US | United States | GB | United Kingdom |
| DE | Germany | FR | France |
| ES | Spain | IT | Italy |
| UA | Ukraine | PL | Poland |
| BR | Brazil | CA | Canada |
| AU | Australia | JP | Japan |

Holiday data is sourced from the [Nager.Date API](https://date.nager.at/).

## Error Handling

All API errors follow a consistent JSON format:

```json
{
  "ok": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body or query parameters |
| `TASK_NOT_FOUND` | 404 | Task does not exist |
| `INVALID_MOVE` | 400 | Move operation validation failed |
| `UPSTREAM_TIMEOUT` | 504 | Nager API timed out |
| `UPSTREAM_ERROR` | 502 | Nager API returned an error |
| `BAD_REQUEST` | 400 | Malformed JSON or syntax error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## License

Add a `LICENSE` file to the project root to specify licensing terms.
