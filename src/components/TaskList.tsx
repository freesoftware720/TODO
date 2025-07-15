'use client';

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { isToday, isPast, isFuture } from 'date-fns';
import { Separator } from './ui/separator';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const { overdue, today, upcoming, completed } = useMemo(() => {
    const incompleteTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const isOverdue = (date: Date) => isPast(date) && !isToday(date);

    return {
      overdue: incompleteTasks.filter((t) => isOverdue(new Date(t.dueDate))).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
      today: incompleteTasks.filter((t) => isToday(new Date(t.dueDate))),
      upcoming: incompleteTasks.filter((t) => isFuture(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
      completed: completedTasks.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    };
  }, [tasks]);

  const renderTaskSection = (title: string, taskGroup: Task[]) => {
    if (taskGroup.length === 0) return null;
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-primary/50 font-headline">
          {title}
        </h2>
        <div className="space-y-4">
          {taskGroup.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </section>
    );
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold text-muted-foreground">No tasks yet!</h2>
        <p className="mt-2 text-muted-foreground">Click "Add Task" to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {renderTaskSection('Overdue', overdue)}
      {renderTaskSection('Today', today)}
      {renderTaskSection('Upcoming', upcoming)}
      {completed.length > 0 && overdue.length + today.length + upcoming.length > 0 && <Separator className="my-8"/>}
      {renderTaskSection('Completed', completed)}
    </div>
  );
}
