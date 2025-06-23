import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

const etapy = [
  { nazwa: 'Utwórz turniej', path: () => '/utworz-turniej' },
  { nazwa: 'Dodaj drużyny', path: (id) => `/turniej/${id}/druzyny` },
  { nazwa: 'Podziel mecze', path: (id) => `/turniej/${id}/planowanie-meczy` },
  { nazwa: 'Szczegóły', path: (id) => `/turniej/${id}/szczegoly` },
  { nazwa: 'Wprowadź wyniki', path: (id) => `/turniej/${id}/wyniki` },
];

const API_URL = import.meta.env.VITE_API_URL;

function CreateTournamentBar() {
  const { id } = useParams();
  const location = useLocation();
  const [typTurnieju, setTypTurnieju] = useState(null);

  useEffect(() => {
    const fetchTyp = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/api/turnieje/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTypTurnieju(data.typ);
        }
      } catch {
        console.error('Błąd pobierania typu turnieju');
      }
    };
    fetchTyp();
  }, [id]);

  const activeIndex = etapy.findIndex(etap =>
    location.pathname.startsWith(etap.path(id))
  );

  return (
    <div className="page-container">
      <nav className="step-bar">
        {etapy.map((etap, index) => {
          const link = etap.path(id);
          const isActive = location.pathname.startsWith(link);
          const isNext = index === activeIndex + 1;

          return (
            <Link
              key={link}
              to={link}
              className={`step-link ${isActive ? 'aktywny' : ''} ${isNext ? 'nastepny' : ''}`}
            >
              {etap.nazwa}
            </Link>
          );
        })}

        {typTurnieju && (
          <Link
            to={`/turniej/${id}/${typTurnieju === 'puchar' ? 'drabinka' : 'tabela'}`}
            className="step-link"
            style={{ marginLeft: 'auto', textDecoration: 'underline' }}
          >
            {typTurnieju === 'puchar' ? 'Drabinka' : 'Tabela'}
          </Link>
        )}
      </nav>
    </div>
  );
}

export default CreateTournamentBar;
