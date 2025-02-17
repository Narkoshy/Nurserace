import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "..pages/login.css"; // Importamos el CSS

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim() === "BSA" && password.trim() === "infermeria") {
      localStorage.setItem("authenticated", "true");
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Juegos Nurse Race 🔑 Iniciar Sesión</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-button" onClick={handleLogin}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

