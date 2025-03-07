import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Grupo = ({ grupo }) => {
    const [preguntas, setPreguntas] = useState([]);
    const [indiceActual, setIndiceActual] = useState(0);
    const [mensaje, setMensaje] = useState("");
    const [carreraFinalizada, setCarreraFinalizada] = useState(false);

    useEffect(() => {
        axios.get('https://nurserace-backend.onrender.com/preguntas')
            .then(response => setPreguntas(response.data))
            .catch(error => console.error(error));
    }, []);

    const responder = (indiceRespuesta) => {
        if (carreraFinalizada) {
            setMensaje("🏁 La carrera ha terminado. Reinicia para jugar de nuevo.");
            return;
        }

        axios.post('https://nurserace-backend.onrender.com/responder', {
            grupo, 
            indexPregunta: indiceActual,
            respuesta: indiceRespuesta
        })
        .then(response => {
            if (response.data.mensaje === "🏁 La carrera ha terminado. Reinicie para jugar de nuevo.") {
                setCarreraFinalizada(true);
                setMensaje("🏆 La carrera ha finalizado. Usa el botón para reiniciar.");
            } else if (response.data.progreso > 0) {
                setIndiceActual(indiceActual + 1);
                setMensaje("✅ ¡Correcte!");
            } else {
                setIndiceActual(0);
                setMensaje("❌ Incorrecte, tornes a l'inici.");
            }
        })
        .catch(error => console.error("Error en la resposta:", error));
    };

    const reiniciarCarrera = () => {
        axios.post('https://nurserace-backend.onrender.com/reiniciar')
            .then(response => {
                console.log(response.data.mensaje);
                setIndiceActual(0);
                setMensaje("🔄 Carrera reiniciada.");
                setCarreraFinalizada(false);
            })
            .catch(error => console.error("Error al reiniciar:", error));
    };

    return (
        <div style={{
            textAlign: 'center',
            marginTop: '50px',
            fontFamily: 'Arial, sans-serif',
            background: '#f4f4f4',
            height: '100vh',
            padding: '20px'
        }}>
            {preguntas.length > 0 && indiceActual < preguntas.length && !carreraFinalizada ? (
                <div>
                    <h2 style={{ fontSize: '1.8em' }}>{preguntas[indiceActual].pregunta}</h2>
                    {preguntas[indiceActual].opciones.map((opcion, index) => (
                        <button key={index} 
                            onClick={() => responder(index)}
                            style={{
                                display: 'block',
                                width: '80%',
                                margin: '10px auto',
                                padding: '15px',
                                fontSize: '1.2em',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#007bff',
                                color: 'white',
                                transition: '0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#0056b3'}
                            onMouseOut={(e) => e.target.style.background = '#007bff'}
                        >
                            {opcion}
                        </button>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>🏆 ¡Has completat totes les preguntes!</h2>
                    <button 
                        onClick={reiniciarCarrera}
                        style={{
                            marginTop: '20px',
                            padding: '15px',
                            fontSize: '1.2em',
                            borderRadius: '10px',
                            background: '#28a745',
                            color: 'white',
                            cursor: 'pointer',
                            border: 'none',
                            transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#218838'}
                        onMouseOut={(e) => e.target.style.background = '#28a745'}
                    >
                        🔄 Reiniciar Carrera
                    </button>
                </div>
            )}
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', marginTop: '20px' }}>{mensaje}</p>
        </div>
    );
};

export default Grupo;
