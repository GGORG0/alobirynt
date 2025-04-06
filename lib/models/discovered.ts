import { RecordId } from 'surrealdb';

import { ReadOnly } from '.';

export default interface Discovered {
  id: ReadOnly<RecordId>;

  in: RecordId;
  out: RecordId;

  secret: string;
  timestamp: ReadOnly<Date>;
}
