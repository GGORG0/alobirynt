'use client';

import { useEffect, useReducer } from 'react';
import { applyPatch, Operation } from 'fast-json-patch';
import { toast } from 'sonner';
import { Patch, Uuid } from 'surrealdb';

import LeaderboardUser, {
  leaderboard_columns,
} from '@/lib/models/leaderboard_user';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { DataTable } from '@/components/ui/data-table';

function dataReducer(state: LeaderboardUser[], patch: Patch) {
  return applyPatch({ ...state }, [patch as Operation], true).newDocument;
}

export interface AdminLeaderboardTableProps {
  initialData: LeaderboardUser[];
}

export default function AdminLeaderboardTable({
  initialData,
}: AdminLeaderboardTableProps) {
  const surreal = useLoggedInSurrealClient();
  const [data, dispatchPatch] = useReducer(dataReducer, initialData);

  useEffect(() => {
    if (!surreal) return;

    let liveQueryId: Uuid | null = null;

    const fetchTasks = async () => {
      try {
        liveQueryId = await surreal.live<Patch>(
          'leaderboard_user',
          (action, result) => {
            console.log('got event:', action, result);
            if (action === 'CLOSE') return;

            dispatchPatch(result);
          },
          true
        );
        console.log('Subscribed to leaderboard live updates');
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTasks();

    return () => {
      if (liveQueryId) {
        surreal.kill(liveQueryId).catch((err) => {
          console.error('Failed to kill live query:', err);
        });
      }
    };
  }, [surreal]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={leaderboard_columns} data={data} />
    </div>
  );
}
