import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';
import '../styles/bracket.css';

const API_URL = import.meta.env.VITE_API_URL;
const PUCHAR_ETAPY = ['1/32', '1/16', '1/8', 'Ćwierćfinał', 'Półfinał', 'Finał'];

export default function BracketPage() {
  const { id } = useParams();
  const [mecze, setMecze] = useState([]);
  const [turniej, setTurniej] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access');
      const headers = { Authorization: `Bearer ${token}` };

      const res1 = await fetch(`${API_URL}/api/turnieje/${id}/`, { headers });
      if (res1.ok) {
        const turniejData = await res1.json();
        setTurniej(turniejData);
      }

      const res2 = await fetch(`${API_URL}/api/mecze/?turniej=${id}`, { headers });
      if (res2.ok) {
        const meczeData = await res2.json();
        setMecze(meczeData);
      }
    };
    fetchData();
  }, [id]);

  const liczbaDruzyn = new Set(
    mecze.flatMap(m => [m.druzyna_a, m.druzyna_b])
  ).size;

  const etapIndex = Math.max(
    0,
    PUCHAR_ETAPY.length - Math.ceil(Math.log2(liczbaDruzyn))
  );
  const etapyTurnieju = PUCHAR_ETAPY.slice(etapIndex);

  const meczePoEtapie = etapyTurnieju.reduce((acc, etap) => {
    acc[etap] = mecze.filter(m => m.runda === etap);
    return acc;
  }, {});

  const renderMecze = (etap, meczeEtapu, isFinal = false) => (
    <div className="bracket-column">
      <h3>{etap}</h3>
      {meczeEtapu.map(m => {
        const isWinnerA = m.wynik_a > m.wynik_b;
        const isWinnerB = m.wynik_b > m.wynik_a;
        return (
          <div key={m.id} className="bracket-match">
            <div className={`team ${isWinnerA ? (isFinal ? 'final-winner' : 'winner') : ''}`}>
              {m.druzyna_a_nazwa || m.druzyna_a} ({m.wynik_a ?? '-'})
            </div>
            <div className={`team ${isWinnerB ? (isFinal ? 'final-winner' : 'winner') : ''}`}>
              {m.druzyna_b_nazwa || m.druzyna_b} ({m.wynik_b ?? '-'})
            </div>
          </div>
        );
      })}
    </div>
  );

  const splitMatches = (etap) => {
    const matches = meczePoEtapie[etap] || [];
    const half = Math.ceil(matches.length / 2);
    return [matches.slice(0, half), matches.slice(half)];
  };

  return (
    <>
      <div className="page-container">
        <CreateTournamentBar />
        {turniej && (
          <h2 className="page-title">
            Drabinka turnieju <span className="tournament-name">| {turniej.nazwa} |</span>
          </h2>
        )}
      </div>

      <div className="bracket-flex">
        <div className="bracket-side left">
          {etapyTurnieju.slice(0, -1).reverse().map(etap => renderMecze(etap, splitMatches(etap)[0]))}
        </div>

        <div className="bracket-center">
          {renderMecze('Finał', meczePoEtapie['Finał'] || [], true)}
        </div>

        <div className="bracket-side right">
          {etapyTurnieju.slice(0, -1).reverse().map(etap => renderMecze(etap, splitMatches(etap)[1]))}
        </div>
      </div>
    </>
  );
}
