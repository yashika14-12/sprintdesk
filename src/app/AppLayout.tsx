import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet } from 'react-router-dom';
import type { AppDispatch } from './store';
import ThemeToggle from '@/features/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useLogout } from '@/features/auth/useLogout';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { NotificationPanel } from '@/features/notifications/NotificationPanel';
import { useNotificationsPolling } from '@/features/notifications/useNotificationsPolling';
import { hydrateInitialNotifications } from '@/features/notifications/notificationsSlice';
import { useNotificationsSeedQuery } from '@/hooks/queries/useNotificationsSeedQuery';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/board', label: 'Board' },
  { to: '/analytics', label: 'Analytics' },
];

export function AppLayout() {
  const logout = useLogout();
  const dispatch = useDispatch<AppDispatch>();
  const { data: initialNotifications } = useNotificationsSeedQuery();

  useEffect(() => {
    if (initialNotifications) {
      dispatch(hydrateInitialNotifications(initialNotifications));
    }
  }, [initialNotifications, dispatch]);

  useNotificationsPolling();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">SprintDesk</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative">
            <NotificationBell />
            <NotificationPanel />
          </div>
          <ThemeToggle />
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
