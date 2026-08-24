import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/store';
import { login } from './auth.service';
import { sessionEstablished } from './authSlice';
import { setRefreshToken } from './refreshTokenStorage';

export function useLoginMutation() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => login(username, password),
    onSuccess: (data) => {
      setRefreshToken(data.refreshToken);
      dispatch(
        sessionEstablished({
          user: {
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            image: data.image,
          },
          accessToken: data.accessToken,
        }),
      );
    },
  });
}
