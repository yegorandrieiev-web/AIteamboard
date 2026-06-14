import { memo, useState } from 'react';
import type { Task, TaskStatus } from '../types';
type Props = {
  task: Task;
  currentUserId: string;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
};

export const TaskItem = memo(
  ({ task, currentUserId, onDelete, onStatusChange }: Props) => {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const isOwner = currentUserId && task.userId === currentUserId;
    const isAssigned = currentUserId && task.assignedToUserId === currentUserId;
    const [owner, setOwner] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchOwner = async () => {
      setIsLoading(true);
      try {
        const graphqlUrl = BASE_URL.replace('/api', ''); 
        const response = await fetch(`${graphqlUrl}/graphql`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'credentials': 'include'
          },
          body: JSON.stringify({
            query: `
              query GetTaskCreator($userId: ID!) {
                userById(id: $userId) {
                  username
                }
              }
            `,
            variables: { userId: task.userId },
          }),
        });
        const result = await response.json();
        if (result.data?.userById) {
          setOwner(result.data.userById.username);
        }
      } catch (err) {
        console.error('Failed to fetch owner:', err);
      } finally {
        setIsLoading(false);
      }
    };
    const handleStatusToggle = () => {
      const nextStatus: TaskStatus =
        task.status === 'todo'
          ? 'in_progress'
          : task.status === 'in_progress'
            ? 'done'
            : 'todo';
      onStatusChange(task.id, nextStatus);
    };
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h3>{task.title}</h3>
          {task.description && (
            <p style={styles.description}>{task.description}</p>
          )}
          <p style={styles.meta}>
            {owner ? (
              <span>
                Created by: <b>{owner}</b>
              </span>
            ) : (
              <button
                onClick={fetchOwner}
                disabled={isLoading}
                style={styles.findButton}
              >
                Find owner
              </button>
            )}
          </p>
          <p style={styles.meta}>
            Assigned to: {task.assignedToUser?.username || '—'}
          </p>
        </div>

        <div style={styles.actions}>
          {isAssigned && (
            <button onClick={handleStatusToggle}>{task.status}</button>
          )}
          {isOwner && <button onClick={() => onDelete(task.id)}>Delete</button>}
        </div>
      </div>
    );
  },
);
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  content: {
    flex: 1,
  },
  description: {
    color: '#666',
    fontSize: '14px',
  },
  meta: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  findButton: {
    padding: '2px 6px',
    fontSize: '10px',
    cursor: 'pointer',
    background: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
};
