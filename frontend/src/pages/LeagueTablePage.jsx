import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TournamentActionButtons from '../components/TournamentActionButtons';

const API_URL = import.meta.env.VITE_API_URL;

function LeagueTablePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mecze, setMecze] = useState(null);
  const [turniej, setTurniej] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resMecze, resTurniej] = await Promise.all([
          fetch(`${API_URL}/api/mecze/?turniej=${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
          }),
          fetch(`${API_URL}/api/turnieje/${id}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
          }),
        ]);

        if (!resMecze.ok || !resTurniej.ok) throw new Error('Błąd pobierania danych');

        const dataMecze = await resMecze.json();
        const dataTurniej = await resTurniej.json();

        setMecze(dataMecze);
        setTurniej(dataTurniej);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAll();
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!mecze || !turniej) return <p>Ładowanie danych...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">
        Tabela wyników <span className="tournament-name">| {turniej.nazwa} |</span>
      </h2>

      <TournamentActionButtons
        customButtons={[
          {
            label: 'Przejdź do modułu wyników',
            onClick: () => navigate(`/turniej/${id}/wyniki`),
          },
          {
            label: 'Przejdź do listy turniejów',
            onClick: () => navigate('/lista-turniejow'),
          },
        ]}
      />

      <LeagueTable mecze={mecze} />
    </div>
  );
}

function LeagueTable({ mecze }) {
  const teams = {};
  mecze.forEach((m) => {
    teams[m.druzyna_a] = m.druzyna_a_nazwa;
    teams[m.druzyna_b] = m.druzyna_b_nazwa;
  });

  const stats = Object.entries(teams).map(([id, nazwa]) => ({
    id,
    nazwa,
    M: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, P: 0,
    history: [],
  }));

  const statsMap = {};
  stats.forEach((t) => (statsMap[t.id] = t));

  mecze.forEach((m) => {
    if (m.wynik_a === null || m.wynik_b === null) return;

    const teamA = statsMap[m.druzyna_a];
    const teamB = statsMap[m.druzyna_b];

    teamA.M++;
    teamB.M++;

    teamA.GF += m.wynik_a;
    teamA.GA += m.wynik_b;
    teamB.GF += m.wynik_b;
    teamB.GA += m.wynik_a;

    if (m.wynik_a > m.wynik_b) {
      teamA.W++;
      teamB.L++;
      teamA.P += 3;
      teamA.history.push('W');
      teamB.history.push('L');
    } else if (m.wynik_a === m.wynik_b) {
      teamA.D++;
      teamB.D++;
      teamA.P += 1;
      teamB.P += 1;
      teamA.history.push('D');
      teamB.history.push('D');
    } else {
      teamB.W++;
      teamA.L++;
      teamB.P += 3;
      teamB.history.push('W');
      teamA.history.push('L');
    }
  });

  stats.forEach((t) => {
    t.GD = t.GF - t.GA;
  });

  stats.sort((a, b) => {
    if (b.P !== a.P) return b.P - a.P;
    if (b.GD !== a.GD) return b.GD - a.GD;
    return b.GF - a.GF;
  });

  return (
    <table className="main-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Drużyna</th>
          <th>M</th>
          <th>W</th>
          <th>R</th>
          <th>P</th>
          <th>GF</th>
          <th>GA</th>
          <th>+/-</th>
          <th>Pkt</th>
          <th>Ostatnie 5</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((t, idx) => (
          <tr key={t.id}>
            <td>{idx + 1}</td>
            <td>{t.nazwa}</td>
            <td>{t.M}</td>
            <td>{t.W}</td>
            <td>{t.D}</td>
            <td>{t.L}</td>
            <td>{t.GF}</td>
            <td>{t.GA}</td>
            <td>{t.GD}</td>
            <td><strong>{t.P}</strong></td>
              <td>
              {t.history.slice(-5).map((res, i) => {
                let className = '';
                if (res === 'W') className = 'win';
                else if (res === 'D') className = 'draw';
                else if (res === 'L') className = 'loss';
                return <span key={i} className={`history-dot ${className}`}></span>;
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default LeagueTablePage;