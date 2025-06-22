import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTournamentBar from '../components/CreateTournamentBar';
import MessageBox from '../components/MessageBox';
import TournamentActionButtons from '../components/TournamentActionButtons';

const API_URL = import.meta.env.VITE_API_URL;

export default function AddTeamsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turniej, setTurniej] = useState(null);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };

        const res1 = await fetch(`${API_URL}/api/turnieje/${id}/`, { headers });
        if (!res1.ok) throw new Error('Błąd podczas pobierania turnieju');
        const turniejData = await res1.json();
        setTurniej(turniejData);

        const res2 = await fetch(`${API_URL}/api/druzyny/`, { headers });
        if (!res2.ok) throw new Error('Błąd podczas pobierania drużyn');
        const allTeams = await res2.json();
        const teams = allTeams.filter((t) => t.turniej === parseInt(id));
        const pola = Array.from({ length: turniejData.liczba_druzyn }, (_, i) => {
          const team = teams[i];
          return team ? { id: team.id, nazwa: team.nazwa } : { nazwa: '' };
        });
        setFields(pola);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  const updateTeam = (index, value) => {
    const updated = [...fields];
    updated[index].nazwa = value;
    setFields(updated);
  };

  const handleSave = async () => {
    const duplikaty = [];
    const nazwy = fields.map((f) => f.nazwa.trim()).filter(Boolean);

    const seen = new Set();
    for (const name of nazwy) {
      if (seen.has(name)) duplikaty.push(name);
      seen.add(name);
    }

    if (duplikaty.length > 0) {
      setError(`Zduplikowane nazwy: ${[...new Set(duplikaty)].join(', ')}`);
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('access');

      for (const team of fields) {
        const name = team.nazwa.trim();
        if (!name) continue;

        const payload = JSON.stringify({ nazwa: name, turniej: id });
        const isEdit = !!team.id;
        const res = await fetch(`${API_URL}/api/druzyny/${isEdit ? `${team.id}/` : ''}`, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        });

        if (!res.ok) {
          let data = {};
          try {
            data = await res.json();
          } catch {
            throw new Error('Nieprawidłowa odpowiedź z serwera');
          }
          throw new Error(data.error || Object.values(data).flat().join(' '));
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const przejdzDalej = async () => {
    await handleSave();
    navigate(`/turniej/${id}/planowanie-meczy`);
  };

  return (
    <div>
      <CreateTournamentBar />
      <MessageBox message={error} type="error" />

      {turniej && (
        <>
          <h2 style={{ margin: "1em 0", fontWeight: "bold" }}>
            Dodawanie drużyn <span style={{ color: "#646cff" }}>| {turniej.nazwa} |</span>
          </h2>

          <TournamentActionButtons
            onSave={handleSave}
            nextStepLabel="Przejdź do podzielenia"
            nextStepPath={przejdzDalej}
          />

          <form onSubmit={(e) => e.preventDefault()}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1em',
                marginBottom: '1em',
              }}
            >
              {fields.map((field, index) => (
                <div key={index}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.25em',
                      fontWeight: 'bold',
                    }}
                  >
                    Drużyna {index + 1}
                  </label>
                  <input
                    type="text"
                    value={field.nazwa}
                    onChange={(e) => updateTeam(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </form>

        </>
      )}
    </div>
  );
}
