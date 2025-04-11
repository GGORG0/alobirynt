'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { z } from 'zod';

import { Extensible } from '@/lib/models';
import User from '@/lib/models/user';
import {
  LOGIN_INFO_LOCALSTORAGE_KEY,
  SavedLoginInfo,
  useSurreal,
} from '@/hooks/surreal-provider';
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
  username: z
    .string()
    .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki')
    .max(20, 'Nazwa użytkownika nie może mieć więcej niż 20 znaków')
    .regex(
      /^[a-zA-Z0-9]+$/,
      'Nazwa użytkownika może zawierać tylko litery i cyfry'
    ),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const { client: surreal, isSuccess, isLoggedIn } = useSurreal();

  const [isQuerying, setIsQuerying] = useState(true);

  const [, setLoginInfo] = useLocalStorage<SavedLoginInfo | null>(
    LOGIN_INFO_LOCALSTORAGE_KEY,
    null
  );

  useEffect(() => {
    if (!isSuccess || !surreal) return;

    if (isLoggedIn) {
      console.log('User is already logged in!');
      router.replace(nextUrl);
    }

    const detectLoggedIn = async () => {
      try {
        const user = await surreal.info();

        console.log('User is already logged in:', user);
        router.replace(nextUrl);
      } catch (err) {
        console.log('User is not logged in:', err);

        setIsQuerying(false);
      }
    };

    detectLoggedIn();
  }, [surreal, router, isSuccess, isLoggedIn, nextUrl]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
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
        await surreal.signup({
          namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
          database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
          access: 'user',
          variables: {
            name: data.username,
          },
        });
        console.log('Authenticated successfully');

        const user = await surreal.info<Extensible<User>>();

        if (!user) {
          console.error('User info is null');
          toast.error('Nie udało się zalogować');
          return;
        }

        setLoginInfo({
          username: user.name,
          password: user.password,
        });

        console.log('Logged in successfully as:', user);
        toast.success(`Zalogowano pomyślnie jako ${user.name}`);
        router.replace(nextUrl);
      } catch (err) {
        // TODO: allow account transfer
        console.error('Error during signup:', err);
        toast.error('Nie udało się zalogować', {
          description: 'Spróbuj użyć innej nazwy użytkownika',
        });
      }
    },
    [isSuccess, surreal, setLoginInfo, router, nextUrl]
  );

  if (isQuerying) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="text-2xl">Stwórz konto</h1>
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
                <FormDescription>
                  Wybierz nazwę użytkownika, a konto zostanie utworzone
                  automatycznie. Nie potrzebujemy żadnych innych danych o Tobie
                  (nawet hasła!), a nazwa użytkownika będzie wykorzystana tylko
                  w celach identyficaji uczestników podczas konkursu. Dane
                  logowania zostaną zapisane w pamięci lokalnej Twojej
                  przeglądarki. Możesz w każdej chwili się wylogować lub usunąć
                  konto.
                </FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Rozpocznij grę
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
