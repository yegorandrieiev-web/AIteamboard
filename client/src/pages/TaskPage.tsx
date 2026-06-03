import { useEffect, useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TasksList } from '../features/tasks/components/TaskList';
import { useAuth } from '../shared/hooks/useAuth';
import { useDebounce } from '../shared/hooks/useDebounce';
import './TasksPage.css';
export const TasksPage = () => {
  const {
    tasks,
    loading,
    loadingAdd,
    loadingSearch,
    error,
    createTask,
    deleteTask,
    updateTaskStatus,
    doSearch,
    users,
    setUsers,
  } = useTasks();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const debouncedAssignedTo = useDebounce(assignedTo, 500);
  const isUserSelected = users.some((u) => u.username === assignedTo);
  const disabled = title.length < 3 || !isUserSelected || loadingAdd;
  useEffect(() => {
    if (debouncedAssignedTo.length > 0) {
      doSearch(debouncedAssignedTo);
    } else {
      setUsers([]);
    }
  }, [debouncedAssignedTo, setUsers, doSearch]);
  // 🔹 создание задачи
  const handleCreate = async () => {
    if (!title || !assignedTo) return;

    await createTask({
      title,
      description,
      assignedTo,
    });
    setTitle('');
    setDescription('');
    setAssignedTo('');
    console.log("Added task!");
  };
  if (authLoading || !user?.id) {
    return <div></div>;
  } else {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Task Board</h2>

          {/* форма */}
          <div style={styles.form}>
            <input
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Assign to username"
              maxLength={20}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
            {assignedTo.length > 0 && !isUserSelected && (
              <div style={styles.dropdown}>
                {users.length === 0 && (
                  <div style={styles.dropdownItem}>Nothing found</div>
                )}

                {!loadingSearch &&
                  users.map((user) => (
                    <div
                      key={user.id}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setAssignedTo(user.username);
                      }}
                    >
                      {user.username}
                    </div>
                  ))}
              </div>
            )}
            <button
              style={{
                ...styles.button,
                background: disabled ? '#e5e7eb' : '#2563eb',
                color: disabled ? '#9ca3af' : '#fff',
                opacity: loadingAdd ? 0.8 : 1,
              }}
              className={loadingAdd ? 'loading-btn' : ''}
              onClick={handleCreate}
              disabled={disabled}
            >
              {loadingAdd ? (
                <span className="dots">Creating</span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>

          {/* состояния */}
          {loading && <p style={styles.info}>Loading...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {/* список */}
          <div style={styles.list}>
            <TasksList
              tasks={tasks}
              currentUserId={user.id}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
            />
          </div>
        </div>
      </div>
    );
  }
};
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  form: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  },
  list: {
    marginTop: '10px',
  },
  info: {
    color: '#6b7280',
  },
  error: {
    color: '#dc2626',
    background: '#fee2e2',
    padding: '8px',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '70%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginTop: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    zIndex: 10,
  },
  dropdownItem: {
    padding: '10px',
    cursor: 'pointer',
  },
};
