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
