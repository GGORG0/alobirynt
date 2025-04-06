'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import User from '@/lib/models/user';
import { useSurrealClient } from '@/hooks/surreal-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
  username: z
    .string()
    .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki')
    .max(20, 'Nazwa użytkownika nie może mieć więcej niż 20 znaków'),
});

export default function LoginPage() {
  const router = useRouter();
  const surreal = useSurrealClient();

  const [isQuerying, setIsQuerying] = useState(true);

  useEffect(() => {
    const detectLoggedIn = async () => {
      try {
        const user = await surreal.info();

        console.log('User is already logged in:', user);

        router.replace('/');
      } catch (err) {
        console.log('User is not logged in:', err);

        setIsQuerying(false);
      }
    };

    detectLoggedIn();
  }, [surreal, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      console.log('Form submitted:', data);

      try {
        const token = await surreal.signup({
          namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
          database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
          access: 'user',
          variables: {
            name: data.username,
          },
        });
        console.log('Token received:', token);

        await surreal.authenticate(token);
        console.log('Authenticated successfully');

        const user = await surreal.info<User>();
        console.log('User info:', user);

        toast(`Zalogowano pomyślnie jako ${user.name}`);
        router.replace('/');
      } catch (err) {
        console.error('Error during signup:', err);
        toast.error('Nie udało się zalogować');
      }
    },
    [surreal, router]
  );

  if (isQuerying) {
    return <Spinner />;
  }

  return (
    <>
      <h1 className="text-2xl">Zaloguj się</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col space-y-4 p-8 md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa użytkownika</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Zaloguj się
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
  );
}
