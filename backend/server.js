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
];

let progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };

app.get('/preguntas', (req, res) => {
    res.json(preguntas);
});

app.post('/responder', (req, res) => {
    const { grupo, indexPregunta, respuesta } = req.body;
    if (preguntas[indexPregunta].correcta === respuesta) {
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
