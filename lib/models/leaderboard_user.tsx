import { ColumnDef } from '@tanstack/react-table';
import { RecordId } from 'surrealdb';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import { ReadOnly } from '.';

export default interface LeaderboardUser {
  id: ReadOnly<RecordId>;
  name: string;

  points: ReadOnly<number>;

  discover_count: ReadOnly<number>;
  answer_count: ReadOnly<number>;
  solve_count: ReadOnly<number>;
}

export const leaderboard_columns: ColumnDef<LeaderboardUser>[] = [
  {
    accessorKey: 'name',
    header: 'Nazwa',
  },
  {
    accessorKey: 'points',
    header: 'Punkty',
  },
  {
    accessorKey: 'solve_count',
    header: 'Rozwiązania',
  },
  {
    accessorKey: 'answer_count',
    header: 'Odpowiedzi',
  },
  {
    accessorKey: 'discover_count',
    header: 'Odkrycia',
  },
].map((it) => ({
  ...it,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={it.header} />
  ),
}));
