'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Extensible } from '@/lib/models';
import LeaderboardUser from '@/lib/models/leaderboard_user';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { Spinner } from '@/components/ui/spinner';
import AdminLeaderboardTable from '@/components/admin/leaderboard-table';

export default function AdminLeaderboard() {
  const surreal = useLoggedInSurrealClient();
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!surreal) return;

    const fetchTasks = async () => {
      try {
        const fetchedData =
          await surreal.select<Extensible<LeaderboardUser>>('leaderboard_user');

        setData(fetchedData);

        console.log('Fetched initial data');
        setIsFetching(false);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTasks();
  }, [surreal]);

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AdminLeaderboardTable initialData={data} />;
}
