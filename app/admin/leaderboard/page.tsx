'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Extensible } from '@/lib/models';
import LeaderboardUser, {
  leaderboard_columns,
} from '@/lib/models/leaderboard_user';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { DataTable } from '@/components/ui/data-table';

export default function AdminLeaderboard() {
  const surreal = useLoggedInSurrealClient();
  const [data, setData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (!surreal) return;

    let timeout: NodeJS.Timeout | null = null;

    const fetchTasks = async () => {
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
          LIMIT 100;
        `)
        )[0];

        setData(fetchedData);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }

      timeout = setTimeout(() => {
        fetchTasks();
      }, 10000);
    };

    fetchTasks();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [surreal]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={leaderboard_columns} data={data} />
    </div>
  );
}
