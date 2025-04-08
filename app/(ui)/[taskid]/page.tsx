'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { RecordId } from 'surrealdb';

import { Extensible } from '@/lib/models';
import Task, { DiscoveredTask, isDiscovered } from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export default function TaskPage({
  params,
}: {
  params: Promise<{
    taskid: string;
  }>;
}) {
  const { taskid: taskId } = use(params);

  const searchParams = useSearchParams();
  const secret = searchParams.get('s');

  const surreal = useLoggedInSurrealClient();

  const [task, setTask] = useState<DiscoveredTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surreal) return;

    const fetchTask = async () => {
      try {
        const taskRecordId = new RecordId('task', taskId);

        let fetchedTask = await surreal.select<Extensible<Task>>(taskRecordId);

        if (!isDiscovered(fetchedTask)) {
          try {
            await surreal.query(
              'RELATE $auth->discovered->$task SET secret = $secret',
              {
                task: taskRecordId,
                secret,
              }
            );
          } catch (err) {
            setError('Nie udało się odkryć zadania');
            console.error('Failed to discover task:', err);
            toast.error('Nie udało się odkryć zadania');
            return;
          }

          fetchedTask = await surreal.select<Extensible<Task>>(taskRecordId);

          if (!isDiscovered(fetchedTask)) {
            setError('Nie udało się odkryć zadania');
            console.error('Failed to discover task');
            return;
          }
        }

        if (!fetchedTask) {
          setError('Nie znaleziono zadania');
          console.error('Task not found');
          return;
        }

        setTask(fetchedTask);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTask();
  }, [secret, surreal, taskId]);

  return (
    <div className="container flex flex-1 flex-col items-center gap-6 py-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wystąpił błąd</AlertTitle>
          <AlertDescription>
            <span>{error}</span>
          </AlertDescription>
        </Alert>
      )}
      {task && (
        <>
          <h1 className="text-4xl">{task.name}</h1>
          <h2 className="text-sm">
            Za poprawne rozwiązanie otrzymasz {task.points_solved} pkt.
          </h2>
          <Markdown remarkPlugins={[remarkGfm]}>{task.content}</Markdown>
        </>
      )}
      {!task && !error && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
