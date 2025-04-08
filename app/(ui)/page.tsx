'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Extensible } from '@/lib/models';
import Task from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import TaskCard from '@/components/task-card';

export default function Home() {
  const surreal = useLoggedInSurrealClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!surreal) return;

    const fetchTasks = async () => {
      try {
        const fetchedTasks = (
          await surreal.query<Extensible<Task>[][]>(
            'SELECT * FROM task ORDER BY name'
          )
        )[0];
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTasks();
  }, [surreal]);

  return (
    <div className="container flex flex-1 flex-col gap-8 py-8">
      {tasks.map((task) => (
        <TaskCard key={task.id.toString()} task={task} />
      ))}
    </div>
  );
}
