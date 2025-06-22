import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';
import TournamentActionButtons from '../components/TournamentActionButtons';

const API_URL = import.meta.env.VITE_API_URL;

function TournamentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mecze, setMecze] = useState([]);
  const [turniejInfo, setTurniejInfo] = useState({
    data_rozpoczecia: '',
    data_zakonczenia: '',
    miejsce: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterKolejka, setFilterKolejka] = useState('');

  const handle401 = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/logowanie');
  };

  const fetchMecze = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mecze/?turniej=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (res.status === 401) return handle401();
      if (!res.ok) throw new Error();
      const data = await res.json();

      const meczeWithEdit = data.map(m => ({
        ...m,
        _data: m.data || '',
        _godzina: m.godzina || '',
        _miejsce: m.miejsce || '',
      }));
      setMecze(meczeWithEdit);
    } catch {
      setError('Nie udało się pobrać meczów');
    }
  };

  const fetchTurniejInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/turnieje/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (res.status === 401) return handle401();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTurniejInfo({
        data_rozpoczecia: data.data_rozpoczecia || '',
        data_zakonczenia: data.data_zakonczenia || '',
        miejsce: data.miejsce || '',
      });
    } catch {
      setError('Nie udało się pobrać szczegółów turnieju');
    }
  };

  const zapiszWszystko = async () => {
    setError(null);
    setSuccess(null);
    try {
      await fetch(`${API_URL}/api/turnieje/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify(turniejInfo),
      });

      for (const mecz of mecze) {
        await fetch(`${API_URL}/api/mecze/${mecz.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
          body: JSON.stringify({
            data: mecz._data || null,
            godzina: mecz._godzina || null,
            miejsce: mecz._miejsce || null,
          }),
        });
      }
      setSuccess('Zapisano dane turnieju i mecze');
      await fetchMecze();
    } catch {
      setError('Błąd zapisu danych');
    }
  };

  useEffect(() => {
    fetchMecze();
    fetchTurniejInfo();
  }, [id]);

  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  const meczePoKolejce = {};
  mecze.forEach(m => {
    if (!meczePoKolejce[m.runda]) meczePoKolejce[m.runda] = [];
    meczePoKolejce[m.runda].push(m);
  });

  const filtrowaneKolejki = filterKolejka
    ? Object.fromEntries(Object.entries(meczePoKolejce).filter(([k]) => k.includes(filterKolejka)))
    : meczePoKolejce;

  return (
    <div>
      <CreateTournamentBar />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <TournamentActionButtons
        onSave={zapiszWszystko}
        nextStepLabel="Przejdź do wyników"
        nextStepPath={() => navigate(`/turniej/${id}/wyniki`)}
      />

      <form
        style={{
          display: 'flex',
          gap: '1em',
          flexWrap: 'wrap',
          marginBottom: '1em',
          alignItems: 'center',
        }}
      >
        <label>
          Data rozpoczęcia:
          <input
            type="date"
            value={turniejInfo.data_rozpoczecia}
            onChange={(e) =>
              setTurniejInfo({ ...turniejInfo, data_rozpoczecia: e.target.value })
            }
          />
        </label>

        <label>
          Data zakończenia:
          <input
            type="date"
            value={turniejInfo.data_zakonczenia}
            onChange={(e) =>
              setTurniejInfo({ ...turniejInfo, data_zakonczenia: e.target.value })
            }
          />
        </label>

        <label>
          Miejsce:
          <input
            type="text"
            value={turniejInfo.miejsce}
            onChange={(e) =>
              setTurniejInfo({ ...turniejInfo, miejsce: e.target.value })
            }
          />
        </label>
      </form>

      <div style={{ marginBottom: '1em' }}>
        <input
          type="text"
          placeholder="Wyszukaj kolejkę"
          value={filterKolejka}
          onChange={(e) => setFilterKolejka(e.target.value)}
          style={{ padding: '0.4em', width: '180px' }}
        />
      </div>

      {Object.keys(filtrowaneKolejki).length > 0 ? (
        Object.entries(filtrowaneKolejki).map(([kolejka, meczeWKolejce]) => (
          <div key={kolejka} style={{ marginBottom: '1.5em' }}>
            <h3
              style={{
                fontWeight: 'bold',
                fontSize: '1.2em',
                borderBottom: '2px solid #646cff',
                paddingBottom: '0.3em',
              }}
            >
              Kolejka {kolejka}
            </h3>
            <table className="main-table">
              <thead>
                <tr>
                  <th>Drużyna A</th>
                  <th>Drużyna B</th>
                  <th>Data</th>
                  <th>Godzina</th>
                  <th>Miejsce</th>
                </tr>
              </thead>
              <tbody>
                {meczeWKolejce.map((mecz) => (
                  <tr key={mecz.id}>
                    <td>{mecz.druzyna_a_nazwa || mecz.druzyna_a}</td>
                    <td>{mecz.druzyna_b_nazwa || mecz.druzyna_b}</td>
                    <td>
                      <input
                        type="date"
                        value={mecz._data}
                        onChange={(e) => {
                          const nowa = [...mecze];
                          nowa.find(m => m.id === mecz.id)._data = e.target.value;
                          setMecze(nowa);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={mecz._godzina}
                        onChange={(e) => {
                          const nowa = [...mecze];
                          nowa.find(m => m.id === mecz.id)._godzina = e.target.value;
                          setMecze(nowa);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={mecz._miejsce}
                        onChange={(e) => {
                          const nowa = [...mecze];
                          nowa.find(m => m.id === mecz.id)._miejsce = e.target.value;
                          setMecze(nowa);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Brak meczów</p>
      )}
    </div>
  );
}

export default TournamentDetailsPage;
