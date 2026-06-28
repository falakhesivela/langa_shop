"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUserWithAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/api/auth";
import { restoreSession } from "@/lib/api/client";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/storage";
import type { LoginInput, RegisterInput, User } from "@/lib/types/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const hasAccessToken = Boolean(getAccessToken());
    const hasRefreshToken = Boolean(getRefreshToken());

    if (!hasAccessToken && !hasRefreshToken) {
      setUser(null);
      return;
    }

    if (!hasAccessToken) {
      const restored = await restoreSession();
      if (!restored) {
        setUser(null);
        return;
      }
    }

    try {
      const currentUser = await getCurrentUserWithAuth();
      setUser(currentUser);
      return;
    } catch {
      const restored = await restoreSession();
      if (!restored) {
        setUser(null);
        return;
      }
    }

    const currentUser = await getCurrentUserWithAuth();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        await Promise.race([
          refreshUser(),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => {
              reject(new Error("Session check timed out"));
            }, 10_000);
          }),
        ]);
      } catch {
        clearTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const tokens = await loginUser(input);
    setTokens(tokens.access_token, tokens.refresh_token);
    const currentUser = await getCurrentUserWithAuth();
    setUser(currentUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await registerUser(input);
    await login({ email: input.email, password: input.password });
  }, [login]);

  const logout = useCallback(async () => {
    await logoutUser();
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
