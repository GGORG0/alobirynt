'use client';

import { useCallback, useEffect, useState } from 'react';
import { LogOut, User as UserIcon, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';

import { Extensible } from '@/lib/models';
import User from '@/lib/models/user';
import {
  LOGIN_INFO_LOCALSTORAGE_KEY,
  SavedLoginInfo,
  useSurreal,
} from '@/hooks/surreal-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function ProfileMenu() {
  const { client: surreal, isLoggedIn } = useSurreal();
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!surreal || !isLoggedIn) return;

    const fetchUser = async () => {
      try {
        const fetchedUser = await surreal.info<Extensible<User>>();
        if (!fetchedUser) {
          console.error('User info is null');
          return;
        }
        setUser(fetchedUser);

        const fetchedPoints = (
          await surreal.query<number[]>(
            'SELECT VALUE math::sum(->discovered->task.points_discovered) + math::sum(->(submitted WHERE correct = true)->task.points_solved) FROM ONLY $auth'
          )
        )[0];
        setPoints(fetchedPoints);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, [isLoggedIn, surreal]);

  const [, setLoginInfo] = useLocalStorage<SavedLoginInfo | null>(
    LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  const logOut = useCallback(async () => {
    if (!surreal) return;

    try {
      await surreal.invalidate();
      setUser(null);
      setLoginInfo(null);
      toast.success('Wylogowano pomyślnie');
      window.location.reload();
    } catch (err) {
      console.error('Failed to log out:', err);
      toast.error('Nie udało się wylogować');
    }
  }, [setLoginInfo, surreal]);

  const deleteAccount = useCallback(async () => {
    if (!surreal) return;

    try {
      await surreal.query('DELETE $auth');
      setUser(null);
      setLoginInfo(null);
      toast.success('Konto zostało usunięte');
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete account:', err);
      toast.error('Nie udało się usunąć konta');
    }
  }, [setLoginInfo, surreal]);

  if (!user) {
    return <></>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => {}}>
          <UserIcon />
          <span className="sr-only">Profil</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-50 flex-col gap-4">
        <div>{user.name}</div>

        {points !== null && <Badge>{points} pkt</Badge>}

        <Button onClick={logOut}>
          <LogOut />
          Wyloguj się
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <UserX />
              Usuń konto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Usuń konto</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz usunąć swoje konto? To usunie wszystkie
                twoje rozwiązania zadań. Nie można tego cofnąć.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount}>
                Usuń konto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  );
}
