import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '@/app/store';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import { STATUS_ORDER, selectTaskStatusDistribution } from '@/features/analytics/selectors';

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: tasks, isLoading } = useTasksQuery();

  const statusCounts = tasks ? selectTaskStatusDistribution(tasks) : [];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Welcome back{user ? `, ${user.firstName}` : ''}
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Here's where your sprint stands right now.</p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <Skeleton key={status} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statusCounts.map((entry) => (
            <div key={entry.status} className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{entry.count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{entry.status}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link to="/board" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          Go to the sprint board →
        </Link>
        <Link to="/analytics" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          View analytics →
        </Link>
      </div>
    </div>
  );
}
