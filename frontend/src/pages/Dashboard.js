import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css"; // Importamos el archivo CSS

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🏆 Plataforma de gamificació</h1>

      <div className="dashboard-buttons">
        <button className="button grupo1" onClick={() => navigate("/grupo1")}>
          📘 Grup 1
        </button>
        <button className="button grupo2" onClick={() => navigate("/grupo2")}>
          📗 Grup 2
        </button>
        <button className="button grupo3" onClick={() => navigate("/grupo3")}>
          📙 Grup 3
        </button>
        <button className="button carrera" onClick={() => navigate("/carrera")}>
          🏇 Carrera de Camells
        </button>
      </div>

      <button className="logout-button" onClick={() => {
        localStorage.removeItem("authenticated");
        navigate("/");
      }}>
        📕 Tancar sessió
      </button>
    </div>
  );
}
