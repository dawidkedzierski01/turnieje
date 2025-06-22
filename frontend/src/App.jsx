import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TopBar from './components/TopBar';
import ThemeToggle from './components/ThemeToggle';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CreateTournamentPage from './pages/CreateTournamentPage';
import TournamentListPage from './pages/TournamentListPage';
import AddTeamsPage from './pages/AddTeamsPage';
import PlanMatchesPage from './pages/PlanMatchesPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';
import MatchResultsPage from './pages/MatchResultsPage';
import LeagueTablePage from './pages/LeagueTablePage';
import BracketPage from './pages/BracketPage';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
  const location = useLocation();
  const hideTopBarOn = ['/logowanie', '/rejestracja'];
  const isTopBarVisible = !hideTopBarOn.includes(location.pathname);

  return (
    <>
      {isTopBarVisible && <TopBar />}
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/logowanie" element={<LoginForm />} />
        <Route path="/rejestracja" element={<RegisterForm />} />

        <Route path="/utworz-turniej" element={<PrivateRoute><CreateTournamentPage /></PrivateRoute>} />
        <Route path="/lista-turniejow" element={<PrivateRoute><TournamentListPage /></PrivateRoute>} />
        <Route path="/turniej/:id/druzyny" element={<PrivateRoute><AddTeamsPage /></PrivateRoute>} />
        <Route path="/turniej/:id/planowanie-meczy" element={<PrivateRoute><PlanMatchesPage /></PrivateRoute>} />
        <Route path="/turniej/:id/szczegoly" element={<PrivateRoute><TournamentDetailsPage /></PrivateRoute>} />
        <Route path="/turniej/:id/wyniki" element={<PrivateRoute><MatchResultsPage /></PrivateRoute>} />
        <Route path="/turniej/:id/tabela" element={<PrivateRoute><LeagueTablePage /></PrivateRoute>} />
        <Route path="/turniej/:id/drabinka" element={<PrivateRoute><BracketPage /></PrivateRoute>} />

        <Route path="*" element={<p style={{ padding: '1em' }}>Nie znaleziono strony</p>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
