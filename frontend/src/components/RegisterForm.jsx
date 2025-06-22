import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [powtorzHaslo, setPowtorzHaslo] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (haslo !== powtorzHaslo) {
      setError('Hasła nie są takie same');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: haslo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się zarejestrować');

      navigate('/logowanie');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: '1em' }}>Rejestracja</h2>

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

      <label>Powtórz hasło:</label>
      <input
        type="password"
        value={powtorzHaslo}
        onChange={(e) => setPowtorzHaslo(e.target.value)}
        required
      />

      <button type="submit" style={{ width: '100%', marginTop: '1em' }}>
        Zarejestruj się
      </button>

      <div style={{ marginTop: '1.5em', textAlign: 'center' }}>
        Masz już konto?{' '}
        <span
          style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/logowanie')}
        >
          Zaloguj się
        </span>
      </div>
    </form>
  );
}

export default RegisterForm;
