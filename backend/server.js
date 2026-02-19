const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const DATA_DIR = path.join(__dirname, 'data');
const PREGUNTAS_FILE = path.join(DATA_DIR, 'preguntas.json');
const GRUPOS_VALIDOS = new Set(['grupo1', 'grupo2', 'grupo3']);

const seedPreguntas = (() => {
  // Seed file shipped with the repo to keep orthography/wording out of code.
  try {
    const seedPath = path.join(DATA_DIR, 'seed_preguntes.json');
    if (fs.existsSync(seedPath)) {
      const parsed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_err) {
    // ignore
  }

  return [
    {
      pregunta: 'Qui va descobrir les vacunes?',
      opciones: ['Edward Jenner', 'Louis Pasteur', 'Alexander Fleming', 'Cristina i Sara'],
      correcta: 0,
    },
  ];
})();

let preguntas = [];
let progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
let carreraFinalizada = false;
let detallGrups = {};

app.use(cors());
app.use(express.json());

function getPuntosNecesarios() {
  return Math.max(1, preguntas.length);
}

function getPreguntaInicial() {
  return preguntas.length > 0 ? 1 : null;
}

function getEnunciatByNumero(numeroPregunta) {
  if (!Number.isInteger(numeroPregunta) || numeroPregunta < 1 || numeroPregunta > preguntas.length) {
    return null;
  }
  return preguntas[numeroPregunta - 1]?.pregunta || null;
}

function createDetallGrup() {
  const preguntaInicial = getPreguntaInicial();
  return {
    preguntaActual: preguntaInicial,
    enunciatActual: getEnunciatByNumero(preguntaInicial),
    ultimaResposta: null,
    feedbackToken: 0,
  };
}

function createDetallGrups() {
  return {
    grupo1: createDetallGrup(),
    grupo2: createDetallGrup(),
    grupo3: createDetallGrup(),
  };
}

function sincronizarDetallGrups() {
  const preguntaInicial = getPreguntaInicial();
  for (const grup of GRUPOS_VALIDOS) {
    if (!detallGrups[grup]) {
      detallGrups[grup] = createDetallGrup();
      continue;
    }

    if (preguntaInicial === null) {
      detallGrups[grup].preguntaActual = null;
      detallGrups[grup].enunciatActual = null;
      continue;
    }

    const actual = Number(detallGrups[grup].preguntaActual);
    if (!Number.isInteger(actual) || actual < 1 || actual > preguntas.length) {
      detallGrups[grup].preguntaActual = preguntaInicial;
      detallGrups[grup].enunciatActual = getEnunciatByNumero(preguntaInicial);
    } else {
      detallGrups[grup].enunciatActual = getEnunciatByNumero(actual);
    }
  }
}

function normalizarPregunta(raw) {
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    pregunta: String(raw.pregunta || '').trim(),
    opciones: Array.isArray(raw.opciones) ? raw.opciones.map((opcion) => String(opcion || '').trim()) : [],
    correcta: Number(raw.correcta),
  };
}

function validarPreguntaPayload(raw) {
  const pregunta = normalizarPregunta(raw);

  if (!pregunta.pregunta) {
    return { ok: false, error: "La pregunta és obligatòria." };
  }

  if (!Array.isArray(pregunta.opciones) || pregunta.opciones.length !== 4) {
    return { ok: false, error: "Has d'indicar exactament 4 opcions." };
  }

  if (pregunta.opciones.some((opcion) => !opcion)) {
    return { ok: false, error: "Cap opció pot estar buida." };
  }

  if (!Number.isInteger(pregunta.correcta) || pregunta.correcta < 0 || pregunta.correcta >= pregunta.opciones.length) {
    return { ok: false, error: "La resposta correcta no és vàlida." };
  }

  return { ok: true, pregunta };
}

function savePreguntas() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PREGUNTAS_FILE, JSON.stringify(preguntas, null, 2), 'utf-8');
}

function loadPreguntas() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(PREGUNTAS_FILE)) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
    savePreguntas();
    return;
  }

  const contenido = fs.readFileSync(PREGUNTAS_FILE, 'utf-8');
  const parsed = JSON.parse(contenido);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
    savePreguntas();
    return;
  }

  preguntas = parsed
    .map((pregunta) => {
      const result = validarPreguntaPayload(pregunta);
      if (!result.ok) {
        return null;
      }
      return { ...result.pregunta, id: pregunta.id || crypto.randomUUID() };
    })
    .filter(Boolean);

  if (preguntas.length === 0) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
  }

  savePreguntas();
}

function getEstadoCarrera() {
  return {
    progreso: progresoGrupos,
    detallGrups,
    carreraFinalizada,
    puntosNecesarios: getPuntosNecesarios(),
  };
}

