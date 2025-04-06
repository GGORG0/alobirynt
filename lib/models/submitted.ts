import { RecordId } from 'surrealdb';

import { ReadOnly } from '.';

export default interface Submitted {
  id: ReadOnly<RecordId>;

  in: RecordId;
  out: RecordId;

  answer: string;
  correct: ReadOnly<boolean>;
  timestamp: ReadOnly<Date>;
}
