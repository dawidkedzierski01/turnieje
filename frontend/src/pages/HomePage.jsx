import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-container">
      <h1>Witamy w aplikacji Organizator Zawodów</h1>

      <p className="home-description">
        Zarządzaj turniejami sportowymi online! Dodawaj drużyny, planuj mecze, rejestruj wyniki i śledź przebieg rozgrywek w czasie rzeczywistym.
      </p>

      <h2>Co możesz zrobić?</h2>
      <ul className="home-list">
        <li>Tworzyć turnieje (liga/puchar)</li>
        <li>Dodawać drużyny i ustalać harmonogramy</li>
        <li>Zarządzać wynikami meczów</li>
      </ul>

      <div className="home-button-wrapper">
        <Link to="/utworz-turniej" className="home-button">
          Utwórz swój turniej
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
