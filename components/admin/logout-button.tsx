'use client';

import { useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';

import {
  ADMIN_LOGIN_INFO_LOCALSTORAGE_KEY,
  SavedLoginInfo,
  useSurreal,
} from '@/hooks/surreal-provider';
import { Button } from '@/components/ui/button';

export default function AdminLogoutButton() {
  const { client: surreal, isLoggedIn } = useSurreal();

  const [, setLoginInfo] = useLocalStorage<SavedLoginInfo | null>(
    ADMIN_LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  const logOut = useCallback(async () => {
    if (!surreal) return;

    try {
      await surreal.invalidate();
      setLoginInfo(null);
      toast.success('Wylogowano pomyślnie');
      window.location.reload();
    } catch (err) {
      console.error('Failed to log out:', err);
      toast.error('Nie udało się wylogować');
    }
  }, [setLoginInfo, surreal]);

  if (!isLoggedIn) {
    return <></>;
  }

  return (
    <Button variant="outline" size="icon" onClick={logOut}>
      <LogOut />
      <span className="sr-only">Wyloguj się</span>
    </Button>
  );
}
