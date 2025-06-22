import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';

const API_URL = import.meta.env.VITE_API_URL;

function MatchResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mecze, setMecze] = useState([]);
  const [tempWyniki, setTempWyniki] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterKolejka, setFilterKolejka] = useState('');

  const fetchMecze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/mecze/?turniej=${id}`);
      if (!res.ok) throw new Error('Nie udało się pobrać meczów');
      const data = await res.json();
      setMecze(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (meczId, wynikA, wynikB) => {
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Brak tokena – zaloguj się ponownie.');

      const res = await fetch(`${API_URL}/api/mecze/${meczId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wynik_a: Number(wynikA),
          wynik_b: Number(wynikB),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Nie udało się zapisać wyniku');

      setSuccess('Wynik zapisany');
      fetchMecze();
    } catch (err) {
      setError(err.message);
    }
  };

  const zatwierdzKolejke = async () => {
    try {
      const res = await fetch(`${API_URL}/api/zatwierdz-kolejke/${id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd zatwierdzania kolejki');
      }
      const data = await res.json();
      setSuccess(data.message);
      fetchMecze();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMecze();
  }, [id]);

  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  const handleChange = (meczId, field, value) => {
    setTempWyniki((prev) => ({
      ...prev,
      [meczId]: {
        ...prev[meczId],
        [field]: value,
      },
    }));
  };

  // Grupowanie meczów po kolejce (runda)
  const meczePoKolejce = {};
  mecze.forEach((mecz) => {
    const kolejka = mecz.runda || 'Brak kolejki';
    if (!meczePoKolejce[kolejka]) meczePoKolejce[kolejka] = [];
    meczePoKolejce[kolejka].push(mecz);
  });

  // Sortowanie kolejek alfabetycznie
  const sortedKolejkiEntries = Object.entries(meczePoKolejce).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Filtrowanie kolejek po wpisanym filtrze (zachowując sortowanie)
  const filtrowaneKolejki = filterKolejka
    ? sortedKolejkiEntries.filter(([k]) =>
        k.toLowerCase().includes(filterKolejka.toLowerCase())
      )
    : sortedKolejkiEntries;

  // Wyznacz ostatnią rundę (np. najwyższą alfanumerycznie)
  const ostatniaRunda = mecze.length > 0
    ? mecze.reduce((max, m) => (m.runda > max ? m.runda : max), mecze[0].runda)
    : null;

  // Mecze w ostatniej rundzie
  const meczeAktualnejRundy = mecze.filter(m => m.runda === ostatniaRunda);

  // Czy wszystkie mecze ostatniej rundy mają wprowadzone wyniki?
  const wszystkieWynikiWypelnione =
    meczeAktualnejRundy.length > 0 &&
    meczeAktualnejRundy.every(m => m.wynik_a !== null && m.wynik_b !== null);

  return (
    <div>
      <CreateTournamentBar />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {loading && <p>Ładowanie danych...</p>}

      <div
        style={{
          marginBottom: '1em',
          display: 'flex',
          gap: '1em',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button onClick={fetchMecze}>Odśwież dane</button>
        <input
          type="text"
          placeholder="Wyszukaj kolejkę"
          value={filterKolejka}
          onChange={(e) => setFilterKolejka(e.target.value)}
          style={{ padding: '0.3em', minWidth: '150px' }}
        />
      </div>

      {wszystkieWynikiWypelnione && ostatniaRunda && (
        <p
          onClick={zatwierdzKolejke}
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#646cff',
            marginBottom: '1em',
            userSelect: 'none',
          }}
        >
          Przejdź do następnego etapu (runda: {ostatniaRunda})
        </p>
      )}

      {filtrowaneKolejki.length === 0 && !loading ? (
        <p>Brak meczów do wyświetlenia.</p>
      ) : (
        filtrowaneKolejki.map(([kolejka, meczeWKolejce]) => {
          const sortedMecze = [...meczeWKolejce].sort((a, b) => a.id - b.id);

          return (
            <div key={kolejka} style={{ marginBottom: '1.5em' }}>
              <h3
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.2em',
                  borderBottom: '2px solid #646cff',
                  paddingBottom: '0.3em',
                }}
              >
                Kolejka: {kolejka}
              </h3>
              <table className="main-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Drużyna A</th>
                    <th>Wynik A</th>
                    <th>Drużyna B</th>
                    <th>Wynik B</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMecze.map((mecz) => {
                    const temp = tempWyniki[mecz.id] || {};
                    return (
                      <tr key={mecz.id}>
                        <td>{mecz.druzyna_a_nazwa}</td>
                        <td>
                          <input
                            type="number"
                            defaultValue={mecz.wynik_a}
                            onChange={(e) =>
                              handleChange(mecz.id, 'wynik_a', e.target.value)
                            }
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>{mecz.druzyna_b_nazwa}</td>
                        <td>
                          <input
                            type="number"
                            defaultValue={mecz.wynik_b}
                            onChange={(e) =>
                              handleChange(mecz.id, 'wynik_b', e.target.value)
                            }
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td
                          onClick={() =>
                            handleSave(
                              mecz.id,
                              temp.wynik_a ?? mecz.wynik_a ?? 0,
                              temp.wynik_b ?? mecz.wynik_b ?? 0
                            )
                          }
                          style={{
                            color: '#646cff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          Zapisz
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MatchResultsPage;
