'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Extensible, Writeable } from '@/lib/models';
import { AdminTask } from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import TaskCard from '@/components/admin/task-card';

const query = `
SELECT
  id,
  name,
  content,
  points_solved,
  points_discovered,
  answer,

  $baseurl + "/" + record::id(id) + "-" + secret AS discover_url,
  count(<-discovered) AS discover_count,
  count(<-submitted) AS answer_count,
  count(<-(submitted WHERE correct = true)) AS solve_count
FROM task
ORDER BY name
`;

export default function AdminTasks() {
  const surreal = useLoggedInSurrealClient();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // TODO: replace this with a better solution
  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  useEffect(() => {
    if (!surreal) return;

    const fetchTasks = async () => {
      setRefetchTrigger(false);
      try {
        const fetchedTasks = (
          await surreal.query<Extensible<AdminTask>[][]>(query, {
            baseurl: window.location.origin,
          })
        )[0];
        setTasks(fetchedTasks);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTasks();
  }, [surreal, refetchTrigger]);

  const newTask = useCallback(async () => {
    if (!surreal) {
      console.error('Surreal client is not initialized');
      toast.error(
        'Nie udało się dodać nowego zadania: brak połączenia z bazą danych'
      );
      return;
    }

    const newTask: Writeable<AdminTask> = {
      name: '(Nowe zadanie)',
      content: '',
      points_discovered: 0,
      points_solved: 0,
      answer: 0,
    };

    try {
      await surreal.create<AdminTask, Writeable<AdminTask>>('task', newTask);

      console.log('Created new task');
      toast.success('Dodano nowe zadanie');
      setRefetchTrigger(true);
    } catch (err) {
      console.error('Failed to create new task:', err);
      toast.error('Nie udało się dodać nowego zadania');
    }
  }, [surreal]);

  return (
    <div className="container flex flex-1 flex-col gap-4 py-8 md:gap-6">
      <Button type="button" className="cursor-pointer" onClick={newTask}>
        Nowe zadanie
        <Plus />
      </Button>
      {tasks.map((task) => (
        <TaskCard
          key={task.id.toString()}
          task={task}
          setRefetchTrigger={setRefetchTrigger}
        />
      ))}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          {/* TODO: maybe replace this with a skeleton */}
          <Spinner />
        </div>
      )}
    </div>
  );
}
