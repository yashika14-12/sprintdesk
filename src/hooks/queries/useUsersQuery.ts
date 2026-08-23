import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/services/users.service';

export const usersQueryKey = ['users'] as const;

export function useUsersQuery() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: getUsers,
  });
}
