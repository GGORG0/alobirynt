'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Surreal } from 'surrealdb';
import { useLocalStorage } from 'usehooks-ts';

import { Extensible } from '@/lib/models';
import User from '@/lib/models/user';

interface SurrealProviderProps {
  children: React.ReactNode;
  /** The database endpoint URL */
  endpoint: string;
  /** Optional existing Surreal client */
  client?: Surreal;
  /* Optional connection parameters */
  params?: Parameters<Surreal['connect']>[1];
  /** Auto connect on component mount, defaults to true */
  autoConnect?: boolean;
  /** Automatically try to log in on connection success, defaults to true */
  autoLogIn?: boolean;
}

interface SurrealProviderState {
  /** The Surreal instance */
  client: Surreal;
  /** Whether the connection is pending */
  isConnecting: boolean;
  /** Whether the connection was successfully established */
  isSuccess: boolean;
  /** Whether the connection rejected in an error */
  isError: boolean;
  /** Whether the user is logged in */
  isLoggedIn: boolean;
  /** The connection error, if present */
  error: unknown;
  /** Connect to the Surreal instance */
  connect: () => Promise<true>;
  /** Close the Surreal instance */
  close: () => Promise<true>;
}

const SurrealContext = createContext<SurrealProviderState | undefined>(
  undefined
);

export function SurrealProvider({
  children,
  client,
  endpoint,
  params,
  autoConnect = true,
  autoLogIn = true,
}: SurrealProviderProps) {
  // Surreal instance remains stable across re-renders
  const [surrealInstance] = useState(() => client ?? new Surreal());

  // State to store the login status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Store the login info in local storage
  const [loginInfo] = useLocalStorage<SavedLoginInfo | null>(
    LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  // Next Router instance for redirecting to the login page
  const router = useRouter();

  // React Query mutation for connecting to Surreal
  const {
    mutateAsync: connectMutation,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  } = useMutation({
    mutationFn: () => surrealInstance.connect(endpoint, params),
  });

  // Wrap mutateAsync in a stable callback
  const connect = useCallback(() => connectMutation(), [connectMutation]);

  // Wrap close() in a stable callback
  const close = useCallback(() => surrealInstance.close(), [surrealInstance]);

  // Auto-connect on mount (if enabled) and cleanup on unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      reset();
      surrealInstance.close();
    };
  }, [autoConnect, connect, reset, surrealInstance]);

  // Auto-login on connection success (if enabled)
  useEffect(() => {
    if (!autoLogIn || !isSuccess || !surrealInstance) return;

    if (!loginInfo) {
      setIsLoggedIn(false);
      router.push('/login');
      return;
    }

    const autoLogin = async () => {
      try {
        const token = await surrealInstance.signin({
          namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
          database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
          access: 'user',
          variables: {
            name: loginInfo.username,
            password: loginInfo.password,
          },
        });

        await surrealInstance.authenticate(token);
        const user = await surrealInstance.info<Extensible<User>>();

        if (!user) {
          console.error('Auto login failed: user info is null');
          return;
        }

        console.log('Automatically logged in as:', user);
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
        console.error('Auto login failed:', err);
        router.push('/login');
      }
    };

    autoLogin();
  }, [autoLogIn, isSuccess, loginInfo, router, surrealInstance]);

  // Memoize the context value
  const value: SurrealProviderState = useMemo(
    () => ({
      client: surrealInstance,
      isConnecting: isPending,
      isSuccess,
      isError,
      isLoggedIn,
      error,
      connect,
      close,
    }),
    [
      surrealInstance,
      isPending,
      isSuccess,
      isError,
      isLoggedIn,
      error,
      connect,
      close,
    ]
  );

  return (
    <SurrealContext.Provider value={value}>{children}</SurrealContext.Provider>
  );
}

/**
 * Access the Surreal connection state from the context.
 */
export function useSurreal() {
  const context = useContext(SurrealContext);
  if (!context) {
    throw new Error('useSurreal must be used within a SurrealProvider');
  }
  return context;
}

/**
 * Access the Surreal client from the context.
 */
export function useSurrealClient() {
  const { client, isSuccess } = useSurreal();
  if (!isSuccess) return null;
  return client;
}

/**
 * Access the Surreal client from the context, asserting that it is logged in.
 */
export function useLoggedInSurrealClient() {
  const { client, isSuccess, isLoggedIn } = useSurreal();
  if (!isSuccess || !isLoggedIn) return null;
  return client;
}

export interface SavedLoginInfo {
  username: string;
  password: string;
}

export const LOGIN_INFO_LOCALSTORAGE_KEY = 'loginInfo';
