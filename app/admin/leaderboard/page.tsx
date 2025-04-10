'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Extensible } from '@/lib/models';
import LeaderboardUser, {
  leaderboard_columns,
} from '@/lib/models/leaderboard_user';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
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
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';

export default function AdminLeaderboard() {
  const surreal = useLoggedInSurrealClient();

  const [data, setData] = useState<LeaderboardUser[]>([]);

  const [refreshInterval, setRefreshInterval] = useState<number>(10000);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const fetchTasks = async () => {
      if (!surreal) {
        console.error('Surreal client is not initialized');
        toast.error(
          'Nie udało się pobrać zadań: brak połączenia z bazą danych'
        );
        return;
      }

      try {
        const fetchedData = (
          await surreal.query<Extensible<LeaderboardUser>[][]>(`
          SELECT
            name,
            math::sum(->discovered->task.points_discovered) + math::sum(->(submitted WHERE correct = true)->task.points_solved) AS points,
            count(->discovered) AS discover_count,
            count(->submitted) as answer_count,
            count(->(submitted WHERE correct = true)) AS solve_count
          FROM user
          WHERE count(->discovered) > 0
          ORDER BY points DESC
          LIMIT 50;
        `)
        )[0];

        setData(fetchedData);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }

      timeout = setTimeout(() => {
        fetchTasks();
      }, refreshInterval);
    };

    fetchTasks();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [refreshInterval, surreal]);

  const purgeDatabase = useCallback(async () => {
    if (!surreal) {
      console.error('Surreal client is not initialized');
      toast.error(
        'Nie udało się wyczyścić bazy danych: brak połączenia z bazą danych'
      );
      return;
    }

    try {
      await surreal.delete('submitted');
      await surreal.delete('discovered');
      await surreal.delete('user');

      console.log('Purged DB');
      toast.success('Wyczyszczono bazę danych');
    } catch (err) {
      console.error('Failed to purge DB:', err);
      toast.error('Nie udało się wyczyścić bazy danych');
    }
  }, [surreal]);

  return (
    <div className="container mx-auto flex flex-col gap-4 py-10">
      <h1 className="text-3xl font-bold">Tablica wyników</h1>
      <div className="flex items-center gap-4">
        <Label htmlFor="refresh-interval">
          Częstotliwość odświeżania (sek):
        </Label>
        <input
          type="number"
          id="refresh-interval"
          value={refreshInterval / 1000}
          min={1}
          onChange={(e) => {
            const value = parseInt(e.target.value) * 1000;
            if (!isNaN(value) && value >= 1000) {
              setRefreshInterval(value);
            }
          }}
          className="w-24 rounded border p-2"
        />
      </div>
      <DataTable columns={leaderboard_columns} data={data} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="cursor-pointer">
            Wyczyść bazę danych <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy jesteś pewny?</AlertDialogTitle>
            <AlertDialogDescription>
              To usunie wszystkie konta uczestników, ich odkrycia i przesłane
              odpowiedzi. Zadania nie zostaną usunięte. Nie można cofnąć tej
              akcji.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={purgeDatabase}>
              Kontynuuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
