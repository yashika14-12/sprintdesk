import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { setPanelOpen } from './notificationsSlice';

export function NotificationBell() {
  const dispatch = useDispatch<AppDispatch>();
  const isPanelOpen = useSelector((state: RootState) => state.notifications.isPanelOpen);
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.items.filter((item) => !item.read).length,
  );

  return (
    <button
      type="button"
      onClick={() => dispatch(setPanelOpen(!isPanelOpen))}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      aria-expanded={isPanelOpen}
      className="relative rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <span aria-hidden="true">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
