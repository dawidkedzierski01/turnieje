import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';

const API_URL = import.meta.env.VITE_API_URL;

function BracketPage() {
  const { id } = useParams();
  const [mecze, setMecze] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMecze = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/mecze/?turniej=${id}`);
        if (!res.ok) throw new Error('Nie udało się pobrać meczów');
        const data = await res.json();
        setMecze(data.filter(m => m.runda));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMecze();
  }, [id]);

  // Grupowanie meczów po rundach
  const rundy = {};
  mecze.forEach((mecz) => {
    const runda = mecz.runda || 'Brak rundy';
    if (!rundy[runda]) rundy[runda] = [];
    rundy[runda].push(mecz);
  });

  // Sortowanie rund według logicznego porządku
  const sortRundy = (a, b) => {
    const kolej = ['1/8', '1/4', 'Ćwierćfinał', '1/2', 'Półfinał', 'Finał'];
    const indexA = kolej.findIndex(k => a.toLowerCase().includes(k.toLowerCase()));
    const indexB = kolej.findIndex(k => b.toLowerCase().includes(k.toLowerCase()));
    return indexA - indexB;
  };
  const posortowaneRundy = Object.keys(rundy).sort(sortRundy);

  return (
    <div>
      <CreateTournamentBar />
      <h2>Drabinka turnieju</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Ładowanie...</p>}
      {!loading && posortowaneRundy.length === 0 && <p>Brak meczów do wyświetlenia drabinki.</p>}

      <div style={{ display: 'flex', gap: '2em', overflowX: 'auto', padding: '1em 0' }}>
        {posortowaneRundy.map((runda, index) => (
          <div key={index} style={{ minWidth: '200px' }}>
            <h4
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #646cff',
                marginBottom: '1em',
              }}
            >
              {runda}
            </h4>
            {rundy[runda].map((mecz) => (
              <div
                key={mecz.id}
                style={{
                  background: '#222',
                  padding: '0.5em',
                  borderRadius: '8px',
                  marginBottom: '1em',
                  textAlign: 'center',
                  boxShadow: '0 0 4px #000',
                }}
              >
                <div>{mecz.druzyna_a_nazwa} ({mecz.wynik_a ?? '-'})</div>
                <div>vs</div>
                <div>{mecz.druzyna_b_nazwa} ({mecz.wynik_b ?? '-'})</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BracketPage;
