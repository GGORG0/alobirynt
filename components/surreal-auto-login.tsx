'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';

import { Extensible } from '@/lib/models';
import User from '@/lib/models/user';
import { useSurrealClient } from '@/hooks/surreal-provider';

export default function SurrealAutoLogin() {
  const router = useRouter();
  const surreal = useSurrealClient();

  const [loginInfo] = useLocalStorage<SavedLoginInfo | null>(
    LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  useEffect(() => {
    if (!surreal) return;
    if (!loginInfo) {
      router.push('/login');
      return;
    }

    const autoLogin = async () => {
      try {
        const token = await surreal.signin({
          namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
          database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
          access: 'user',
          variables: {
            name: loginInfo.username,
            password: loginInfo.password,
          },
        });
        console.log('Token received:', token);

        await surreal.authenticate(token);
        console.log('Authenticated successfully');

        const user = await surreal.info<Extensible<User>>();

        if (!user) {
          console.error('User info is null');
          toast.error('Nie udało się zalogować');
          return;
        }

        console.log('Automatically logged in successfully as:', user);
      } catch (err) {
        console.error('Auto login failed:', err);
        router.push('/login');
      }
    };

    autoLogin();
  }, [loginInfo, router, surreal]);

  return <></>;
}

export interface SavedLoginInfo {
  username: string;
  password: string;
}

export const LOGIN_INFO_LOCALSTORAGE_KEY = 'loginInfo';
