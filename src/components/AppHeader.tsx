'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface AppHeaderProps {
  onAddTask: () => void;
}

export default function AppHeader({ onAddTask }: AppHeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold font-headline tracking-tight text-primary-foreground bg-primary/90 px-3 py-1 rounded-lg">
          TaskZen
        </h1>
        <Button onClick={onAddTask} className="bg-primary hover:bg-primary/80 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </div>
    </header>
  );
}
