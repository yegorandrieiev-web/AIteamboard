import { prisma } from '../lib/prisma';
import TaskListClient from './TaskListClient'; 
export default async function TasksPage() {

  const tasks = await prisma.task.findMany({
    include: {
      assignedToUser: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Board (SSR)</h1>
      <TaskListClient initialTasks={tasks} />
    </div>
  );
}