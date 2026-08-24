import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import { selectPriorityBreakdown } from './selectors';
import { useChartColors } from './chartColors';

export function PriorityBreakdownChart() {
  const { data: tasks, isLoading } = useTasksQuery();
  const { priorityOrdinal, ink } = useChartColors();
  const data = useMemo(() => (tasks ? selectPriorityBreakdown(tasks) : []), [tasks]);

  if (isLoading || !tasks) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Priority Breakdown</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={ink.grid} vertical={false} />
          <XAxis dataKey="status" stroke={ink.muted} fontSize={12} />
          <YAxis stroke={ink.muted} fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ color: ink.secondary, fontSize: 12 }} />
          <Bar dataKey="low" stackId="priority" name="Low" fill={priorityOrdinal[0]} />
          <Bar dataKey="medium" stackId="priority" name="Medium" fill={priorityOrdinal[1]} />
          <Bar dataKey="high" stackId="priority" name="High" fill={priorityOrdinal[2]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
