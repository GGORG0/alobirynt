import { RecordId } from 'surrealdb';

import { ReadOnly, Writeable } from '.';

export default interface User {
  id: ReadOnly<RecordId>;

  name: string;
  password: ReadOnly<string>;
}

export type WriteableUser = Writeable<User>;
