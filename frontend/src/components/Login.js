import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (username === "BSA" && password === "infermeria") {
        localStorage.setItem("authenticated", "true");
        navigate("/dashboard");
      } else {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
      }
    }, 1000);
  };

  return (
   <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-500">
  <div className="bg-white p-10 rounded-xl shadow-lg w-96 text-center space-y-6"> {/* <-- Aquí añadimos `space-y-6` */}
    <h2 className="text-3xl font-bold text-gray-700">Acceso</h2>
    
    {error && <p className="text-red-500 text-sm">{error}</p>}
    
    <div className="relative space-y-4"> {/* Separación entre los inputs */}
      <div className="relative">
        <FaUser className="absolute left-3 top-3 text-gray-500" />
        <input type="text" placeholder="Usuario" className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="relative">
        <FaLock className="absolute left-3 top-3 text-gray-500" />
        <input type="password" placeholder="Contraseña" className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <button className="w-full bg-blue-600 text-white p-3 rounded-md text-lg font-semibold hover:bg-blue-700">
      Iniciar sesión
    </button>
  </div>
</div>
  );
}

