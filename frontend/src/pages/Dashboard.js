import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    navigate("/");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a la plataforma de gamificación</h1>
      <div className="space-y-2">
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => navigate("/grupo1")}>
          Ir a Grupo 1
        </button>
        <button className="bg-green-500 text-white p-2 rounded" onClick={() => navigate("/grupo2")}>
          Ir a Grupo 2
        </button>
        <button className="bg-yellow-500 text-white p-2 rounded" onClick={() => navigate("/grupo3")}>
          Ir a Grupo 3
        </button>
        <button className="bg-red-500 text-white p-2 rounded" onClick={() => navigate("/carrera")}>
          Ver Carrera de Caballos
        </button>
      </div>
      <button className="mt-4 bg-gray-500 text-white p-2 rounded" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
