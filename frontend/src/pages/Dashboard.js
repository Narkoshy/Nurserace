import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">🏆 Plataforma de Gamificación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <button className="p-6 bg-blue-500 text-white rounded-xl shadow-lg text-xl font-semibold cursor-pointer hover:bg-blue-600 transition"
          onClick={() => navigate("/grupo1")}>
          📘 Grupo 1
        </button>
        <button className="p-6 bg-green-500 text-white rounded-xl shadow-lg text-xl font-semibold cursor-pointer hover:bg-green-600 transition"
          onClick={() => navigate("/grupo2")}>
          📗 Grupo 2
        </button>
        <button className="p-6 bg-yellow-500 text-white rounded-xl shadow-lg text-xl font-semibold cursor-pointer hover:bg-yellow-600 transition"
          onClick={() => navigate("/grupo3")}>
          📙 Grupo 3
        </button>
        <button className="p-6 bg-red-500 text-white rounded-xl shadow-lg text-xl font-semibold cursor-pointer hover:bg-red-600 transition"
          onClick={() => navigate("/carrera")}>
          🏇 Carrera de Caballos
        </button>
      </div>

      <button
        className="mt-10 bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
        onClick={() => {
          localStorage.removeItem("authenticated");
          navigate("/");
        }}
      >
        🚪 Cerrar sesión
      </button>
    </div>
  );
}
