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
