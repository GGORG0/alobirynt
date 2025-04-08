import { RecordId } from 'surrealdb';

import { ReadOnly, Writeable } from '.';

export interface DiscoveredTask {
  id: ReadOnly<RecordId>;
  name: string;
  content: string;

  secret_hash: ReadOnly<string>;
  answer_hash: ReadOnly<string>;

  points_solved: number;
  points_discovered: number;

  discovered: ReadOnly<true>;
  solved: ReadOnly<boolean>;
  answered: ReadOnly<boolean>;
}

export type NonDiscoveredTask = Omit<
  DiscoveredTask,
  'content' | 'answer_hash' | 'discovered'
> & {
  discovered: ReadOnly<false>;
};

type Task = DiscoveredTask | NonDiscoveredTask;
export default Task;

export function isDiscovered(task: Task): task is DiscoveredTask {
  return task.discovered === true;
}

export type WriteableTask = Writeable<Task>;
