# SprintDesk — Phase 2: Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the from-scratch Tailwind component library (Button, Input, Select, Modal, Toast + `useToast`, DataTable, Skeleton) required by spec §11/Task 04, plus finish the theme-toggle wiring that Phase 1's final review flagged as unassigned (dark mode class sync + a `ThemeToggle` control), so every later phase (Auth, Board, Analytics, Notifications) has real, accessible, tested components to build on instead of raw markup.

**Architecture:** Every component lives under `src/components/ui/`, is self-contained (no Redux/Query dependency), and is either a plain accessible wrapper over a native element (Button→`<button>`, Input→`<input>`, Select→`<select>`, DataTable→`<table>` — native elements carry most of the required accessibility for free) or, for Toast, a minimal `useSyncExternalStore`-backed singleton so any component anywhere can trigger a toast without prop-drilling or a Redux dependency. Theme sync is a tiny side-effect-only component reading the existing `theme` Redux slice.

**Tech Stack:** React 18, TypeScript strict, Tailwind CSS v3, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-23-sprintdesk-design.md`

## Global Constraints

- No external UI component libraries (MUI, Ant Design, Chakra, Shadcn UI, etc.) — every component here is built from scratch on Tailwind.
- TypeScript strict mode; no dead code; no unused exports.
- Testing: Vitest + React Testing Library; tests must verify real behavior (rendered DOM, fired callbacks, keyboard/ARIA state), not shallow snapshots.
- Accessibility: keyboard-operable interactions, proper form labels, meaningful states communicated via ARIA where a native element doesn't already provide it.
- `useToast` is one of the three unit tests explicitly required by spec §Task 06 — it must be genuinely thorough (add, dismiss, auto-dismiss, multiple toasts queued).
- These components must not import Redux, TanStack Query, or any app-specific module — the design system is portable and consumed by later phases, never the reverse.

---

### Task 1: Dark mode wiring — Tailwind config, `ThemeSync`, `ThemeToggle`

**Files:**
- Modify: `tailwind.config.js`
- Create: `src/features/theme/ThemeSync.tsx`, `src/features/theme/ThemeSync.test.tsx`, `src/features/theme/ThemeToggle.tsx`, `src/features/theme/ThemeToggle.test.tsx`
- Modify: `src/app/App.tsx` (mount `<ThemeSync />` once)

**Interfaces:**
- Consumes: `themeReducer`, `setTheme`, `toggleTheme` (existing, `src/features/theme/themeSlice.ts`); `store` (existing, `src/app/App.tsx`'s own import).
- Produces: `ThemeSync` (side-effect-only component, default export), `ThemeToggle` (default export) — a plain button any future header/nav can render. No new state — this task only wires existing state to the DOM and to a control.

- [ ] **Step 1: Enable Tailwind's class-based dark mode**

Edit `tailwind.config.js`, add `darkMode: 'class'` as a top-level key:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 2: Write the failing test for `ThemeSync`**

Create `src/features/theme/ThemeSync.test.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { themeReducer, setTheme } from './themeSlice';
import ThemeSync from './ThemeSync';

function renderWithTheme(mode: 'light' | 'dark') {
  const store = configureStore({ reducer: { theme: themeReducer } });
  store.dispatch(setTheme(mode));
  render(
    <Provider store={store}>
      <ThemeSync />
    </Provider>,
  );
  return store;
}

