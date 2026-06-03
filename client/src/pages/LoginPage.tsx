import { useState } from 'react';
import { Input } from '../features/auth/components/Input';
import { Button } from '../features/auth/components/Button';
import { useLogin } from '../features/auth/hooks/useLogin';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, error, loading } = useLogin();

  const handleLogin = async () => {
    const res = await login(input, password);

    if (res) {
      navigate('/tasks');
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>

        <Input
          placeholder="Email or Username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}

        <Button
          title={loading ? 'Loading...' : 'Login'}
          onClick={handleLogin}
        />
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 
          rounded-lg bg-white text-gray-700 font-small hover:bg-gray-50 transition-colors shadow-sm duration-200 mt-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 object-contain"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.48-1.12 2.74-2.38 3.58v2.97h3.84c2.24-2.06 3.67-5.1 3.67-8.4z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.97c-1.08.73-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.27v3.08C3.25 21.17 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.27a7.21 7.21 0 0 1 0-4.54V6.65H1.27a11.94 11.94 0 0 0 0 10.7l3.97-3.08z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.93 1.19 15.24 0 12 0 7.37 0 3.25 2.83 1.27 6.65l3.97 3.08c.95-2.88 3.61-5.01 6.76-5.01z"
            />
          </svg>
          Sign in with Google
        </button>
        <p style={styles.resetText}>
          <a href="/reset" style={styles.resetLink}>
            Forgot password?
          </a>
        </p>
        <p style={styles.footerText}>
          Don’t have an account?{' '}
          <a style={styles.link} href="/register">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f9fafb',
  },
  card: {
    width: '360px',
    padding: '24px',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px',
    fontSize: '14px',
  },
  footerText: {
    fontSize: '14px',
    textAlign: 'center' as const,
    color: '#6b7280',
    marginTop: '-10px',
  },
  link: {
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
  },
  resetText: {
    textAlign: 'center' as const,
  },
  resetLink: {
    color: '#2563eb',
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
