import { SprintVelocityChart } from '@/features/analytics/SprintVelocityChart';
import { TaskStatusChart } from '@/features/analytics/TaskStatusChart';
import { PriorityBreakdownChart } from '@/features/analytics/PriorityBreakdownChart';
import { CompletionTrendChart } from '@/features/analytics/CompletionTrendChart';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <SprintVelocityChart />
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <TaskStatusChart />
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <PriorityBreakdownChart />
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <CompletionTrendChart />
        </div>
      </div>
    </div>
  );
}