describe('ThemeSync', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('adds the dark class when the theme is dark', () => {
    renderWithTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the dark class when the theme is light', () => {
    const store = renderWithTheme('dark');
    store.dispatch(setTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test:run -- ThemeSync`
Expected: FAIL — `./ThemeSync` module not found.

- [ ] **Step 4: Implement `ThemeSync`**

Create `src/features/theme/ThemeSync.tsx`:

```tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

export default function ThemeSync() {
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return null;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test:run -- ThemeSync`
Expected: PASS, 2 tests.

- [ ] **Step 6: Write the failing test for `ThemeToggle`**

Create `src/features/theme/ThemeToggle.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { themeReducer } from './themeSlice';
import ThemeToggle from './ThemeToggle';

function renderToggle() {
  const store = configureStore({ reducer: { theme: themeReducer } });
  render(
    <Provider store={store}>
      <ThemeToggle />
    </Provider>,
  );
  return store;
}

describe('ThemeToggle', () => {
  it('renders an accessible button labelled with the current mode', () => {
    renderToggle();
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it('dispatches toggleTheme when clicked', async () => {
    const store = renderToggle();
    await userEvent.click(screen.getByRole('button'));
    expect(store.getState().theme.mode).toBe('dark');
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npm run test:run -- ThemeToggle`
Expected: FAIL — `./ThemeToggle` module not found.

- [ ] **Step 8: Implement `ThemeToggle`**

Create `src/features/theme/ThemeToggle.tsx`:

```tsx
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import { toggleTheme } from './themeSlice';

export default function ThemeToggle() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();
  const nextMode = mode === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${nextMode} theme`}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm run test:run -- ThemeToggle`
Expected: PASS, 2 tests.

- [ ] **Step 10: Mount `ThemeSync` in the App shell**

Edit `src/app/App.tsx`, add the import and render it once alongside the router:

```tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistor, store } from './store';
import { queryClient } from './queryClient';
import { AppRouter } from './router';
import ThemeSync from '@/features/theme/ThemeSync';

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeSync />
          <AppRouter />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
```

- [ ] **Step 11: Run the full suite and build**

Run: `npm run test:run`
Expected: all test files PASS (including the existing `App.test.tsx`, which still only asserts on the dashboard placeholder text and is unaffected by a null-rendering `ThemeSync`).

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 12: Commit**

```bash
git add tailwind.config.js src/features/theme/ThemeSync.tsx src/features/theme/ThemeSync.test.tsx src/features/theme/ThemeToggle.tsx src/features/theme/ThemeToggle.test.tsx src/app/App.tsx
git commit -m "feat: wire dark mode sync and add ThemeToggle control"
```

---

### Task 2: `Button`

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `Button` (named export), `type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'` — consumed by every later phase needing a clickable action (login submit, task create/delete, notification actions, etc.).

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children as an accessible button', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a loading state, disables the button, and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} isLoading>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the variant class for danger', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- Button`
Expected: FAIL — `./Button` module not found.

- [ ] **Step 3: Implement `Button`**

Create `src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400 dark:text-gray-200',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- Button`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat: add Button component"
```

---

### Task 3: `Input`

**Files:**
- Create: `src/components/ui/Input.tsx`, `src/components/ui/Input.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `Input` (named export) — consumed by Auth (login form), Board (task title/due-date fields), etc.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Input.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('links the label to the input via htmlFor/id', () => {
    render(<Input label="Email" id="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('generates an id automatically when none is given, and still links the label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows helper text when there is no error', () => {
    render(<Input label="Email" helperText="We will never share this." />);
    expect(screen.getByText('We will never share this.')).toBeInTheDocument();
  });

  it('shows an error message and marks the input invalid, hiding helper text', () => {
    render(<Input label="Email" helperText="helper" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('helper')).not.toBeInTheDocument();
  });

  it('passes through disabled and other native input props', () => {
    render(<Input label="Email" disabled placeholder="you@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- Input`
Expected: FAIL — `./Input` module not found.

- [ ] **Step 3: Implement `Input`**

Create `src/components/ui/Input.tsx`:

```tsx
import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, id, className = '', ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? helperText;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 ${
          error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 dark:border-gray-600'
        } ${className}`}
        {...rest}
      />
      {message && (
        <p
          id={messageId}
          className={error ? 'text-sm text-red-600' : 'text-sm text-gray-500 dark:text-gray-400'}
        >
          {message}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- Input`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Input.test.tsx
git commit -m "feat: add Input component"
```

---

### Task 4: `Select`

**Files:**
- Create: `src/components/ui/Select.tsx`, `src/components/ui/Select.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `Select` (named export), `type SelectOption = { value: string; label: string }` — consumed by Board (priority/assignee pickers) and Analytics (filters, if added later).

Design note: built on the native `<select>` element rather than a custom listbox — it is fully keyboard/screen-reader accessible without any custom ARIA wiring, and the assignment only requires "Select / Dropdown" functionality, not a custom-styled popover combobox. Building a from-scratch ARIA listbox would be premature complexity for what this project needs.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Select.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const options = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

describe('Select', () => {
  it('links the label to the select and renders all options', () => {
    render(<Select label="Priority" options={options} value="low" onChange={() => {}} />);
    const select = screen.getByLabelText('Priority');
    expect(select).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn();
    render(<Select label="Priority" options={options} value="low" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Priority'), 'high');
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('shows an error message and marks the select invalid', () => {
    render(
      <Select label="Priority" options={options} value="low" onChange={() => {}} error="Required" />,
    );
    expect(screen.getByLabelText('Priority')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('supports a disabled state', () => {
    render(<Select label="Priority" options={options} value="low" onChange={() => {}} disabled />);
    expect(screen.getByLabelText('Priority')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- Select`
Expected: FAIL — `./Select` module not found.

- [ ] **Step 3: Implement `Select`**

Create `src/components/ui/Select.tsx`:

```tsx
import { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export function Select({ label, options, value, onChange, error, disabled, id }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 ${
          error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 dark:border-gray-600'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={messageId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- Select`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Select.tsx src/components/ui/Select.test.tsx
git commit -m "feat: add Select component"
```

---

### Task 5: `Modal`

**Files:**
- Create: `src/components/ui/Modal.tsx`, `src/components/ui/Modal.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific (uses `react-dom`'s `createPortal`, already a transitive dependency of `react-dom`).
- Produces: `Modal` (named export) — consumed by Board (task create form, delete confirmation) and any future dialog need.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Modal.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the title and children when open, as an accessible dialog', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Delete task')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the dialog content', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.click(screen.getByText('Are you sure?'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus into the dialog when opened', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- Modal`
Expected: FAIL — `./Modal` module not found.

- [ ] **Step 3: Implement `Modal`**

Create `src/components/ui/Modal.tsx`:

```tsx
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-testid="modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl focus:outline-none dark:bg-gray-800"
      >
        <h2 id={titleId} className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- Modal`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/Modal.test.tsx
git commit -m "feat: add Modal component"
```

---

### Task 6: `Toast` + `useToast`

**Files:**
- Create: `src/components/ui/toastStore.ts`, `src/components/ui/useToast.ts`, `src/components/ui/useToast.test.ts`, `src/components/ui/Toast.tsx`, `src/components/ui/ToastContainer.tsx`, `src/components/ui/ToastContainer.test.tsx`
- Modify: `src/app/App.tsx` (mount `<ToastContainer />` once)

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `useToast()` returning `{ toasts, showToast(message, variant?, duration?), dismissToast(id) }`; `ToastContainer` (named export, mounted once at the app root) — consumed by every later phase that needs to notify the user (task created/deleted, login errors, new-notification alerts in the Notifications phase).

This is one of the three unit tests explicitly required by spec §Task 06 — `useToast` must be tested thoroughly (add, dismiss, auto-dismiss, multiple toasts).

- [ ] **Step 1: Write the failing tests for the toast store + hook**

Create `src/components/ui/useToast.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useToast } from './useToast';
import { __resetToastStore } from './toastStore';

describe('useToast', () => {
  beforeEach(() => {
    __resetToastStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast adds a toast with the given message and variant', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Task created', 'success');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({ message: 'Task created', variant: 'success' });
  });

  it('defaults to the info variant when none is given', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Heads up');
    });
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('queues multiple toasts in the order they were shown', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
    });
    expect(result.current.toasts.map((t) => t.message)).toEqual(['First', 'Second']);
  });

  it('dismissToast removes a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let id = '';
    act(() => {
      id = result.current.showToast('Dismiss me');
    });
    act(() => {
      result.current.dismissToast(id);
    });
    expect(result.current.toasts).toEqual([]);
  });

  it('auto-dismisses a toast after its duration elapses', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Auto', 'info', 3000);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Sticky', 'info', 0);
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- useToast`
Expected: FAIL — `./useToast` module not found.

- [ ] **Step 3: Implement the toast store**

Create `src/components/ui/toastStore.ts`:

```ts
export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ToastItem[] {
  return toasts;
}

export function addToast(message: string, variant: ToastVariant = 'info', duration = 4000): string {
  const id = String(nextId++);
  toasts = [...toasts, { id, message, variant }];
  emit();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export function removeToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function __resetToastStore(): void {
  toasts = [];
  nextId = 0;
}
```

- [ ] **Step 4: Implement `useToast`**

Create `src/components/ui/useToast.ts`:

```ts
import { useCallback, useSyncExternalStore } from 'react';
import { addToast, getSnapshot, removeToast, subscribe, type ToastVariant } from './toastStore';

export function useToast() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot);

  const showToast = useCallback(
    (message: string, variant?: ToastVariant, duration?: number) => addToast(message, variant, duration),
    [],
  );

  const dismissToast = useCallback((id: string) => removeToast(id), []);

  return { toasts, showToast, dismissToast };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test:run -- useToast`
Expected: PASS, 7 tests.

- [ ] **Step 6: Write the failing test for `ToastContainer`**

Create `src/components/ui/ToastContainer.test.tsx`:

```tsx
import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from './ToastContainer';
import { __resetToastStore, addToast } from './toastStore';

describe('ToastContainer', () => {
  beforeEach(() => {
    __resetToastStore();
  });

  it('renders nothing when there are no toasts', () => {
    render(<ToastContainer />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders an active toast with its message', () => {
    render(<ToastContainer />);
    act(() => {
      addToast('Task created', 'success');
    });
    expect(screen.getByText('Task created')).toBeInTheDocument();
  });

  it('dismisses a toast when its close button is clicked', async () => {
    render(<ToastContainer />);
    act(() => {
      addToast('Task created', 'success');
    });
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Task created')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npm run test:run -- ToastContainer`
Expected: FAIL — `./ToastContainer` module not found.

- [ ] **Step 8: Implement `Toast` and `ToastContainer`**

Create `src/components/ui/Toast.tsx`:

```tsx
import type { ToastItem } from './toastStore';

const VARIANT_CLASSES: Record<ToastItem['variant'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${VARIANT_CLASSES[toast.variant]}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
```

Create `src/components/ui/ToastContainer.tsx`:

```tsx
import { useToast } from './useToast';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm run test:run -- ToastContainer`
Expected: PASS, 3 tests.

- [ ] **Step 10: Mount `ToastContainer` in the App shell**

Edit `src/app/App.tsx`:

```tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistor, store } from './store';
import { queryClient } from './queryClient';
import { AppRouter } from './router';
import ThemeSync from '@/features/theme/ThemeSync';
import { ToastContainer } from '@/components/ui/ToastContainer';

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeSync />
          <ToastContainer />
          <AppRouter />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
```

- [ ] **Step 11: Run the full suite and build**

Run: `npm run test:run`
Expected: all test files PASS.

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 12: Commit**

```bash
git add src/components/ui/toastStore.ts src/components/ui/useToast.ts src/components/ui/useToast.test.ts src/components/ui/Toast.tsx src/components/ui/ToastContainer.tsx src/components/ui/ToastContainer.test.tsx src/app/App.tsx
git commit -m "feat: add Toast system and useToast hook"
```

---

### Task 7: `Skeleton`

**Files:**
- Create: `src/components/ui/Skeleton.tsx`, `src/components/ui/Skeleton.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `Skeleton` (named export) — consumed by every later phase's loading states (Board/Analytics/Notifications while TanStack Query's `isLoading` is true), replacing the plain-text `RouteFallback` in `src/app/router.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Skeleton.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders an accessible loading placeholder', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('applies a custom className alongside its default styles', () => {
    render(<Skeleton className="h-4 w-32" />);
    const skeleton = screen.getByRole('status', { name: /loading/i });
    expect(skeleton).toHaveClass('h-4', 'w-32', 'animate-pulse');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- Skeleton`
Expected: FAIL — `./Skeleton` module not found.

- [ ] **Step 3: Implement `Skeleton`**

Create `src/components/ui/Skeleton.tsx`:

```tsx
import type { HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- Skeleton`
Expected: PASS, 2 tests.

- [ ] **Step 5: Use `Skeleton` for the route-level loading fallback**

Edit `src/app/router.tsx` — replace the plain-text `RouteFallback` with the real component:

```tsx
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';

const LoginPage = lazy(() => import('@/routes/LoginPage'));
const DashboardPage = lazy(() => import('@/routes/DashboardPage'));
const BoardPage = lazy(() => import('@/routes/BoardPage'));
const AnalyticsPage = lazy(() => import('@/routes/AnalyticsPage'));

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Skeleton className="h-8 w-48" />
    </div>
  );
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
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
```

- [ ] **Step 6: Run the full suite and build**

Run: `npm run test:run`
Expected: all test files PASS (the existing `App.test.tsx` integration test still passes — it waits for the dashboard placeholder text, which still appears once the lazy chunk resolves, regardless of what the transient fallback looked like).

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Skeleton.tsx src/components/ui/Skeleton.test.tsx src/app/router.tsx
git commit -m "feat: add Skeleton component and use it for route-level loading"
```

---

### Task 8: `DataTable`

**Files:**
- Create: `src/components/ui/DataTable.tsx`, `src/components/ui/DataTable.test.tsx`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces: `DataTable` (named export), `type DataTableColumn<T>` — a generic, reusable tabular list component available to any future phase that needs one (e.g. an assignee list, or a denser alternative view of tasks).

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/DataTable.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, type DataTableColumn } from './DataTable';

interface Row {
  id: number;
  name: string;
  priority: string;
}

const columns: DataTableColumn<Row>[] = [
  { header: 'Name', accessor: (row) => row.name },
  { header: 'Priority', accessor: (row) => row.priority },
];

const rows: Row[] = [
  { id: 1, name: 'Task A', priority: 'high' },
  { id: 2, name: 'Task B', priority: 'low' },
];

describe('DataTable', () => {
  it('renders a column header for each configured column', () => {
    render(<DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Priority' })).toBeInTheDocument();
  });

  it('renders one row per data item, with cells from each accessor', () => {
    render(<DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />);
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header row + 2 data rows
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('renders an empty state message when there is no data', () => {
    render(<DataTable columns={columns} data={[]} getRowKey={(row) => row.id} emptyMessage="No tasks yet" />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- DataTable`
Expected: FAIL — `./DataTable` module not found.

- [ ] **Step 3: Implement `DataTable`**

Create `src/components/ui/DataTable.tsx`:

```tsx
import type { Key, ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  accessor: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => Key;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, getRowKey, emptyMessage = 'No data available' }: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          {columns.map((column) => (
            <th key={column.header} scope="col" className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((column) => (
                <td key={column.header} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- DataTable`
Expected: PASS, 3 tests.

- [ ] **Step 5: Run the full suite and build**

Run: `npm run test:run`
Expected: all test files PASS.

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/DataTable.tsx src/components/ui/DataTable.test.tsx
git commit -m "feat: add DataTable component"
```

---

## What this plan intentionally defers

- Wiring `ThemeToggle` into an actual header/nav — no header/nav exists yet; it lands wherever the Auth or Board phase builds the authenticated app shell's chrome.
- Component composability at scale (e.g. `Button` used as a link, `Modal` stacking) — YAGNI until a real later-phase need arises.
- Storybook and axe-core (explicit optional bonuses, out of scope per §2 of the design spec).
