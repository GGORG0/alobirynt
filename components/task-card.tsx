import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cva } from 'class-variance-authority';
import {
  Check,
  CheckCheck,
  LockKeyhole,
  LockOpen,
  LucideProps,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import Task from '@/lib/models/task';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface TaskCardProps {
  task: Omit<Task, 'content' | 'answer_hash' | 'secret_hash'>;
}

const badgeVariants = cva('absolute top-0 right-0 mr-6 size-10 rounded-full', {
  variants: {
    variant: {
      correct: 'bg-green-700 text-white [a&]:hover:bg-green-700/90', // TODO: maybe make the color better adjust to light/dark mode
      incorrect: '',
      unanswered: '',
      undiscovered: '',
    },
  },
});

export default function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();

  const badgeVariant = task.discovered
    ? task.answered
      ? task.solved
        ? 'correct' // Check icon
        : 'incorrect' // X icon
      : 'unanswered' // LockOpen icon
    : 'undiscovered'; // LockKeyhole icon

  const badgeIconProps: LucideProps = {
    className: 'scale-140',
  };

  const onClick = useCallback(() => {
    if (task.discovered) {
      router.push(`/${task.id.id.toString()}`);
    } else {
      toast.warning('Nie odkryłeś jeszcze tego zadania! Szukaj dalej!');
    }
  }, [router, task.discovered, task.id.id]);

  return (
    <Card
      onClick={onClick}
      className={cn(
        task.discovered ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
      )}
    >
      <CardHeader className="relative">
        <CardTitle>{task.name}</CardTitle>
        <CardDescription className="mt-1 flex flex-row gap-2">
          <Badge variant={task.discovered ? 'default' : 'secondary'}>
            <Search />
            {task.points_discovered} pkt
          </Badge>
          <Badge variant={task.solved ? 'default' : 'secondary'}>
            <CheckCheck />
            {task.points_solved} pkt
          </Badge>
        </CardDescription>

        {/* the badge is pretty hacky, will maybe fix later */}
        <Badge
          variant={
            badgeVariant === 'correct'
              ? 'default'
              : badgeVariant === 'incorrect'
                ? 'destructive'
                : badgeVariant === 'undiscovered'
                  ? 'secondary'
                  : 'default'
          }
          className={cn(
            badgeVariants({
              variant: badgeVariant,
            })
          )}
        >
          {badgeVariant === 'correct' && <Check {...badgeIconProps} />}
          {badgeVariant === 'incorrect' && <X {...badgeIconProps} />}
          {badgeVariant === 'unanswered' && <LockOpen {...badgeIconProps} />}
          {badgeVariant === 'undiscovered' && (
            <LockKeyhole {...badgeIconProps} />
          )}
        </Badge>
      </CardHeader>
    </Card>
  );
}
