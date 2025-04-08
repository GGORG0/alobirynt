'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Extensible } from '@/lib/models';
import Task from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';

export default function Home() {
  const surreal = useLoggedInSurrealClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!surreal) return;

    const fetchTasks = async () => {
      try {
        const res = await surreal.select<Extensible<Task>>('task');
        setTasks(res);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTasks();
  }, [surreal]);

  return <pre>{JSON.stringify(tasks, null, 2)}</pre>;
}
