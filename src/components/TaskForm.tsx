'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { suggestTaskDescription } from '@/ai/flows/suggest-task-description';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  summary: z.string().min(1, 'Task summary is required.'),
  description: z.string().min(1, 'Task description is required.'),
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (data: FormValues) => void;
  taskToEdit: Task | null;
}

export default function TaskForm({
  isOpen,
  setIsOpen,
  onSave,
  taskToEdit,
}: TaskFormProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: '',
      description: '',
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        form.reset({
          summary: taskToEdit.summary,
          description: taskToEdit.description,
          dueDate: new Date(taskToEdit.dueDate),
        });
      } else {
        form.reset({
          summary: '',
          description: '',
          dueDate: undefined,
        });
      }
    }
  }, [isOpen, taskToEdit, form]);

  const handleSuggestDescription = async () => {
    const summary = form.getValues('summary');
    if (!summary) {
      toast({
        variant: 'destructive',
        title: 'Summary needed',
        description: 'Please enter a task summary first to get suggestions.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestTaskDescription({ taskSummary: summary });
      form.setValue('description', result.suggestedDescription, {
        shouldValidate: true,
      });
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: 'Could not generate a description. Please try again.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update your task's details below." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Summary</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Plan team meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleSuggestDescription}
                      disabled={isSuggesting}
                      className="text-accent-foreground hover:bg-accent/20"
                    >
                      {isSuggesting ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                      )}
                      Suggest with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Draft an agenda, book a conference room, and send out invitations..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground">
                {taskToEdit ? 'Save Changes' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
