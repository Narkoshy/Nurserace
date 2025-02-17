import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Grupo1 from "./pages/Grupo1";
import Grupo2 from "./pages/Grupo2";
import Grupo3 from "./pages/Grupo3";
import Carrera from "./pages/Carrera";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/grupo1" element={<ProtectedRoute><Grupo1 /></ProtectedRoute>} />
        <Route path="/grupo2" element={<ProtectedRoute><Grupo2 /></ProtectedRoute>} />
        <Route path="/grupo3" element={<ProtectedRoute><Grupo3 /></ProtectedRoute>} />
        <Route path="/carrera" element={<ProtectedRoute><Carrera /></ProtectedRoute>} />
      </Routes>
  );
}

export default App;
