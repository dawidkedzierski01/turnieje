import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';
import MessageBox from '../components/MessageBox';
import TournamentActionButtons from '../components/TournamentActionButtons';

const API_URL = import.meta.env.VITE_API_URL;

const RUNDY = {
  64: '1/32',
  32: '1/16',
  16: '1/8',
  8: 'Ćwierćfinał',
  4: 'Półfinał',
  2: 'Finał',
};

export default function MatchResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turniej, setTurniej] = useState(null);
  const [typTurnieju, setTypTurnieju] = useState(null);
  const [mecze, setMecze] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [info, setInfo] = useState(null);
  const [pokazAktualnyEtap, setPokazAktualnyEtap] = useState(false);

  const fetchTurniej = async () => {
    try {
      const res = await fetch(`${API_URL}/api/turnieje/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTurniej(data);
      setTypTurnieju(data.typ);
    } catch {
      setError('Nie udało się pobrać danych turnieju');
    }
  };

  const fetchMecze = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mecze/?turniej=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMecze(
        data.map(m => ({
          ...m,
          _wynik_a: m.wynik_a ?? '',
          _wynik_b: m.wynik_b ?? '',
        }))
      );
    } catch {
      setError('Nie udało się pobrać meczów');
    }
  };

  useEffect(() => {
    fetchTurniej();
    fetchMecze();
  }, [id]);

  useEffect(() => {
    if (error || success || info) {
      const t = setTimeout(() => {
        setError(null);
        setSuccess(null);
        setInfo(null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success, info]);

  const zapiszWyniki = async () => {
    setError(null);
    setSuccess(null);
    setInfo(null);

    let anyChanges = false;
    let zmienioneId = [];

    try {
      for (const m of mecze) {
        let wynikA = m._wynik_a !== '' ? parseInt(m._wynik_a) : null;
        let wynikB = m._wynik_b !== '' ? parseInt(m._wynik_b) : null;

        if (wynikA === null && wynikB !== null) wynikA = 0;
        if (wynikB === null && wynikA !== null) wynikB = 0;

        if (wynikA === null || wynikB === null) continue;
        if (wynikA < 0 || wynikA > 99 || wynikB < 0 || wynikB > 99) continue;

        if (wynikA !== m.wynik_a || wynikB !== m.wynik_b) {
          const res = await fetch(`${API_URL}/api/mecze/${m.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
            body: JSON.stringify({ wynik_a: wynikA, wynik_b: wynikB }),
          });
          if (!res.ok) throw new Error();
          anyChanges = true;
          zmienioneId.push(m.id);
        }
      }

      if (anyChanges) {
        const zmienioneMecze = mecze.filter(m => zmienioneId.includes(m.id));
        const rundyDoUsuniecia = new Set(zmienioneMecze.map(m => m.runda));

        for (const runda of rundyDoUsuniecia) {
          const znalezione = Object.entries(RUNDY).find(([k, v]) => v === runda);
          const aktualnaLiczba = znalezione ? parseInt(znalezione[0]) : null;
          if (!aktualnaLiczba) continue;

          const nastepnaLiczba = aktualnaLiczba / 2;
          const kolejnaRunda = RUNDY[nastepnaLiczba] || `1/${nastepnaLiczba}`;

          for (const m of mecze) {
            if (m.runda === kolejnaRunda) {
              await fetch(`${API_URL}/api/mecze/${m.id}/`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access')}`,
                },
              });
            }
          }
        }

        setSuccess('Zapisano wyniki');
        fetchMecze();
      } else {
        setInfo('Brak zmian – nic nie zapisano');
      }
    } catch {
      setError('Nie udało się zapisać wyników');
    }
  };

  const rozpocznijKolejnyEtap = async () => {
    try {
      const rundyUnikalne = [...new Set(mecze.map(m => m.runda))];
      const ostatniaRunda = rundyUnikalne[rundyUnikalne.length - 1];
      const meczeZRundy = mecze
        .filter(m => m.runda === ostatniaRunda)
        .sort((a, b) => a.id - b.id);

      for (const m of meczeZRundy) {
        if (m._wynik_a === '' || m._wynik_b === '') {
          setError('Uzupełnij wszystkie wyniki przed przejściem do kolejnego etapu');
          return;
        }
        const wynikA = parseInt(m._wynik_a);
        const wynikB = parseInt(m._wynik_b);

        if (isNaN(wynikA) || isNaN(wynikB)) {
          setError('Nieprawidłowe dane w wynikach – użyj liczb');
          return;
        }

        if (wynikA === wynikB) {
          setError('W turnieju pucharowym nie może być remisu – popraw wyniki');
          return;
        }

        if (wynikA !== m.wynik_a || wynikB !== m.wynik_b) {
          setInfo('Napierw dokonaj zapisu');
          return;
        }
      }

      const zwyciezcy = meczeZRundy.map(m => {
        const wynikA = parseInt(m._wynik_a);
        const wynikB = parseInt(m._wynik_b);
        return wynikA > wynikB ? m.druzyna_a : m.druzyna_b;
      });

      const aktualnaLiczba = Object.entries(RUNDY).find(([k, v]) => v === ostatniaRunda)?.[0];
      const nastepnaLiczba = aktualnaLiczba ? parseInt(aktualnaLiczba) / 2 : null;
      const nowaRunda = RUNDY[nastepnaLiczba] || `1/${nastepnaLiczba}`;

      const istniejace = mecze.filter(m => m.runda === nowaRunda);
      if (istniejace.length > 0) {
        setInfo(`Runda "${nowaRunda}" już istnieje`);
        return;
      }

      for (let i = 0; i < zwyciezcy.length; i += 2) {
        const druzynaA = zwyciezcy[i];
        const druzynaB = zwyciezcy[i + 1];

        await fetch(`${API_URL}/api/mecze/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
          body: JSON.stringify({
            turniej: id,
            druzyna_a: druzynaA,
            druzyna_b: druzynaB,
            runda: nowaRunda,
          }),
        });
      }

      setSuccess(`Utworzono rundę: ${nowaRunda}`);
      fetchMecze();
    } catch {
      setError('Nie udało się rozpocząć kolejnego etapu');
    }
  };

  const grupowaneMecze = mecze.reduce((acc, m) => {
    const r = m.runda || 'Inna';
    if (!acc[r]) acc[r] = [];
    acc[r].push(m);
    return acc;
  }, {});

  const rundy = Object.keys(grupowaneMecze);

  let ostatniaRunda;

  if (typTurnieju === 'liga') {
    const nieukonczone = Object.entries(grupowaneMecze).filter(([runda, mecze]) =>
      mecze.some(m => m._wynik_a === '' || m._wynik_b === '')
    );

    if (nieukonczone.length > 0) {
      nieukonczone.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
      ostatniaRunda = nieukonczone[0][0];
    } else {

      ostatniaRunda = rundy[rundy.length - 1];
    }
  } else {
    ostatniaRunda = rundy[rundy.length - 1];
  }

  const filtrowaneKolejki = pokazAktualnyEtap
    ? { [ostatniaRunda]: grupowaneMecze[ostatniaRunda] }
    : grupowaneMecze;

  return (
    <div className="page-container">
      <CreateTournamentBar />
      <MessageBox message={error} type="error" />
      <MessageBox message={success} type="success" />
      <MessageBox message={info} type="info" />

      {turniej && (
        <h2 className="page-title">
          Wyniki <span className="tournament-name">| {turniej.nazwa} |</span>
        </h2>
      )}

      <TournamentActionButtons
        onSave={zapiszWyniki}
        nextStepLabel="Rozpocznij kolejny etap"
        nextStepPath={typTurnieju === 'puchar' ? rozpocznijKolejnyEtap : undefined}
        showOnlyCurrentRound={pokazAktualnyEtap}
        toggleShowOnlyCurrentRound={() => setPokazAktualnyEtap(v => !v)}
        hasRounds={Object.keys(grupowaneMecze).length > 0}
      />

      {Object.keys(filtrowaneKolejki).map((runda) => (
        <div key={runda} style={{ marginBottom: '2em' }}>
          <h3
            style={{
              fontWeight: 'bold',
              fontSize: '1.2em',
              borderBottom: '2px solid #646cff',
              paddingBottom: '0.3em',
            }}
          >
          {typTurnieju === 'liga' ? 'Kolejka' : 'Etap'} {runda}

          </h3>
          <table className="main-table">
            <thead>
              <tr>
                <th>Drużyna A</th>
                <th>Wynik</th>
                <th>Drużyna B</th>
                <th>Wynik</th>
              </tr>
            </thead>
            <tbody>
              {filtrowaneKolejki[runda].map(mecz => (
                <tr key={mecz.id}>
                  <td>{mecz.druzyna_a_nazwa}</td>
                  <td>
                    <input
                      type="number"
                      value={mecz._wynik_a}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === '') {
                          value = '';
                        } else {
                          let num = parseInt(value);
                          if (isNaN(num) || num < 0 || num > 99) return;
                          value = num;
                        }
                        const newM = [...mecze];
                        newM.find(m => m.id === mecz.id)._wynik_a = value;
                        setMecze(newM);
                      }}
                      min="0"
                      max="99"
                    />
                  </td>
                  <td>{mecz.druzyna_b_nazwa}</td>
                  <td>
                    <input
                      type="number"
                      value={mecz._wynik_b}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === '') {
                          value = '';
                        } else {
                          let num = parseInt(value);
                          if (isNaN(num) || num < 0 || num > 99) return;
                          value = num;
                        }
                        const newM = [...mecze];
                        newM.find(m => m.id === mecz.id)._wynik_b = value;
                        setMecze(newM);
                      }}
                      min="0"
                      max="99"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
