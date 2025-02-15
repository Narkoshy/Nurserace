import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://nurserace-backend.onrender.com');

const CarreraCaballos = () => {
    const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
    const [ganador, setGanador] = useState(null);

    useEffect(() => {
        console.log("🔗 Conectando a WebSockets...");
        socket.on('actualizarCarrera', (nuevaCarrera) => {
            console.log("📡 Datos recibidos desde el backend:", nuevaCarrera);
            setProgreso(nuevaCarrera);

            // Verificar si alguien ha ganado
            Object.entries(nuevaCarrera).forEach(([grupo, avance]) => {
                if (avance >= 20) {
                    setGanador(grupo);
                }
            });
        });

        return () => {
            socket.off('actualizarCarrera');
        };
    }, []);

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
                fontSize: '2em',
                textShadow: '2px 2px 4px black',
                marginBottom: '20px'
            }}>
                🏇 Carrera de Caballos 🏇
            </h1>

            {ganador ? (
                <h2 style={{
                    color: 'yellow',
                    fontSize: '3em',
                    textShadow: '2px 2px 4px black',
                    marginBottom: '20px'
                }}>
                    🎉 ¡{ganador} ha ganado! 🎉
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