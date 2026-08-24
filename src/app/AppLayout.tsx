import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '@/features/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useLogout } from '@/features/auth/useLogout';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/board', label: 'Board' },
  { to: '/analytics', label: 'Analytics' },
];

export function AppLayout() {
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex items-center gap-6">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">SprintDesk</span>
          <div className="flex items-center gap-4">
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
