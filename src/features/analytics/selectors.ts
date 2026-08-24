import type { Task, TaskStatus } from '@/types/task';
import type { Sprint } from '@/types/sprint';

export interface SprintVelocityDatum {
  sprintName: string;
  completedCount: number;
}

export function selectSprintVelocity(tasks: Task[], sprints: Sprint[]): SprintVelocityDatum[] {
  return sprints.map((sprint) => ({
    sprintName: sprint.name,
    completedCount: tasks.filter((task) => task.sprintId === sprint.id && task.status === 'done').length,
  }));
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const STATUS_ORDER: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

export interface TaskStatusDatum {
  status: string;
  count: number;
}

export function selectTaskStatusDistribution(tasks: Task[]): TaskStatusDatum[] {
  return STATUS_ORDER.map((status) => ({
    status: STATUS_LABELS[status],
    count: tasks.filter((task) => task.status === status).length,
  }));
}

export interface PriorityBreakdownDatum {
  status: string;
  low: number;
  medium: number;
  high: number;
}

export function selectPriorityBreakdown(tasks: Task[]): PriorityBreakdownDatum[] {
  return STATUS_ORDER.map((status) => {
    const tasksInColumn = tasks.filter((task) => task.status === status);
    return {
      status: STATUS_LABELS[status],
      low: tasksInColumn.filter((task) => task.priority === 'low').length,
      medium: tasksInColumn.filter((task) => task.priority === 'medium').length,
      high: tasksInColumn.filter((task) => task.priority === 'high').length,
    };
  });
}

export interface CompletionTrendDatum {
  date: string;
  cumulativeCompleted: number;
}

export function selectCompletionTrend(tasks: Task[]): CompletionTrendDatum[] {
  const completedDates = tasks
    .filter((task): task is Task & { completedAt: string } => task.completedAt !== null)
    .map((task) => task.completedAt.slice(0, 10));

  const countsByDate = new Map<string, number>();
  for (const date of completedDates) {
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
  }

  let cumulative = 0;
  return Array.from(countsByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      cumulative += count;
      return { date, cumulativeCompleted: cumulative };
    });
}
