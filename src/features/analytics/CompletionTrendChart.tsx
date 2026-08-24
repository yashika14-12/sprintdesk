import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import { selectCompletionTrend } from './selectors';
import { useChartColors } from './chartColors';

export function CompletionTrendChart() {
  const { data: tasks, isLoading } = useTasksQuery();
  const { categorical, ink } = useChartColors();

  if (isLoading || !tasks) return <Skeleton className="h-64 w-full" />;

  const data = selectCompletionTrend(tasks);

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Completion Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={ink.grid} vertical={false} />
          <XAxis dataKey="date" stroke={ink.muted} fontSize={12} />
          <YAxis stroke={ink.muted} fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cumulativeCompleted"
            name="Completed (cumulative)"
            stroke={categorical[0]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
