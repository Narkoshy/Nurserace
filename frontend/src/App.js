import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Grupo from "./Grupo";
import CarreraCaballos from "./CarreraCaballos";
import Login from "./components/Login"; // Importamos la pantalla de login
import ProtectedRoute from "./components/ProtectedRoute"; // Importamos la ruta protegida

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/grupo1" 
          element={<ProtectedRoute><Grupo grupo="grupo1" /></ProtectedRoute>} 
        />
        <Route 
          path="/grupo2" 
          element={<ProtectedRoute><Grupo grupo="grupo2" /></ProtectedRoute>} 
        />
        <Route 
          path="/grupo3" 
          element={<ProtectedRoute><Grupo grupo="grupo3" /></ProtectedRoute>} 
        />
        <Route 
          path="/carrera" 
          element={<ProtectedRoute><CarreraCaballos /></ProtectedRoute>} 
        />
      </Routes>
    </Router>
  );
}

export default App;
