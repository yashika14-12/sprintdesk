import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import { selectTaskStatusDistribution } from './selectors';
import { useChartColors } from './chartColors';

export function TaskStatusChart() {
  const { data: tasks, isLoading } = useTasksQuery();
  const { categorical, ink } = useChartColors();

  if (isLoading || !tasks) return <Skeleton className="h-64 w-full" />;

  const data = selectTaskStatusDistribution(tasks);

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Task Status</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={categorical[index % categorical.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ color: ink.secondary, fontSize: 12 }} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
