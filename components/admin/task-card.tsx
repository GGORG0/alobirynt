import { DialogTitle } from '@radix-ui/react-dialog';
import { CheckCheck, Search } from 'lucide-react';

import Task from '@/lib/models/task';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';

export interface TaskCardProps {
  task: Omit<Task, 'content' | 'answer_hash' | 'secret_hash'>;
}

export default function AdminTaskCard({ task }: TaskCardProps) {
  return (
    <Dialog>
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
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
