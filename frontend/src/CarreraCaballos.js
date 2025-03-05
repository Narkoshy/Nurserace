import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://nurserace-backend.onrender.com');

const CarreraCaballos = () => {
    const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
    const [ganador, setGanador] = useState(null);
    const [tiempo, setTiempo] = useState(0);
    const [enMarcha, setEnMarcha] = useState(false);

    useEffect(() => {
        console.log("🔗 Conectando a WebSockets...");
        socket.on('actualizarCarrera', (nuevaCarrera) => {
            console.log("📡 Datos recibidos desde el backend:", nuevaCarrera);
            
            // Reiniciar progreso si la carrera ha finalizado
            if (Object.values(nuevaCarrera).some(avance => avance >= 20)) {
                setGanador(Object.keys(nuevaCarrera).find(grupo => nuevaCarrera[grupo] >= 20));
                setEnMarcha(false);
                return;
            }

            setProgreso(nuevaCarrera);
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
        setTiempo(0);
        setGanador(null);
        setEnMarcha(true);
        setProgreso({ grupo1: 0, grupo2: 0, grupo3: 0 });

        // 🔄 Enviar evento al backend para reiniciar la carrera
        socket.emit('reiniciarCarrera');
    };

    const reiniciarCarrera = () => {
        setTiempo(0);
        setGanador(null);
        setEnMarcha(false);
        setProgreso({ grupo1: 0, grupo2: 0, grupo3: 0 });

        // 🔄 Enviar evento al backend para reiniciar la carrera
        socket.emit('reiniciarCarrera');
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

            <h2 style={{
                color: 'green',
                fontSize: '2em',
                textShadow: '2px 2px 4px black'
            }}>
                ⏱ Temps: {tiempo} segons
            </h2>

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

            {ganador && (
                <button 
                    onClick={reiniciarCarrera} 
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#ff0000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    Reiniciar Carrera
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
                            marginBottom: '50px',
                            position: 'relative',
                            height: '120px'
                        }}>
                            <h2 style={{
                                color: 'white',
                                textShadow: '1px 1px 3px black',
                                marginBottom: '5px',
                                fontSize: '1.5em'
                            }}>
                                {grupo === "grupo1" ? "Grup 1" : grupo === "grupo2" ? "Grup 2" : "Grup 3"}
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
                                <img 
                                    src="/caballo.png" 
                                    alt="Caballo" 
                                    style={{
                                        position: 'absolute',
                                        left: `${(avance / 20) * 100}%`,
                                        transition: 'left 0.5s ease-in-out',
                                        height: '100px'
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
