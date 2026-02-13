import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./login.css"; // Importamos el CSS

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    if (username.trim() === "BSA" && password.trim() === "infermeria") {
      localStorage.setItem("authenticated", "true");
      navigate("/dashboard");
    } else {
      setError("Usuari o contrasenya incorrectes");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <p className="login-kicker">Nurse Race</p>
        <h2 className="login-title">Iniciar sessió</h2>
        <p className="login-subtitle">Accés intern per gestionar i jugar al qüestionari.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Usuari"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Contrasenya"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" type="submit">
            Entrar
          </button>
        </form>
      </div>
      <div className="login-deco" aria-hidden="true" />
    </div>
  );
}
