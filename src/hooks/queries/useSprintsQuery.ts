import { useQuery } from '@tanstack/react-query';
import { getSprints } from '@/services/sprints.service';

export const sprintsQueryKey = ['sprints'] as const;

export function useSprintsQuery() {
  return useQuery({
    queryKey: sprintsQueryKey,
    queryFn: getSprints,
  });
}
