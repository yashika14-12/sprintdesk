import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/Button';
import { NOTIFICATIONS_PER_PAGE, markAllAsRead, markAsRead, setPage, setPanelOpen } from './notificationsSlice';

export function NotificationPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const isPanelOpen = useSelector((state: RootState) => state.notifications.isPanelOpen);
  const items = useSelector((state: RootState) => state.notifications.items);
  const page = useSelector((state: RootState) => state.notifications.page);

  if (!isPanelOpen) return null;

  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalPages = Math.max(1, Math.ceil(sorted.length / NOTIFICATIONS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * NOTIFICATIONS_PER_PAGE, currentPage * NOTIFICATIONS_PER_PAGE);

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(markAllAsRead())}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={() => dispatch(setPanelOpen(false))}
            aria-label="Close notifications"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            ✕
          </button>
        </div>
      </div>

      <ul className="max-h-96 overflow-y-auto">
        {pageItems.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet.</li>
        )}
        {pageItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => dispatch(markAsRead(item.id))}
              className={`block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                item.read ? 'text-gray-500 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                {!item.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" aria-hidden="true" />}
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{item.message}</span>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => dispatch(setPage(currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </Button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => dispatch(setPage(currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
