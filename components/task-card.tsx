import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';

import Task from '@/lib/models/task';
import { cn } from '@/lib/utils';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from './ui/badge';

export interface TaskCardProps {
  task: Omit<Task, 'content' | 'answer_hash' | 'secret_hash'>;
  onClick?: () => void;
}

const badgeVariants = cva('absolute top-0 right-0 mr-6 size-8 rounded-full', {
  variants: {
    variant: {
      correct: 'bg-green-500',
      incorrect: 'bg-red-500',
      unanswered: 'hidden',
      undiscovered: 'bg-yellow-500',
    },
  },
});

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const badgeVariant = task.discovered
    ? task.answered
      ? task.solved
        ? 'correct'
        : 'incorrect'
      : 'unanswered'
    : 'undiscovered';

  return (
    <Card onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
      <CardHeader className="relative">
        <CardTitle>{task.name}</CardTitle>
        <CardDescription>desc</CardDescription>

        <Badge
          className={cn(
            badgeVariants({
              variant: badgeVariant,
            })
          )}
        >
          <Check className="size-16" />
        </Badge>
      </CardHeader>
    </Card>
  );
}
