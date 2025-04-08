import { cva } from 'class-variance-authority';
import { Check, LockKeyhole, LockOpen, LucideProps, X } from 'lucide-react';

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

const badgeVariants = cva('absolute top-0 right-0 mr-6 size-10 rounded-full', {
  variants: {
    variant: {
      correct: 'bg-green-800 text-foreground [a&]:hover:bg-green-800/90',
      incorrect: '',
      unanswered: '',
      undiscovered: '',
    },
  },
});

export default function TaskCard({ task, onClick }: TaskCardProps) {
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

  return (
    <Card onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
      <CardHeader className="relative">
        <CardTitle>{task.name}</CardTitle>
        <CardDescription className="mt-1 flex flex-row gap-2">
          <Badge variant="secondary">
            {task.points_discovered} pkt za znalezienie
          </Badge>
          <Badge variant="secondary">
            {task.points_solved} pkt za rozwiązanie
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
