import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../auth';
import MessageBox from './MessageBox';

const API_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [pokazHaslo, setPokazHaslo] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: haslo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Błędne dane logowania');

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      const user = await getMe();
      console.log('Zalogowano jako:', user);

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: '1em' }}>Logowanie</h2>

      <MessageBox message={error} type="error" />

      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <label>Hasło:</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <input
          type={pokazHaslo ? 'text' : 'password'}
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
          required
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setPokazHaslo((prev) => !prev)}
          style={{ padding: '0.4em 0.8em' }}
        >
          {pokazHaslo ? 'Ukryj' : 'Pokaż'}
        </button>
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1em' }}>
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </button>

      <p style={{ textAlign: 'center', marginTop: '1em' }}>
        Nie masz konta? <a href="/rejestracja">Zarejestruj się</a>
      </p>
    </form>
  );
}

export default LoginForm;
