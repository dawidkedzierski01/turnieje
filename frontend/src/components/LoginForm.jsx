import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../auth';

const API_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: haslo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Błędne dane logowania');

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      const user = await getMe();
      console.log('Zalogowano jako:', user);

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: '1em' }}>Logowanie</h2>

      {error && <p style={{ color: 'red', marginBottom: '1em' }}>{error}</p>}

      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Hasło:</label>
      <input
        type="password"
        value={haslo}
        onChange={(e) => setHaslo(e.target.value)}
        required
      />

      <button type="submit" style={{ width: '100%', marginTop: '1em' }}>Zaloguj się</button>

      <p style={{ textAlign: 'center', marginTop: '1em' }}>
        Nie masz konta? <a href="/rejestracja">Zarejestruj się</a>
      </p>
    </form>
  );
}

export default LoginForm;

