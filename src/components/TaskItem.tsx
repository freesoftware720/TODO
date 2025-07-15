'use client';

import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import {
  CalendarIcon,
  Check,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const isOverdue = !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const dueDateText = format(new Date(task.dueDate), 'MMM d, yyyy');

  return (
    <>
      <Card
        className={cn(
          'transition-all duration-300',
          task.completed ? 'bg-card/50 opacity-60' : 'bg-card'
        )}
      >
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
            aria-label={`Mark "${task.summary}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1 grid gap-1">
            <CardTitle
              className={cn(
                'text-lg transition-colors',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.summary}
            </CardTitle>
            <div
              className={cn(
                'flex items-center text-sm',
                isOverdue
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {dueDateText}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Task options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteAlertOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 pl-12">
          <CardDescription
            className={cn(
              'transition-colors',
              task.completed && 'line-through'
            )}
          >
            {task.description}
          </CardDescription>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(task.id);
                setIsDeleteAlertOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
