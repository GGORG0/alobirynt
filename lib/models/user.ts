import { RecordId } from 'surrealdb';

import { ReadOnly, Writeable } from '.';

export default interface User {
  id: ReadOnly<RecordId>;

  name: string;
  password: ReadOnly<string>;

  points_discovered: ReadOnly<number>;
  points_solved: ReadOnly<number>;
  points: ReadOnly<number>;
}

export type WriteableUser = Writeable<User>;
