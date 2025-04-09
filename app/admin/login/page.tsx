'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { z } from 'zod';

import {
  ADMIN_LOGIN_INFO_LOCALSTORAGE_KEY,
  SavedLoginInfo,
  useSurreal,
} from '@/hooks/surreal-provider';
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
  username: z.string(),
  password: z.string(),
});

export default function AdminLoginPage() {
  const router = useRouter();

  const { client: surreal, isSuccess, isLoggedIn } = useSurreal();

  const [isQuerying, setIsQuerying] = useState(true);

  const [, setLoginInfo] = useLocalStorage<SavedLoginInfo | null>(
    ADMIN_LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  useEffect(() => {
    if (!isSuccess || !surreal) return;

    if (isLoggedIn) {
      console.log('User is already logged in!');
      router.replace('/admin');
    }

    const detectLoggedIn = async () => {
      try {
        const user = await surreal.info();

        console.log('User is already logged in:', user);
        router.replace('/admin');
      } catch (err) {
        console.log('User is not logged in:', err);

        setIsQuerying(false);
      }
    };

    detectLoggedIn();
  }, [surreal, router, isSuccess, isLoggedIn]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      console.log('Form submitted:', data);
      if (!isSuccess || !surreal) {
        console.error('Surreal client is not initialized');
        toast.error('Nie udało się zalogować: brak połączenia z bazą danych');
        return;
      }

      try {
        await surreal.signin({
          namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
          username: data.username,
          password: data.password,
        });

        setLoginInfo({
          username: data.username,
          password: data.password,
        });

        console.log('Logged in successfully');
        toast.success(`Zalogowano pomyślnie`);
        router.replace('/admin');
      } catch (err) {
        console.error('Error during signin:', err);
        toast.error('Nie udało się zalogować');
      }
    },
    [isSuccess, surreal, setLoginInfo, router]
  );

  if (isQuerying) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="text-2xl">Zaloguj się do panelu administratora</h1>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
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
    </div>
  );
}
