# 🏆 Aplikacja do Zarządzania Turniejami Sportowymi (Fragment większego systemu)

Ten projekt to **fragment większego systemu informatycznego** przeznaczonego do kompleksowej obsługi zawodów sportowych dla różnych dyscyplin. W pełnej wersji aplikacja umożliwia organizatorom i użytkownikom:

- zakładanie turniejów w różnych dyscyplinach,
- definiowanie zasad rozgrywek (liga/puchar),
- zarządzanie zespołami i meczami,
- śledzenie wyników oraz automatyczne generowanie etapów turnieju,
- korzystanie z interfejsu (React) oraz backendu (Django REST Framework).

Obecnie projekt koncentruje się na piłce nożnej – jako podstawowej dyscyplinie testowej.

---

## 👨‍💻 Autor Dawid Kędzierski


## 🧠 Technologie
- **Backend**: Django 5.2.3, Django REST Framework
- **Frontend**: React + Vite
- **Baza danych**: SQLite (dla testów), PostgreSQL (docelowo)
- **Autoryzacja**: JWT (SimpleJWT)
- **Docker**: pełna obsługa środowiska


## 📁 Struktura katalogów
```
turnieje/
├── backend/
│   ├── config/            ← Główny projekt Django (settings, urls)
│   ├── pilka_nozna/       ← Modele, widoki, API do obsługi turniejów
│   ├── autoryzacja/       ← Logowanie, rejestracja użytkowników
├── frontend/              ← React + Vite + Tailwind (UI)
├── docker-compose.yml     ← Plik do uruchamiania całości
```


## ⚙️ Endpointy API

### 🔐 Autoryzacja
- `POST /auth/login/` – logowanie (JWT)
- `POST /auth/refresh/` – odświeżenie tokenu
- `POST /auth/register/` – rejestracja
- `GET /auth/me/` – dane użytkownika

### 🏆 Turnieje
- `GET /api/turnieje/` – lista turniejów użytkownika
- `POST /api/turnieje/` – utwórz nowy turniej
- `GET|PUT|DELETE /api/turnieje/<id>/` – zarządzanie turniejem

### 🧩 Drużyny
- `GET /api/druzyny/?turniej=<id>` – drużyny z konkretnego turnieju
- `POST /api/druzyny/` – dodaj drużynę

### ⚽ Mecze
- `GET /api/mecze/?turniej=<id>` – mecze z danego turnieju
- `POST /api/mecze/` – dodaj mecz

### ⚙️ Operacje specjalne
- `POST /api/generuj-mecze/<turniej_id>/` – automatyczne generowanie meczów
- `POST /api/zatwierdz-kolejke/<turniej_id>/` – przejście do kolejnego etapu
- `DELETE /api/resetuj-mecze/<turniej_id>/` – usunięcie wszystkich meczów


## 🚀 Uruchamianie

### ✅ Docker (zalecane)
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend (API): http://localhost:8000


### ✅ Ubuntu – środowisko lokalne
```bash
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python manage.py runserver
```


### ✅ Windows – PowerShell
```bash
python -m venv venv
.env\Scriptsctivate
pip install -r backend/requirements.txt
cd backend
python manage.py runserver
```


### ✅ Frontend (lokalnie)
```bash
cd frontend
npm install
npm run dev
```


## 👤 Tworzenie konta administratora (Django admin)

Aby mieć dostęp do panelu administracyjnego Django (`/admin`), należy utworzyć superużytkownika:

```bash
cd backend
python manage.py createsuperuser
```  
Po utworzeniu konta możesz zalogować się pod adresem:  
http://localhost:8000/admin/



## 🧾 Plik `.env`
Plik `frontend/.env` odpowiada za ustawienie portu dla frontendowego środowiska React. Jest to globalna konfiguracja używana przez cały projekt React.  
```
VITE_BACKEND_URL=http://localhost:8000
```
