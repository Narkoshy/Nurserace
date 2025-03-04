import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://nurserace-backend.onrender.com');

const CarreraCaballos = () => {
    const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
    const [ganador, setGanador] = useState(null);
    const [tiempo, setTiempo] = useState(0); // ⏱ Estado del cronómetro
    const [enMarcha, setEnMarcha] = useState(false); // 🚦 Controla si el cronómetro está en marcha

    useEffect(() => {
        console.log("🔗 Conectando a WebSockets...");
        socket.on('actualizarCarrera', (nuevaCarrera) => {
            console.log("📡 Datos recibidos desde el backend:", nuevaCarrera);
            setProgreso(nuevaCarrera);

            // Verificar si algún grupo ha ganado y detener el cronómetro
            Object.entries(nuevaCarrera).forEach(([grupo, avance]) => {
                if (avance >= 20) {
                    setGanador(grupo);
                    setEnMarcha(false); // ⏹ Detiene el cronómetro cuando hay ganador
                }
            });
        });

        return () => {
            socket.off('actualizarCarrera');
        };
    }, []);

    useEffect(() => {
        let intervalo;
        if (enMarcha) {
            intervalo = setInterval(() => {
                setTiempo((prevTiempo) => prevTiempo + 1);
            }, 1000);
        } else {
            clearInterval(intervalo);
        }
        return () => clearInterval(intervalo);
    }, [enMarcha]);

    const iniciarCarrera = () => {
        setTiempo(0); // 🔄 Reinicia el tiempo
        setGanador(null); // 🔄 Reinicia el ganador
        setEnMarcha(true); // ▶️ Inicia el cronómetro
    };

    return (
        <div style={{
            textAlign: 'center',
            marginTop: '20px',
            backgroundImage: 'url("/pista.jpg")',
            backgroundSize: 'cover',
            height: '100vh',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <h1 style={{
                color: 'white',
                fontSize: '4em',
                textShadow: '2px 2px 4px black',
                marginBottom: '20px'
            }}>
                🐪 Carrera de Camells 🐪
            </h1>

            {/* ⏱ Mostrar el tiempo en la pantalla */}
            <h2 style={{
                color: 'green',
                fontSize: '2em',
                textShadow: '2px 2px 4px black'
            }}>
                ⏱ Temps: {tiempo} segons
            </h2>

            {/* 🔘 Botón de Start */}
            {!enMarcha && !ganador && (
                <button 
                    onClick={iniciarCarrera} 
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    Start
                </button>
            )}

            {ganador ? (
                <h2 style={{
                    color: 'yellow',
                    fontSize: '3em',
                    textShadow: '2px 2px 4px black',
                    marginBottom: '20px'
                }}>
                    🎉 ¡{ganador} ha guanyat en {tiempo} segons! 🎉
                </h2>
            ) : (
                <div style={{
                    maxWidth: '900px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {Object.entries(progreso).map(([grupo, avance]) => (
                        <div key={grupo} style={{
                            width: '100%',
                            marginBottom: '50px', // Aumentamos el espacio entre caballos
                            position: 'relative',
                            height: '120px' // Hacemos más grande la pista de cada caballo
                        }}>
                            <h2 style={{
                                color: 'white',
                                textShadow: '1px 1px 3px black',
                                marginBottom: '5px',
                                fontSize: '1.5em'
                            }}>
                                {grupo}
                            </h2>
                            <div style={{
                                width: '100%',
                                height: '100px',
                                borderRadius: '10px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                background: `repeating-linear-gradient(
                                    45deg,
                                    #8B4513 0px,
                                    #8B4513 15px,
                                    #A0522D 15px,
                                    #A0522D 30px
                                )`
                            }}>
                                {/* Imagen del caballo avanzando */}
                                <img 
                                    src="/caballo.png" 
                                    alt="Caballo" 
                                    style={{
                                        position: 'absolute',
                                        left: `${(avance / 20) * 100}%`,
                                        transition: 'left 0.5s ease-in-out',
                                        height: '100px' // Ajustamos el tamaño del caballo
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CarreraCaballos;
