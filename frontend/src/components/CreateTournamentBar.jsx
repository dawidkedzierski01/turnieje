import { Link, useParams, useLocation } from 'react-router-dom';

const etapy = [
  { nr: 1, nazwa: 'Utwórz turniej', path: () => '/utworz-turniej' },
  { nr: 2, nazwa: 'Dodaj drużyny', path: (id) => `/turniej/${id}/druzyny` },
  { nr: 3, nazwa: 'Rozpisz mecze', path: (id) => `/turniej/${id}/planowanie-meczy` },
  { nr: 4, nazwa: 'Szczegóły', path: (id) => `/turniej/${id}/szczegoly` },
  { nr: 5, nazwa: 'Wprowadź wyniki', path: (id) => `/turniej/${id}/wyniki` },
  { nr: 6, nazwa: 'Tabela wyników', path: (id) => `/turniej/${id}/tabela` },
];

function CreateTournamentBar() {
  const { id } = useParams();
  const location = useLocation();

  return (
    <nav className="bar">
      {etapy.map((etap, index) => {
        const link = etap.path(id);
        const aktywny = location.pathname.startsWith(link); // lepsze niż ===

        return (
          <Link
            key={index}
            to={link}
            className={`bar-link ${aktywny ? 'aktywny' : ''}`}
          >
            {etap.nr ? `${etap.nr}. ` : ''}
            {etap.nazwa}
          </Link>
        );
      })}
    </nav>
  );
}

export default CreateTournamentBar;
