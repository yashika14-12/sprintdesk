import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

const CATEGORICAL_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500'];

const PRIORITY_ORDINAL_LIGHT = ['#9ec5f4', '#2a78d6', '#104281'];
const PRIORITY_ORDINAL_DARK = ['#6da7ec', '#3987e5', '#184f95'];

const INK_LIGHT = { primary: '#0b0b0b', secondary: '#52514e', muted: '#898781', grid: '#e1e0d9' };
const INK_DARK = { primary: '#ffffff', secondary: '#c3c2b7', muted: '#898781', grid: '#2c2c2a' };

export function useChartColors() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  return {
    categorical: isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT,
    priorityOrdinal: isDark ? PRIORITY_ORDINAL_DARK : PRIORITY_ORDINAL_LIGHT,
    ink: isDark ? INK_DARK : INK_LIGHT,
  };
}
