import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../auth';

function TournamentViewPage() {
  const { id } = useParams();
  const [turniej, setTurniej] = useState(null);
  const [druzyny, setDruzyny] = useState([]);
  const [mecze, setMecze] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/turnieje/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      }).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch(`${API_BASE}/druzyny/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      }).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch(`${API_BASE}/mecze/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      }).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
    ])
      .then(([t, d, m]) => {
        setTurniej(t);
        setDruzyny(d.filter(dr => dr.turniej === parseInt(id)));
        setMecze(m.filter(me => me.turniej === parseInt(id)));
      })
      .catch(() => setError("Błąd podczas pobierania danych."));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!turniej) return <p>Ładowanie...</p>;

  return (
    <div>
      <h1>Podgląd turnieju: {turniej.nazwa}</h1>
      <p><strong>Typ:</strong> {turniej.typ}</p>
      <p><strong>Liczba drużyn:</strong> {turniej.liczba_druzyn}</p>
      <p><strong>Data rozpoczęcia:</strong> {turniej.data_rozpoczecia || '–'}</p>
      <p><strong>Data zakończenia:</strong> {turniej.data_zakonczenia || '–'}</p>
      <p><strong>Miejsce:</strong> {turniej.miejsce || '–'}</p>

      <h2>Drużyny</h2>
      {druzyny.length === 0 ? <p>Brak drużyn.</p> : (
        <ul>
          {druzyny.map(d => <li key={d.id}>{d.nazwa}</li>)}
        </ul>
      )}

      <h2>Mecze</h2>
      {mecze.length === 0 ? <p>Brak meczów.</p> : (
        <table className="main-table">
          <thead>
            <tr>
              <th>Drużyna A</th>
              <th>Drużyna B</th>
              <th>Wynik</th>
              <th>Data</th>
              <th>Miejsce</th>
              <th>Runda</th>
            </tr>
          </thead>
          <tbody>
            {mecze.map(m => {
              const druzynaA = druzyny.find(d => d.id === m.druzyna_a)?.nazwa || '—';
              const druzynaB = druzyny.find(d => d.id === m.druzyna_b)?.nazwa || '—';
              const wynik = (m.wynik_a != null && m.wynik_b != null)
                ? `${m.wynik_a} : ${m.wynik_b}`
                : '—';
              return (
                <tr key={m.id}>
                  <td>{druzynaA}</td>
                  <td>{druzynaB}</td>
                  <td>{wynik}</td>
                  <td>{m.data || '—'}</td>
                  <td>{m.miejsce || '—'}</td>
                  <td>{m.runda || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TournamentViewPage;
