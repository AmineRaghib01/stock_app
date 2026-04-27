import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/endpoints';
import { getToken, setToken } from '@/services/api';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTok] = React.useState<string | null>(() => getToken());

  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    enabled: Boolean(token),
    queryFn: async () => (await authApi.me()).data.data,
    retry: false,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (meQuery.isError) {
      setTok(null);
      setToken(null);
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    }
  }, [meQuery.isError, queryClient]);

  const isReady = !token || (!meQuery.isPending && (meQuery.isSuccess || meQuery.isError));

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login({ email, password });
      setToken(data.data.token);
      setTok(data.data.token);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    [queryClient]
  );

  const logout = React.useCallback(async () => {
    try {
      if (getToken()) await authApi.logout();
    } catch {
      /* ignore */
    }
    setTok(null);
    setToken(null);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const refresh = React.useCallback(async () => {
    await meQuery.refetch();
  }, [meQuery]);

  const value = React.useMemo(
    () => ({
      user: meQuery.data ?? null,
      token,
      isReady,
      login,
      logout,
      refresh,
    }),
    [meQuery.data, token, isReady, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
