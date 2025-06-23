import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function TournamentListPage() {
  const [turnieje, setTurnieje] = useState([]);
  const [druzyny, setDruzyny] = useState([]);
  const [mecze, setMecze] = useState([]);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('nazwa');
  const [search, setSearch] = useState('');
  const [showLiga, setShowLiga] = useState(true);
  const [showPuchar, setShowPuchar] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      };

      const [turniejeRes, druzynyRes, meczeRes] = await Promise.all([
        fetch(`${API_URL}/api/turnieje/`, { headers }),
        fetch(`${API_URL}/api/druzyny/`, { headers }),
        fetch(`${API_URL}/api/mecze/`, { headers }),
      ]);

      if (!turniejeRes.ok || !druzynyRes.ok || !meczeRes.ok) {
        throw new Error('Błąd autoryzacji. Zaloguj się ponownie.');
      }

      const [turniejeData, druzynyData, meczeData] = await Promise.all([
        turniejeRes.json(),
        druzynyRes.json(),
        meczeRes.json(),
      ]);

      setTurnieje(turniejeData);
      setDruzyny(druzynyData);
      setMecze(meczeData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusIcon = (warunek, czesciowo = false) => {
    if (warunek === true) return '✅';
    if (czesciowo) return '⚠️';
    return '❌';
  };

  const analyzeTournament = (turniej) => {
    const teams = druzyny.filter((d) => d.turniej === turniej.id);
    const matches = mecze.filter((m) => m.turniej === turniej.id);

    const hasTeams = teams.length === turniej.liczba_druzyn;
    const hasMatches = hasTeams && matches.length > 0;

    const matchesWithDetails = matches.filter(
      (m) => m.data && m.godzina && m.miejsce
    );
    const allMatchDetails = matches.length > 0 && matchesWithDetails.length === matches.length;
    const someMatchDetails = matchesWithDetails.length > 0 && matchesWithDetails.length < matches.length;

    const allScores = hasMatches && matches.every(m => m.wynik_a !== null && m.wynik_b !== null);
    const someScores = hasMatches && matches.some(m => m.wynik_a !== null || m.wynik_b !== null);

    return {
      teams: { icon: statusIcon(hasTeams), path: `/turniej/${turniej.id}/druzyny` },
      schedule: { icon: statusIcon(hasMatches), path: `/turniej/${turniej.id}/planowanie-meczy` },
      details: { icon: statusIcon(allMatchDetails, someMatchDetails), path: `/turniej/${turniej.id}/szczegoly` },
      results: { icon: statusIcon(allScores, someScores), path: `/turniej/${turniej.id}/wyniki` },
      table: turniej.typ === 'puchar' ? `/turniej/${turniej.id}/drabinka` : `/turniej/${turniej.id}/tabela`,
    };
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten turniej?')) return;
    try {
      const res = await fetch(`${API_URL}/api/turnieje/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (!res.ok) throw new Error('Błąd przy usuwaniu turnieju');
      fetchData();
    } catch {
      alert('Nie udało się usunąć turnieju');
    }
  };

  let filtered = Array.isArray(turnieje)
    ? turnieje.filter(t => t.nazwa.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (!showLiga && !showPuchar) {
    filtered = [];
  } else {
    filtered = filtered.filter(t => {
      if (showLiga && showPuchar) return true;
      if (showLiga) return t.typ === 'liga';
      if (showPuchar) return t.typ === 'puchar';
      return false;
    });
  }

  const sorted = filtered.sort((a, b) => {
    if (sortKey === 'nazwa') return a.nazwa.localeCompare(b.nazwa);
    if (sortKey === 'data-rosnaco') return new Date(a.data_utworzenia) - new Date(b.data_utworzenia);
    if (sortKey === 'data-malejaco') return new Date(b.data_utworzenia) - new Date(a.data_utworzenia);
    return 0;
  });

  return (
    <div className="page-container">
      <h2 className="page-title">Lista turniejów</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="filters" style={{ marginBottom: '1em', display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Szukaj..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={showLiga}
            onChange={() => setShowLiga(prev => !prev)}
          /> Ligi
        </label>

        <label>
          <input
            type="checkbox"
            checked={showPuchar}
            onChange={() => setShowPuchar(prev => !prev)}
          /> Puchary
        </label>

        <select onChange={e => setSortKey(e.target.value)} value={sortKey}>
          <option value="nazwa">Sortuj: alfabetycznie</option>
          <option value="data-rosnaco">Sortuj: po dacie (rosnąco)</option>
          <option value="data-malejaco">Sortuj: po dacie (malejąco)</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p>Brak pasujących turniejów.</p>
      ) : (
        <table className="main-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Typ</th>
              <th>Drużyn</th>
              <th>Drużyny</th>
              <th>Harmonogram</th>
              <th>Szczegóły</th>
              <th>Wyniki</th>
              <th>Widok</th>
              <th>Usuń</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const status = analyzeTournament(t);
              return (
                <tr key={t.id}>
                  <td>{t.nazwa}</td>
                  <td>{t.typ}</td>
                  <td>{t.liczba_druzyn}</td>
                  <td>
                    <button onClick={() => navigate(status.teams.path)}>{status.teams.icon}</button>
                  </td>
                  <td>
                    <button onClick={() => navigate(status.schedule.path)}>{status.schedule.icon}</button>
                  </td>
                  <td>
                    <button onClick={() => navigate(status.details.path)}>{status.details.icon}</button>
                  </td>
                  <td>
                    <button onClick={() => navigate(status.results.path)}>{status.results.icon}</button>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(status.table)}
                      style={{ textDecoration: 'underline' }}
                    >
                      {t.typ === 'puchar' ? 'Drabinka' : 'Tabela'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(t.id)} style={{ color: 'red' }}>
                      Usuń
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TournamentListPage;
