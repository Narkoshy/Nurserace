const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const preguntas = [
    { pregunta: "¿Cuál es la capital de Francia?", opciones: ["Madrid", "París", "Berlín", "Roma"], correcta: 1 },
    { pregunta: "¿Cuánto es 2+2?", opciones: ["3", "4", "5", "6"], correcta: 1 },
    { pregunta: "¿Quién fue el descubridor de las vacunas?", opciones: ["Edward Jener", "Louis Pasteur", "Alexander Flemming", "John Snow"], correcta: 0 },
    { pregunta: "¿Cuándo se inició la vacunación COVID en España?", opciones: ["Febrero 2021", "Septiembre 2020", "Diciembre 2019", "Diciembre 2020"], correcta: 3 },
];

let progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };

app.post('/reiniciar', (req, res) => {
    progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
    io.emit('actualizarCarrera', progresoGrupos);
    res.json({ mensaje: "Progreso reiniciado" });
});

app.get('/preguntas', (req, res) => {
    res.json(preguntas);
});

app.post('/responder', (req, res) => {
    console.log("📩 Datos recibidos:", req.body);
    const { grupo, indexPregunta, respuesta } = req.body;
    if (preguntas[indexPregunta].correcta === parseInt(respuesta)) {
        progresoGrupos[grupo]++;
    } else {
        progresoGrupos[grupo] = 0;
    }
    io.emit('actualizarCarrera', progresoGrupos);
    res.json({ progreso: progresoGrupos[grupo] });
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    socket.emit('actualizarCarrera', progresoGrupos);
    socket.on('disconnect', () => console.log('Cliente desconectado'));
});

server.listen(4000, () => console.log('Servidor corriendo en el puerto 4000'));