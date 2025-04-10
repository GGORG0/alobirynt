import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { CheckCheck, Save, Search, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AdminTask } from '@/lib/models/task';
import { useLoggedInSurrealClient } from '@/hooks/surreal-provider';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';

export interface TaskCardProps {
  task: AdminTask;
  setRefetchTrigger: Dispatch<SetStateAction<boolean>>;
}

const formSchema = z.object({
  name: z.string(),
  content: z.string(),
  answer: z.coerce.number(),
  points_discovered: z.coerce.number(),
  points_solved: z.coerce.number(),
});

export default function AdminTaskCard({
  task,
  setRefetchTrigger,
}: TaskCardProps) {
  const surreal = useLoggedInSurrealClient();
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: task.name,
      content: task.content,
      answer: task.answer,
      points_discovered: task.points_discovered,
      points_solved: task.points_solved,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      console.log('Form submitted:', data);
      if (!surreal) {
        console.error('Surreal client is not initialized');
        toast.error(
          'Nie udało się edytować zadania: brak połączenia z bazą danych'
        );
        return;
      }

      try {
        await surreal.update(task.id, data);

        console.log('Saved task data');
        toast.success(`Zapisano dane zadania ${task.name}`);
        setOpen(false);
        setRefetchTrigger(true);
      } catch (err) {
        console.error('Failed to save task data:', err);
        toast.error('Nie udało się zapisać danych zadania');
      }
    },
    [setRefetchTrigger, surreal, task.id, task.name]
  );

  const deleteTask = useCallback(async () => {
    if (!surreal) {
      console.error('Surreal client is not initialized');
      toast.error(
        'Nie udało się usunąć zadania: brak połączenia z bazą danych'
      );
      return;
    }

    try {
      await surreal.delete(task.id);

      console.log('Deleted task');
      toast.success('Usunięto zadanie');
      setOpen(false);
      setRefetchTrigger(true);
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Nie udało się usunąć zadania');
    }
  }, [setRefetchTrigger, surreal, task.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer">
          <CardHeader>
            <CardTitle>{task.name}</CardTitle>
            <CardDescription className="mt-1 flex flex-row gap-2">
              <Badge variant="secondary">
                <Search />
                {task.points_discovered} pkt
              </Badge>
              <Badge variant="secondary">
                <CheckCheck />
                {task.points_solved} pkt
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
          <DialogDescription>
            <div>
              Liczba odkryć: <strong>{task.discover_count}</strong>
            </div>
            <div>
              Liczba przesłanych rozwiązań: <strong>{task.answer_count}</strong>{' '}
              (<strong>{task.solve_count}</strong> poprawnych)
            </div>
          </DialogDescription>
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="discoverurl" className="mb-2">
                Adres odkrycia
              </Label>
              <Input
                id="discoverurl"
                defaultValue={task.discover_url}
                readOnly
              />
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treść</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odpowiedź</FormLabel>
                      <FormControl>
                        <Input
                          className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points_discovered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Punkty za odkrycie</FormLabel>
                      <FormControl>
                        <Input
                          className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points_solved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Punkty za rozwiązanie</FormLabel>
                      <FormControl>
                        <Input
                          className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={deleteTask}
                    className="cursor-pointer"
                  >
                    Usuń
                    <span className="ml-1">
                      <Trash2 />
                    </span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="cursor-pointer"
                  >
                    Zapisz
                    <span className="ml-1">
                      {form.formState.isSubmitting ? (
                        <Spinner size="small" />
                      ) : (
                        <Save />
                      )}
                    </span>
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
