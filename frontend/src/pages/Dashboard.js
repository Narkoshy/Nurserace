import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    navigate("/");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Bienvenido a la plataforma de gamificación</h1>
      <button
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
