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
    },
 { 
        pregunta: "A quina temperatura s’han de mantenir les vacunes a la nevera?", 
        opciones: ["entre 3ºC - 8 ºC", "no importa la temperatura", "entre 2ºC - 8ºC", "entre 2ºC – 10ºC"], 
        correcta: 2 
    },
    { 
        pregunta: "Quants tipus de vacuna hi ha?", 
        opciones: ["vacunes microorganismes sencers, de subunitats, d’ADN", "vacunes microorganismes sencers, de subunitats, d’ADN i toxoide", "vacunes vives-mortes, vives-bacterianes", "vacunes atenuades-inactivades, víriques i bacterianes"], 
        correcta: 1 
    },
    { 
        pregunta: "Acut a la consulta pacient de 90 anys per vacunar-se de la vacuna de la grip. Actualment, només tenim al centre la vacuna de la grip adjuvada. Veient el seu historial vacunal, fa una setmana que la infermera d’atdom, li ha administrat la primera dosi de vacuna HZ. Què hem de fer?", 
        opciones: ["Reprogramem visita a les 3 setmanes, per administrar-la conjuntament amb HZ", "Es pot administrar la vacuna de la grip", "Si administrem la vacuna de la grip, la vacuna HZ perd eficàcia", "Reprogramem visita en dos dies que arriben les vacunes de la grip no adjuvada"], 
        correcta: 1 
    },
    { 
        pregunta: "Quan s’inicia la campanya de vacunació gripal?", 
        opciones: ["Setembre", "Sempre podem vacunar de la grip", "Octubre", "Novembre"], 
        correcta: 2 
    },
    { 
        pregunta: "Pacient de 18 anys que li van administrar 1era dosi de vacuna de la varicel·la el 19/10/2024 i el 14/11/2024 per error li van administrar una dosi de vacuna shingrix. Davant aquest error, quina pauta s’ha de seguir?", 
        opciones: ["Iniciar nova pauta de varicel·la, ja que no es comptabiltza com administrada", "Administrar 1 dosi de varicel·la, per completar pauta", "Administrar 1 dosi de varicel·la i 1 dosi de shingrix per completar pauta", "Demanar analítica per valorar anticossos de la varicel·la, per si fa falta completar pauta de varicel·la, ja que recorda haver patit la malaltia."], 
        correcta: 1 
    },
    { 
        pregunta: "Assenyala la resposta incorrecta respecte al virus de l’hepatitis B (VHB)", 
        opciones: ["VHB pot sobreviure fora de l'organisme almenys 7 dies i pot causar infecció si penetra en un altre organisme en aquest període", "L'hepatitis B és prevenible amb la vacuna actualment disponible", "El VHB es transmet pels aliments o aigües contaminades", "La infecció crònica pel virus de l'hepatitis B pot tractar-se amb medicaments, en particular amb agents antivirals orals"], 
        correcta: 2 
    },
    { 
        pregunta: "Quina és la via d’administració més utilitzada per administrar les vacunes?", 
        opciones: ["SC", "intradèrmica", "oral", "IM"], 
        correcta: 3 
    },
    { 
        pregunta: "A quin any es va instaurar el primer calendari sistemàtic a Espanya?", 
        opciones: ["1981", "1968", "1975", "1970"], 
        correcta: 2 
    },
    { 
        pregunta: "En una escola bressol han detectat un cas de xarampió. Acut a la consulta un nen de 9 mesos per ser vacunat segons indicació de Salut pública, que fem?", 
        opciones: ["No podem administrar, doncs seguint calendari, la vacuna de la TV s’administra als 12 mesos", "Li administrem la vacuna TV, i caldrà seguir pauta segons calendari", "Li administrem la vacuna TV, avançant la dels 12 mesos, i aquesta queda registrada com a primera dosi.", "Abans d’administrar, pregunto a la referent de vacunes del centre"], 
        correcta: 1 
    },
    { 
        pregunta: "Quan es va iniciar la vacunació del COVID a Espanya?", 
        opciones: ["Febrer 2021", "Setembre 2021", "Desembre 2019", "Desembre 2020"], 
        correcta: 3 
    },
    { 
        pregunta: "Acut adolescent de 17 anys, sense factors de risc, per administrar la vacuna VPH9.", 
        opciones: ["Li administrem 1 dosis, la té finançada", "Administrem 1 dosis, no la té finançada", "Administrem 2 dosis, les té finançades (0-5 mesos)", "Administrem 3 dosis, les té finançades (0-2-6 mesos)"], 
        correcta: 0 
    },
    { 
        pregunta: "La sèrie d'elements i activitats necessàries per a garantir la potència immunitzadora de les vacunes des de la seva fabricació fins a l'administració d'aquestes a la població, es defineix com:", 
        opciones: ["Cadena del fred", "Cadena de transport", "Transport actiu", "Conservació positiva"], 
        correcta: 0 
    },
    { 
        pregunta: "Quines dues vacunes no es poden posar juntes?", 
        opciones: ["Varicel·la i triple vírica", "Varicel·la i febre groga", "Triple vírica i febre groga", "Totes es poden administrar conjuntament"], 
        correcta: 2 
    },
 { 
        pregunta: "Nen de 19 anys que acut a consulta per seguir calendari accelerat de vacunacions. No ha passat la varicel·la. Segons nota infermera avui cal administrar VVZ i TV. Revisant calendari, fa 15 dies li van administrar VPH9 + TV i també té pendent administrar meningitis i HA. Quines vacunes cal administrar?", 
        opciones: [
            "Administrem TV + VVZ, segons nota infermera", 
            "Administrem VPH9 + MACWY", 
            "Administrem HA + MACWY", 
            "Reprogramem visita amb la seva infermera"
        ], 
        correcta: 2 
    },
    { 
        pregunta: "Acut pacient de 36 anys per realització de PAPPS. Al preguntar sobre riscs d’ITS, comenta que manté relacions amb homes. Expliquem vacunació del papil·loma i accepta administració de la vacuna.", 
        opciones: [
            "Administrem una dosi, ja que la té finançada", 
            "Administrem 3 dosis amb pauta: 0-6-12 mesos, ja que la té finançada", 
            "Administrem 2 dosis amb pauta 0-6, ja que la té finançada", 
            "No administrem, ja que no està finançada per l’edat que té. Li recomanem que la compri. Pauta a seguir: 3 dosis 0-1-6 mesos"
        ], 
        correcta: 2 
    },
    { 
        pregunta: "Acut a la consulta adolescent de 16 anys, doncs a la seva escola hi ha un brot de tos ferina. Revisem calendari història clínica i veiem que li falta la Td dels 14 anys. La seva mare ens diu que fa un any que va patir la tosferina. Què fem?", 
        opciones: [
            "Vacunem 1 dosi de Td, per seguir calendari.", 
            "No administrem cap vacuna, ja que ha patit la tos ferina.", 
            "Vacunem 1 dosi de Dtpa", 
            "Vacunem 1 dosi de Td i recitem per administrar una dosi de VPH9."
        ], 
        correcta: 2 
    },
    { 
        pregunta: "Respecte la vacuna antipneumocòcia, és cert que?", 
        opciones: [
            "Interval entre Pn23 i Pn20 és de 6m", 
            "Interval entre Pn13 i Pn20 és de 12m", 
            "Interval entre Pn20 i Pn23 és de 6 m", 
            "Interval entre Pn23 i Pn20 és de 12m"
        ], 
        correcta: 3 
    },
    { 
        pregunta: "Acut a la consulta una mare de 50 anys explicant que a l’escola del seu fill hi ha un brot de xarampió. Què fem?", 
        opciones: [
            "Administrem 1 dosi de TV i citem al mes per administrar la 2º dosi.", 
            "Demanem analítica per mirar anticossos", 
            "No farem res, ja que per edat segur que ha passat la malaltia", 
            "Administrem 1 dosi de TV"
        ], 
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

	socket.on('reiniciarCarrera', () => {
        console.log("🔄 Reiniciando carrera desde el cliente...");
        progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
        carreraFinalizada = false;
        io.emit('actualizarCarrera', progresoGrupos);
    });

    socket.on('disconnect', () => console.log('🔴 Cliente desconectado'));
});

// 🔹 Iniciar servidor
server.listen(4000, () => console.log('🚀 Servidor funcionando en el puerto 4000'));
