'use client'; 
import { useState } from 'react';
import type { Task } from './types';
export default function TaskListClient({ initialTasks } : {initialTasks: Task[]}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  return (
    <div>
      {tasks.map((task: Task) => <div key={task.id}>{task.title}</div>)}
    </div>
  );
}