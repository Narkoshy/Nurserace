const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 🔹 Preguntas en catalán
const preguntas = [
    { 
        pregunta: "Qui va descobrir les vacunes?", 
        opciones: ["Edward Jener", "Louis Pasteur", "Alexander Fleming", "Cristina i Sara"], 
        correcta: 0 
    },
    { 
        pregunta: "A quina edat s’administra la vacuna TV?", 
        opciones: ["12 mesos – 3 anys", "15 mesos – 3 anys", "9 mesos – 3 anys", "dosis única als 15 mesos"], 
        correcta: 0 
    }
];

// 🔹 Estado inicial de la carrera
let progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
let carreraFinalizada = false;
const PUNTOS_NECESARIOS = 20; // Ahora se necesita 20 respuestas correctas para ganar

// 🔹 Ruta para obtener preguntas
app.get('/preguntas', (req, res) => {
    res.json(preguntas);
});

// 🔹 Ruta para responder preguntas
app.post('/responder', (req, res) => {
    console.log("📩 Datos recibidos:", req.body);
    const { grupo, indexPregunta, respuesta } = req.body;

    if (carreraFinalizada) {
        return res.json({ mensaje: "🏁 La carrera ha terminado. Reinicie para jugar de nuevo." });
    }

    if (preguntas[indexPregunta].correcta === parseInt(respuesta)) {
        progresoGrupos[grupo]++;
        console.log(`✅ Grupo ${grupo} ha acertado. Progreso:`, progresoGrupos[grupo]);

        // Si un grupo llega a 20 puntos, la carrera finaliza
        if (progresoGrupos[grupo] >= PUNTOS_NECESARIOS) {
            carreraFinalizada = true;
            io.emit('carreraFinalizada', { ganador: grupo });
            console.log(`🏆 ${grupo} ha ganado la carrera!`);
        }

    } else {
        progresoGrupos[grupo] = 0;
        console.log(`❌ Grupo ${grupo} ha fallado. Reiniciando su progreso.`);
    }

    io.emit('actualizarCarrera', progresoGrupos);
    res.json({ progreso: progresoGrupos[grupo] });
});

// 🔹 Ruta para reiniciar la carrera
app.post('/reiniciar', (req, res) => {
    progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
    carreraFinalizada = false;
    io.emit('actualizarCarrera', progresoGrupos);
    console.log("🔄 Carrera reiniciada.");
    res.json({ mensaje: "Carrera reiniciada correctamente." });
});

// 🔹 Conexión de clientes
io.on('connection', (socket) => {
    console.log('🟢 Nuevo cliente conectado');
    socket.emit('actualizarCarrera', progresoGrupos);

    socket.on('disconnect', () => console.log('🔴 Cliente desconectado'));
});

// 🔹 Iniciar servidor
server.listen(4000, () => console.log('🚀 Servidor funcionando en el puerto 4000'));
