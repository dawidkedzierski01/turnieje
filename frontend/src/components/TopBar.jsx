import { Link, useLocation, useNavigate } from 'react-router-dom';

const topNav = [
  { label: 'Strona główna', to: '/' },
  { label: 'Utwórz turniej', to: '/utworz-turniej' },
  { label: 'Lista turniejów', to: '/lista-turniejow' },
];

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access');

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/logowanie');
  };

  return (
    <nav className="bar top-bar">
      <div className="top-bar-left">
        {topNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`bar-link ${location.pathname === item.to ? 'aktywny' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="top-bar-right">
        {isLoggedIn && (
          <button onClick={handleLogout} className="bar-link logout-button">
            Wyloguj się
          </button>
        )}
      </div>
    </nav>
  );
}

export default TopBar;
