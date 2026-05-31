import { useCallback, useEffect, useState } from 'react';
import {
  tasksGetRequest,
  tasksAddRequest,
  taskStatusChangeRequest,
  tasksDeleteRequest,
  usersSearchRequest,
} from '../api/tasks';

import type { Task, TaskStatus } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await tasksGetRequest();
      setTasks(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const createTask = async (taskData: {
    title: string;
    description?: string;
    assignedTo?: string;
  }) => {
    try {
      setLoadingAdd(true);
      const newTask = await tasksAddRequest(taskData);

      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoadingAdd(false);
    }
  };
  const deleteTask = async (id: string) => {
    try {
      await tasksDeleteRequest(id);

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };
  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      await taskStatusChangeRequest(id, { status });

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status } : task)),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };
  const doSearch = useCallback(async (usernameValue: string) => {
    try {
      setLoadingSearch(true);
      const newUsers = await usersSearchRequest(usernameValue);
      setUsers(newUsers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoadingSearch(false);
    }
  }, []);
  useEffect(() => {
    fetchTasks();
  }, []);
  return {
    tasks,
    loading,
    loadingAdd,
    loadingSearch,
    error,
    users,
    setUsers,
    fetchTasks,
    createTask,
    deleteTask,
    updateTaskStatus,
    doSearch,
  };
};
