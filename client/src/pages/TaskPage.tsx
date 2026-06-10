import { useEffect, useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TasksList } from '../features/tasks/components/TaskList';
import { useAuth } from '../shared/hooks/useAuth';
import { useDebounce } from '../shared/hooks/useDebounce';
import { request } from '../shared/api/client';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
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
  const checkAiLimit = (): { allowed: boolean; remaining: number } => {
      const now = Date.now();
      const limitData = localStorage.getItem('ai_generation_limits');
      if (!limitData) {
        const newData = { count: 1, resetTime: now + 15 * 60 * 1000 };
        localStorage.setItem('ai_generation_limits', JSON.stringify(newData));
        return { allowed: true, remaining: 4 };
      }
      const { count, resetTime } = JSON.parse(limitData);
      if (now > resetTime) {
        const newData = { count: 1, resetTime: now + 15 * 60 * 1000 };
        localStorage.setItem('ai_generation_limits', JSON.stringify(newData));
        return { allowed: true, remaining: 4 };
      }
      if (count >= 5) {
        return { allowed: false, remaining: 0 };
      }
      const newData = { count: count + 1, resetTime };
      localStorage.setItem('ai_generation_limits', JSON.stringify(newData));
      return { allowed: true, remaining: 5 - (count + 1) };
  };
  const handleGenerateDescription = async () => {
    setAiError('');
    const limit = checkAiLimit();
    if (!limit.allowed) {
      setAiError('Rate limit exceeded: 5 generations in 15 minutes. Please try again later.');
      return;
    }
    try {
      setIsGenerating(true);
      const data = await request(`/ai/generate-description`,{method: 'POST', body:JSON.stringify({taskTitle: title})});
      if (!data) {
        throw new Error(data.error || 'Failed to generate');
      }
      setDescription(data.description);
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      setAiError(error.message || 'Generation error');
    } finally {
      setIsGenerating(false);
    }
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
           <textarea
              style={{ ...styles.input, resize: 'none' }}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            {title.trim().length > 8 && (
              <button
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                style={{
                  ...styles.aiButton,
                  backgroundColor: isGenerating ? '#d2e3fc' : '#1a73e8',
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Description'}
              </button>
            )}
            {aiError && title.trim().length > 8 && <span style={styles.errorText}>{aiError}</span>}
            <input
              style={styles.input}
              placeholder="Assign to username"
              maxLength={20}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
            {assignedTo.length > 0 && !isUserSelected && (
              <div style={{...styles.dropdown,top: (title.trim().length > 8 && !aiError) ? '82%' : aiError ? "83.2%" : "79%",}}>
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
  aiButton: {
    alignSelf: 'flex-end',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: '12px',
    textAlign: 'right' as const,
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
