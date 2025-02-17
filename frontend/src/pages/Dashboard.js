import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">🏆 Plataforma de Gamificación</h1>
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="p-6 bg-blue-500 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-600 transition"
          onClick={() => navigate("/grupo1")}>
          <h2 className="text-xl font-bold">Grupo 1</h2>
          <p className="text-sm">Ir a las preguntas del Grupo 1</p>
        </div>
        <div className="p-6 bg-green-500 text-white rounded-xl shadow-lg cursor-pointer hover:bg-green-600 transition"
          onClick={() => navigate("/grupo2")}>
          <h2 className="text-xl font-bold">Grupo 2</h2>
          <p className="text-sm">Ir a las preguntas del Grupo 2</p>
        </div>
        <div className="p-6 bg-yellow-500 text-white rounded-xl shadow-lg cursor-pointer hover:bg-yellow-600 transition"
          onClick={() => navigate("/grupo3")}>
          <h2 className="text-xl font-bold">Grupo 3</h2>
          <p className="text-sm">Ir a las preguntas del Grupo 3</p>
        </div>
        <div className="p-6 bg-red-500 text-white rounded-xl shadow-lg cursor-pointer hover:bg-red-600 transition"
          onClick={() => navigate("/carrera")}>
          <h2 className="text-xl font-bold">Carrera de Caballos</h2>
          <p className="text-sm">Ver la competencia de grupos</p>
        </div>
      </div>
      <button
        className="mt-6 block mx-auto bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-800 transition"
        onClick={() => {
          localStorage.removeItem("authenticated");
          navigate("/");
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
