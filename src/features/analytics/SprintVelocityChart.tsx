import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSprintsQuery } from '@/hooks/queries/useSprintsQuery';
import { useTasksQuery } from '@/hooks/queries/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import { selectSprintVelocity } from './selectors';
import { useChartColors } from './chartColors';

export function SprintVelocityChart() {
  const { data: tasks, isLoading: tasksLoading } = useTasksQuery();
  const { data: sprints, isLoading: sprintsLoading } = useSprintsQuery();
  const { categorical, ink } = useChartColors();
  const data = useMemo(() => (tasks && sprints ? selectSprintVelocity(tasks, sprints) : []), [tasks, sprints]);

  if (tasksLoading || sprintsLoading || !tasks || !sprints) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Sprint Velocity</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={ink.grid} vertical={false} />
          <XAxis dataKey="sprintName" stroke={ink.muted} fontSize={12} />
          <YAxis stroke={ink.muted} fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="completedCount" name="Completed tasks" fill={categorical[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
