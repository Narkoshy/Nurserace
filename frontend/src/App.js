import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Grupo from './Grupo';
import CarreraCaballos from './CarreraCaballos';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<h1>Bienvenido al Juego de Preguntas</h1>} />
                <Route path="/grupo1" element={<Grupo grupo="grupo1" />} />
                <Route path="/grupo2" element={<Grupo grupo="grupo2" />} />
                <Route path="/grupo3" element={<Grupo grupo="grupo3" />} />
                <Route path="/carrera" element={<CarreraCaballos />} />
            </Routes>
        </Router>
    );
}

export default App;
