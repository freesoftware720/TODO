'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import AppHeader from '@/components/AppHeader';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';

// Simple nanoid implementation as we can't add a new library
const nanoid = (size = 21) =>
  crypto
    .getRandomValues(new Uint8Array(size))
    .reduce((id, byte) => {
      byte &= 63;
      if (byte < 36) {
        id += byte.toString(36);
      } else if (byte < 62) {
        id += (byte - 26).toString(36).toUpperCase();
      } else if (byte > 62) {
        id += '-';
      } else {
        id += '_';
      }
      return id;
    }, '');


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to local storage", error);
      }
    }
  }, [tasks]);

  const handleAddTaskClick = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (taskToEdit) {
      setTasks(
        tasks.map((task) =>
          task.id === taskToEdit.id ? { ...taskToEdit, ...taskData } : task
        )
      );
    } else {
      setTasks([...tasks, { ...taskData, id: nanoid(), completed: false }]);
    }
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onAddTask={handleAddTaskClick} />
      <main className="container mx-auto p-4 md:p-8">
        <TaskList
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      </main>
      <TaskForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
