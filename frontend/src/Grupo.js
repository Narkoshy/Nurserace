import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Grupo = ({ grupo }) => {
    const [preguntas, setPreguntas] = useState([]);
    const [indiceActual, setIndiceActual] = useState(0);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        axios.get('https://nurserace-backend.onrender.com/preguntas')
            .then(response => setPreguntas(response.data))
            .catch(error => console.error(error));
    }, []);

    const responder = (indiceRespuesta) => {
        axios.post('https://nurserace-backend.onrender.com/responder', {
            grupo, // Aquí se envía el grupo correcto (ej: grupo1, grupo2, grupo3)
            indexPregunta: indiceActual,  // Asegurar que se usa la pregunta actual
   	    respuesta: indiceRespuesta    // Enviar la opción seleccionada
        })
	.then(response => {
            if (response.data.progreso > 0) {
                setIndiceActual(indiceActual + 1);
                setMensaje("✅ ¡Correcte!");
            } else {
                setIndiceActual(0);
                setMensaje("❌ Incorrecte, tornes a l'inici.");
            }
        })
			.catch(error => console.error("Error en la resposta:", error));
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
            {preguntas.length > 0 && indiceActual < preguntas.length ? (
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
            ) : <h2>🏆 ¡Has completat totes les preguntes!</h2>}
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', marginTop: '20px' }}>{mensaje}</p>
        </div>
    );
};

export default Grupo
