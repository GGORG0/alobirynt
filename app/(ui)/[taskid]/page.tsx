'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, SendHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { toast } from 'sonner';
import { RecordId } from 'surrealdb';
import { z } from 'zod';

import { Extensible } from '@/lib/models';
import Submitted from '@/lib/models/submitted';
import Task, { DiscoveredTask, isDiscovered } from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
  answer: z.coerce.number(),
});

export default function TaskPage({
  params,
}: {
  params: Promise<{
    taskid: string;
  }>;
}) {
  const { taskid: urlTaskId } = use(params);

  const { taskId, secret } = useMemo(() => {
    const parts = urlTaskId.split('-');
    return { taskId: parts[0], secret: parts[1] };
  }, [urlTaskId]);

  const surreal = useLoggedInSurrealClient();

  const [task, setTask] = useState<DiscoveredTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [previousAnswer, setPreviousAnswer] = useState<Submitted | null>(null);

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

          toast.success(
            `Zadanie zostało odkryte! Otrzymujesz ${fetchedTask.points_discovered} pkt.`
          );
        }

        if (!fetchedTask) {
          setError('Nie znaleziono zadania');
          console.error('Task not found');
          return;
        }

        setTask(fetchedTask);

        if (fetchedTask.answered) {
          try {
            const submitted = (
              await surreal.query<Submitted[][]>(
                'SELECT * FROM $auth->submitted WHERE out = $task',
                {
                  task: taskRecordId,
                }
              )
            )[0][0];

            console.log('Got previously submitted answer:', submitted);

            if (submitted) {
              setPreviousAnswer(submitted);
            }
          } catch (err) {
            console.error('Failed to fetch submitted answer:', err);
            toast.error('Nie udało się pobrać Twojej odpowiedzi');
          }
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Nie udało się pobrać zadań');
      }
    };

    fetchTask();
  }, [secret, surreal, taskId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      /*
      TODO: this throws:
        A component is changing an uncontrolled input to be controlled.
        This is likely caused by the value changing from undefined to a defined value, which should not happen.
        Decide between using a controlled or uncontrolled input element for the lifetime of the component.
      */
      answer: undefined,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      console.log('Form submitted:', data);
      if (!surreal) {
        console.error('Surreal client is not initialized');
        toast.error(
          'Nie udało się przesłać odpowiedzi: brak połączenia z bazą danych'
        );
        return;
      }

      try {
        const taskRecordId = new RecordId('task', taskId);

        await surreal.query<Submitted[]>(
          'RELATE $auth->submitted->$task SET answer = $answer',
          {
            task: taskRecordId,
            answer: data.answer,
          }
        );

        const submitted = (
          await surreal.query<Submitted[][]>(
            'SELECT * FROM $auth->submitted WHERE out = $task',
            {
              task: taskRecordId,
            }
          )
        )[0][0];

        console.log('Submitted answer:', submitted);

        if (submitted) {
          setPreviousAnswer(submitted);
          if (submitted.correct) {
            toast.success(
              `Poprawna odpowiedź! Otrzymujesz ${task?.points_solved} pkt.`
            );
          } else {
            toast.error('Niepoprawna odpowiedź!');
          }
        } else {
          toast.error('Nie udało się przesłać odpowiedzi');
        }
      } catch (err) {
        console.error('Failed to submit answer:', err);
        toast.error('Nie udało się przesłać odpowiedzi');
      }
    },
    [surreal, task?.points_solved, taskId]
  );

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
          {(task.answered || previousAnswer) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Już odpowiedziałeś na to zadanie!</AlertTitle>
              <AlertDescription>
                <span>
                  Twoja odpowiedź była{' '}
                  <strong>
                    {!(task.solved || previousAnswer?.correct) && 'nie'}poprawna
                  </strong>
                  . Nie możesz już jej zmienić.
                </span>
                {previousAnswer && (
                  <div>
                    Odpowiedziałeś:{' '}
                    <strong>{previousAnswer.answer || 'Ładowanie...'}</strong>,{' '}
                    przesłana:{' '}
                    <strong>
                      {previousAnswer.timestamp.toLocaleString('pl-PL')}
                    </strong>
                    .
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <h1 className="text-4xl">{task.name}</h1>
          <h2 className="text-sm">
            Za poprawne rozwiązanie otrzymasz{' '}
            <Badge>{task.points_solved} pkt</Badge>.
          </h2>

          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {task.content}
          </Markdown>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col space-y-4 p-8 md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4"
            >
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odpowiedź</FormLabel>
                    <FormControl>
                      <Input
                        disabled={task.answered || previousAnswer !== null}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        placeholder="Wpisz odpowiedź"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Podaj odpowiedź w formie liczby całkowitej lub ułamka
                      dziesiętnego. Masz tylko jedną próbę.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  task.answered ||
                  previousAnswer !== null
                }
              >
                Wyślij odpowiedź
                <span className="ml-1">
                  {form.formState.isSubmitting ? (
                    <Spinner size="small" />
                  ) : (
                    <SendHorizontal />
                  )}
                </span>
              </Button>
            </form>
          </Form>
        </>
      )}
      {!task && !error && (
        <div className="flex flex-1 items-center justify-center">
          {/* TODO: maybe replace this with a skeleton */}
          <Spinner />
        </div>
      )}
    </div>
  );
}
