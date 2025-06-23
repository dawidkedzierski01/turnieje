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
  const [originalTeams, setOriginalTeams] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [info, setInfo] = useState(null);

  const fetchTeams = async (turniejData) => {
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    const res2 = await fetch(`${API_URL}/api/druzyny/?turniej=${id}`, { headers });
    if (!res2.ok) throw new Error('Błąd podczas pobierania drużyn');
    const teams = await res2.json();

    const pola = Array.from({ length: turniejData.liczba_druzyn }, (_, i) => {
      const team = teams[i];
      return team ? { id: team.id, nazwa: team.nazwa } : { nazwa: '' };
    });

    setOriginalTeams(teams);
    setFields(pola);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };

        const res1 = await fetch(`${API_URL}/api/turnieje/${id}/`, { headers });
        if (!res1.ok) throw new Error('Błąd podczas pobierania turnieju');
        const turniejData = await res1.json();
        setTurniej(turniejData);

        await fetchTeams(turniejData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (error || success || info) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
        setInfo(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error, success, info]);

  const updateTeam = (index, value) => {
    const updated = [...fields];
    updated[index].nazwa = value;
    setFields(updated);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setInfo(null);

    const token = localStorage.getItem('access');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const cleanedFields = fields.map((f) => ({ ...f, nazwa: f.nazwa.trim() }));

    const newNames = cleanedFields.map((f) => f.nazwa).filter(Boolean);
    const nameCounts = newNames.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const duplicated = Object.entries(nameCounts)
      .filter(([_, count]) => count > 1)
      .map(([name]) => name);

    if (duplicated.length > 0) {
      setError(`Nazwy muszą być unikatowe. Powtórzone: ${duplicated.join(', ')}`);
      return;
    }

    const updates = [];
    let anyChanges = false;

    for (let i = 0; i < cleanedFields.length; i++) {
      const field = cleanedFields[i];
      if (!field.nazwa) continue;

      const existing = originalTeams.find((t) => t.id === field.id);

      if (!field.id) {
        updates.push({
          type: 'create',
          payload: { nazwa: field.nazwa, turniej: id }
        });
        anyChanges = true;
      } else if (existing && existing.nazwa !== field.nazwa) {
        updates.push({
          type: 'update',
          id: field.id,
          payload: { nazwa: `__temp__${i}__${Date.now()}`, turniej: id },
          originalPayload: { nazwa: field.nazwa, turniej: id }
        });
        anyChanges = true;
      }
    }

    try {
      for (const update of updates) {
        if (update.type === 'update') {
          const url = `${API_URL}/api/druzyny/${update.id}/`;
          const res = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(update.payload),
          });
          if (!res.ok) throw new Error('Błąd przy zmianie tymczasowej nazwy');
        }
      }

      for (const update of updates) {
        const url = `${API_URL}/api/druzyny/${update.type === 'update' ? `${update.id}/` : ''}`;
        const method = update.type === 'update' ? 'PUT' : 'POST';
        const payload = update.originalPayload || update.payload;

        const res = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || Object.values(data).flat().join(' '));
        }
      }

      if (anyChanges) {
        await fetchTeams(turniej);
        setSuccess('Zapisano zmiany drużyn');
      } else {
        setInfo('Zero zmian – nic nie zapisano');
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
    <div className="page-container">
      <CreateTournamentBar />
      <MessageBox message={error} type="error" />
      <MessageBox message={success} type="success" />
      <MessageBox message={info} type="info" />

      {turniej && (
        <>
          <h2 className="page-title">
            Dodawanie drużyn <span className="tournament-name">| {turniej.nazwa} |</span>
          </h2>

          <TournamentActionButtons
            onSave={handleSave}
            nextStepLabel="Przejdź do podzielenia"
            nextStepPath={przejdzDalej}
          />

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="team-grid">
              {fields.map((field, index) => (
                <div key={index}>
                  <label className="team-input-label">Drużyna {index + 1}</label>
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