function resetCarrera() {
  progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
  carreraFinalizada = false;
  detallGrups = createDetallGrups();
}

function emitirEstadoCarrera() {
  io.emit('actualizarCarrera', getEstadoCarrera());
}

loadPreguntas();
resetCarrera();

app.get('/preguntas', (_req, res) => {
  res.json(preguntas);
});

app.post('/preguntas', (req, res) => {
  const result = validarPreguntaPayload(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const nuevaPregunta = { ...result.pregunta, id: crypto.randomUUID() };
  preguntas.push(nuevaPregunta);
  savePreguntas();
  sincronizarDetallGrups();
  emitirEstadoCarrera();

  return res.status(201).json(nuevaPregunta);
});

app.put('/preguntas/:id', (req, res) => {
  const { id } = req.params;
  const index = preguntas.findIndex((pregunta) => pregunta.id === id);

  if (index < 0) {
    return res.status(404).json({ error: 'Pregunta no trobada.' });
  }

  const result = validarPreguntaPayload({ ...req.body, id });
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  preguntas[index] = result.pregunta;
  savePreguntas();
  sincronizarDetallGrups();
  emitirEstadoCarrera();

  return res.json(preguntas[index]);
});

app.delete('/preguntas/:id', (req, res) => {
  const { id } = req.params;

  if (preguntas.length <= 1) {
    return res.status(400).json({ error: "Hi ha d'haver com a mínim una pregunta al qüestionari." });
  }

  const index = preguntas.findIndex((pregunta) => pregunta.id === id);
  if (index < 0) {
    return res.status(404).json({ error: 'Pregunta no trobada.' });
  }

  preguntas.splice(index, 1);
  savePreguntas();

  if (carreraFinalizada) {
    resetCarrera();
  } else {
    sincronizarDetallGrups();
  }
  emitirEstadoCarrera();

  return res.status(204).send();
});

app.get('/estado', (_req, res) => {
  res.json(getEstadoCarrera());
});

app.post('/responder', (req, res) => {
  const { grupo, indexPregunta, respuesta } = req.body;
  const preguntaIndex = Number(indexPregunta);
  const respuestaIndex = Number(respuesta);

  if (!GRUPOS_VALIDOS.has(grupo)) {
    return res.status(400).json({ error: 'Grup no vàlid.' });
  }

  if (!Number.isInteger(preguntaIndex) || preguntaIndex < 0 || preguntaIndex >= preguntas.length) {
    return res.status(400).json({ error: 'Índex de pregunta no vàlid.' });
  }

  if (!Number.isInteger(respuestaIndex)) {
    return res.status(400).json({ error: 'Resposta no vàlida.' });
  }

  if (carreraFinalizada) {
    return res.json({
      mensaje: 'La cursa ha acabat. Reinicia per tornar a jugar.',
      progreso: progresoGrupos[grupo],
      estado: getEstadoCarrera(),
    });
  }

  const acierto = preguntas[preguntaIndex].correcta === respuestaIndex;

  if (acierto) {
    progresoGrupos[grupo] += 1;
    const siguientePregunta = preguntaIndex + 1 < preguntas.length ? preguntaIndex + 2 : null;
    detallGrups[grupo] = {
      ...detallGrups[grupo],
      preguntaActual: siguientePregunta,
      enunciatActual: getEnunciatByNumero(siguientePregunta),
      ultimaResposta: 'correcte',
      feedbackToken: (detallGrups[grupo]?.feedbackToken || 0) + 1,
    };

    if (progresoGrupos[grupo] >= getPuntosNecesarios()) {
      carreraFinalizada = true;
      io.emit('carreraFinalizada', { ganador: grupo });
    }
  } else {
    progresoGrupos[grupo] = 0;
    detallGrups[grupo] = {
      ...detallGrups[grupo],
      preguntaActual: getPreguntaInicial(),
      enunciatActual: getEnunciatByNumero(getPreguntaInicial()),
      ultimaResposta: 'incorrecte',
      feedbackToken: (detallGrups[grupo]?.feedbackToken || 0) + 1,
    };
  }

  emitirEstadoCarrera();

  return res.json({
    progreso: progresoGrupos[grupo],
    acierto,
    estado: getEstadoCarrera(),
  });
});

app.post('/reiniciar', (_req, res) => {
  resetCarrera();
  emitirEstadoCarrera();
  res.json({ mensaje: 'Cursa reiniciada correctament.' });
});

io.on('connection', (socket) => {
  socket.emit('actualizarCarrera', getEstadoCarrera());

  socket.on('reiniciarCarrera', () => {
    resetCarrera();
    emitirEstadoCarrera();
  });
});

server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.log('Servidor funcionant al port 4000');
});
