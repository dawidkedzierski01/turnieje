import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateTournamentBar from "../components/CreateTournamentBar";
import MessageBox from "../components/MessageBox";
import TournamentActionButtons from "../components/TournamentActionButtons";

const API_URL = import.meta.env.VITE_API_URL;

function PlanMatchesPage() {
  const { id } = useParams();
  const [mecze, setMecze] = useState([]);
  const [turniej, setTurniej] = useState(null);
  const [error, setError] = useState(null);
  const [generowane, setGenerowane] = useState(false);
  const [resetowane, setResetowane] = useState(false);
  const [filterKolejka, setFilterKolejka] = useState("");
  const navigate = useNavigate();

  const handle401 = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/logowanie");
  };

  const fetchWithAuth = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    if (res.status === 401) {
      handle401();
      return null;
    }

    return res;
  };

  const fetchData = async () => {
    try {
      const [meczeRes, turniejRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/api/mecze/?turniej=${id}`),
        fetchWithAuth(`${API_URL}/api/turnieje/${id}/`)
      ]);

      if (!meczeRes || !turniejRes) return;
      if (!meczeRes.ok || !turniejRes.ok) throw new Error("Błąd pobierania danych");

      const meczeData = await meczeRes.json();
      const turniejData = await turniejRes.json();

      setMecze(meczeData);
      setTurniej(turniejData);
    } catch (err) {
      setError(err.message);
    }
  };

  const generujMecze = async () => {
    try {
      setGenerowane(true);
      const res = await fetchWithAuth(`${API_URL}/api/generuj-mecze/${id}/`, {
        method: "POST",
      });
      if (!res) return;

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd podczas generowania meczów");
      }

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerowane(false);
    }
  };

  const resetujMecze = async () => {
    try {
      setResetowane(true);
      const res = await fetchWithAuth(`${API_URL}/api/resetuj-mecze/${id}/`, {
        method: "DELETE",
      });
      if (!res) return;

      const data =
        res.headers.get("content-type")?.includes("application/json")
          ? await res.json()
          : null;

      if (!res.ok) throw new Error(data?.error || "Błąd podczas resetowania meczów");

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetowane(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const meczeGrupowane = useMemo(() => {
    return mecze.reduce((acc, mecz) => {
      const kolejka = mecz.runda || "Brak kolejki";
      if (filterKolejka && !kolejka.includes(filterKolejka)) return acc;
      if (!acc[kolejka]) acc[kolejka] = [];
      acc[kolejka].push(mecz);
      return acc;
    }, {});
  }, [mecze, filterKolejka]);

  const kolejki = Object.keys(meczeGrupowane);

  return (
    <div>
      <CreateTournamentBar />
      <MessageBox message={error} type="error" />

      {turniej && (
        <h2 style={{ margin: "1em 0", fontWeight: "bold" }}>
          Planowanie meczów <span style={{ color: "#646cff" }}>| {turniej.nazwa} |</span>
        </h2>
      )}

      <TournamentActionButtons
        onGenerate={generujMecze}
        onReset={resetujMecze}
        saveLabel="Zapisz"
        nextStepLabel="Przejdź do szczegółów"
        nextStepPath={() => navigate(`/turniej/${id}/szczegoly`)}
      />

      <div style={{ marginBottom: "1em" }}>
        <input
          type="text"
          placeholder="Wyszukaj kolejkę"
          value={filterKolejka}
          onChange={(e) => setFilterKolejka(e.target.value)}
          style={{ padding: "0.4em 0.6em", width: "180px" }}
        />
      </div>

      {kolejki.length > 0 ? (
        kolejki.map((kolejka) => (
          <div key={kolejka} style={{ marginBottom: "1.5em" }}>
            <h3 style={{ fontWeight: "bold", borderBottom: "2px solid #646cff", paddingBottom: "0.2em" }}>
              Kolejka: {kolejka}
            </h3>
            <table className="main-table" style={{ marginTop: "0.5em" }}>
              <thead>
                <tr>
                  <th>Drużyna A</th>
                  <th>Drużyna B</th>
                </tr>
              </thead>
              <tbody>
                {meczeGrupowane[kolejka].map((mecz) => (
                  <tr key={mecz.id}>
                    <td>{mecz.druzyna_a_nazwa || mecz.druzyna_a}</td>
                    <td>{mecz.druzyna_b_nazwa || mecz.druzyna_b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Brak meczów do wyświetlenia.</p>
      )}
    </div>
  );
}

export default PlanMatchesPage;
