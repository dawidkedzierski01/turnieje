import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateTournamentPage() {
  const { id } = useParams();
  const [nazwa, setNazwa] = useState('');
  const [typ, setTyp] = useState('liga');
  const [liczba, setLiczba] = useState(4);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/logowanie');
    }
  }, [navigate]);

  const handleSave = async () => {
    setError(null);
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/logowanie');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/turnieje/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nazwa, typ, liczba_druzyn: liczba }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || Object.values(data).flat().join(' ');
        throw new Error(msg);
      }

      return data.id;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = await handleSave();
    if (id) {
      navigate(`/turniej/${id}/druzyny`);
    }
  };

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <div className="page-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Tworzenie turnieju</h2>

        {error && (
          <div className="message-box error" role="alert">
            {error}
          </div>
        )}

        <label>
          Nazwa:
          <input
            type="text"
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            required
            onInvalid={(e) =>
              e.target.setCustomValidity('Proszę podać nazwę turnieju')
            }
            onInput={(e) => e.target.setCustomValidity('')}
          />
        </label>

        <label>
          Typ:
          <select value={typ} onChange={(e) => setTyp(e.target.value)}>
            <option value="liga">Liga</option>
            <option value="puchar">Puchar</option>
          </select>
        </label>

        <label>
          Liczba drużyn:
          {typ === 'puchar' ? (
            <select value={liczba} onChange={(e) => setLiczba(+e.target.value)}>
              {[2, 4, 8, 16, 32].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min="2"
              max="32"
              value={liczba}
              onChange={(e) => setLiczba(+e.target.value)}
              required
            />
          )}
        </label>

        <div className="form-actions">
          <button type="submit" className="home-button">
            Utwórz i przejdź dalej
          </button>
        </div>
      </form>
    </div>
  );
}
