import { RecordId } from 'surrealdb';

import { ReadOnly, Writeable } from '.';

interface DiscoveredTask {
  id: ReadOnly<RecordId>;
  name: string;
  content: string;
  secret_hash: ReadOnly<string>;
  answer_hash: ReadOnly<string>;
  points_solved: number;
  points_discovered: number;
  discovered: ReadOnly<true>;
}

type NonDiscoveredTask = Omit<
  DiscoveredTask,
  'content' | 'answer_hash' | 'discovered'
> & {
  discovered: ReadOnly<false>;
};

type Task = DiscoveredTask | NonDiscoveredTask;
export default Task;

export type WriteableTask = Writeable<Task>;
