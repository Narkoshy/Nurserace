import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import './CarreraCaballos.css';

const socket = io(API_URL, { transports: ['websocket', 'polling'] });

function getPreguntaActualFromProgres(progres, punts) {
  if (!Number.isFinite(progres) || !Number.isFinite(punts) || punts < 1) return null;
  if (progres >= punts) return null;
  return Math.min(progres + 1, punts);
}

function getDetallInicial(progreso = { grupo1: 0, grupo2: 0, grupo3: 0 }, punts = 20) {
  return {
    grupo1: { preguntaActual: getPreguntaActualFromProgres(progreso.grupo1 || 0, punts), ultimaResposta: null, feedbackToken: 0 },
    grupo2: { preguntaActual: getPreguntaActualFromProgres(progreso.grupo2 || 0, punts), ultimaResposta: null, feedbackToken: 0 },
    grupo3: { preguntaActual: getPreguntaActualFromProgres(progreso.grupo3 || 0, punts), ultimaResposta: null, feedbackToken: 0 },
  };
}

function normalizeEstado(payload) {
  if (payload && payload.progreso) {
    const punts = payload.puntosNecesarios || 20;
    const teDetallServidor = Boolean(payload.detallGrups && typeof payload.detallGrups === 'object');
    return {
      progreso: payload.progreso,
      detallGrups: teDetallServidor ? payload.detallGrups : getDetallInicial(payload.progreso, punts),
      teDetallServidor,
      puntosNecesarios: punts,
      carreraFinalizada: Boolean(payload.carreraFinalizada),
    };
  }

  const progresBase = payload || { grupo1: 0, grupo2: 0, grupo3: 0 };
  return {
    progreso: progresBase,
    detallGrups: getDetallInicial(progresBase, 20),
    teDetallServidor: false,
    puntosNecesarios: 20,
    carreraFinalizada: false,
  };
}

const grupoLabel = {
  grupo1: 'Grup 1',
  grupo2: 'Grup 2',
  grupo3: 'Grup 3',
};

function useSfx() {
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);

  const ensure = useCallback(async () => {
    if (!ctxRef.current) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return false;
      ctxRef.current = new AudioContextCtor();
      const master = ctxRef.current.createGain();
      master.gain.value = enabledRef.current ? 0.6 : 0.0;
      master.connect(ctxRef.current.destination);
      masterGainRef.current = master;
    }
    if (ctxRef.current.state === 'suspended') {
      try {
        await ctxRef.current.resume();
      } catch (_err) {
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = enabled ? 0.6 : 0.0;
    }
  }, [enabled]);

  const playBeep = useCallback(async (freq, ms, type = 'sine') => {
    if (!enabledRef.current) return;
    const ready = await ensure();
    if (!ready || !ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(masterGainRef.current);
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    o.start(t0);
    o.stop(t0 + ms / 1000 + 0.02);
  }, [ensure]);

  const playWhoosh = useCallback(async () => {
    if (!enabledRef.current) return;
    const ready = await ensure();
    if (!ready || !ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    const t0 = ctx.currentTime;
    o.frequency.setValueAtTime(220, t0);
    o.frequency.exponentialRampToValueAtTime(980, t0 + 0.12);
    o.frequency.exponentialRampToValueAtTime(180, t0 + 0.28);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    o.connect(g);
    g.connect(masterGainRef.current);
    o.start(t0);
    o.stop(t0 + 0.33);
  }, [ensure]);

  const playCheer = useCallback(async () => {
    if (!enabledRef.current) return;
    const ready = await ensure();
    if (!ready || !ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    const t0 = ctx.currentTime;
    o.frequency.setValueAtTime(320, t0);
    o.frequency.exponentialRampToValueAtTime(520, t0 + 0.18);
    o.frequency.exponentialRampToValueAtTime(260, t0 + 0.6);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    o.connect(g);
    g.connect(masterGainRef.current);
    o.start(t0);
    o.stop(t0 + 0.75);
  }, [ensure]);

  return useMemo(() => ({
    enabled,
    setEnabled,
    unlock: ensure,
    playBeep,
    playWhoosh,
    playCheer,
  }), [enabled, ensure, playBeep, playWhoosh, playCheer]);
}

const CarreraCaballos = () => {
  const navigate = useNavigate();
  const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
  const [detallGrups, setDetallGrups] = useState(getDetallInicial());
  const [ganador, setGanador] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const [puntosNecesarios, setPuntosNecesarios] = useState(20);
  const [phase, setPhase] = useState('idle'); // idle | countdown | running | finished
  const [countdown, setCountdown] = useState(3);
  const [burst, setBurst] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const sfx = useSfx();
  const progresoPrevRef = useRef(progreso);
  const inferDetallFromProgres = useCallback((nouProgres, punts, prevProgres, prevDetall) => {
    const next = { ...prevDetall };

    for (const grup of Object.keys(nouProgres)) {
      const actual = nouProgres[grup] || 0;
      const anterior = prevProgres[grup] || 0;
      const prevDetail = prevDetall[grup] || { preguntaActual: 1, ultimaResposta: null, feedbackToken: 0 };
      let ultimaResposta = prevDetail.ultimaResposta;
      let feedbackToken = prevDetail.feedbackToken || 0;

      if (actual > anterior) {
        ultimaResposta = 'correcte';
        feedbackToken += 1;
      } else if (actual < anterior) {
        ultimaResposta = 'incorrecte';
        feedbackToken += 1;
      }

      next[grup] = {
        preguntaActual: getPreguntaActualFromProgres(actual, punts),
        ultimaResposta,
        feedbackToken,
      };
    }

    return next;
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    setReducedMotion(Boolean(prefersReduced));
  }, []);

  useEffect(() => {
    const loadEstadoInicial = async () => {
      try {
        const response = await axios.get(`${API_URL}/estado`);
        const estado = normalizeEstado(response.data);
        setProgreso(estado.progreso);
        if (estado.teDetallServidor) {
          setDetallGrups(estado.detallGrups);
        } else {
          setDetallGrups(getDetallInicial(estado.progreso, estado.puntosNecesarios));
        }
        setPuntosNecesarios(estado.puntosNecesarios);
      } catch (_err) {
        // fallback a valores por defecto
      }
    };

    loadEstadoInicial();

    socket.on('actualizarCarrera', (payload) => {
      const estado = normalizeEstado(payload);
      const prev = progresoPrevRef.current || { grupo1: 0, grupo2: 0, grupo3: 0 };
      setProgreso(estado.progreso);
      if (estado.teDetallServidor) {
        setDetallGrups(estado.detallGrups);
      } else {
        setDetallGrups((prevDetall) =>
          inferDetallFromProgres(estado.progreso, estado.puntosNecesarios, prev, prevDetall)
        );
      }
      setPuntosNecesarios(estado.puntosNecesarios);

      Object.entries(estado.progreso).forEach(([grupo, avance]) => {
        if (avance > (prev[grupo] || 0)) {
          setBurst((b) => ({ ...b, [grupo]: (b[grupo] || 0) + 1 }));
          if (!reducedMotion) sfx.playWhoosh();
        }
        if (avance >= estado.puntosNecesarios) {
          setGanador(grupo);
          setEnMarcha(false);
          setPhase('finished');
          sfx.playCheer();
        }
      });

      progresoPrevRef.current = estado.progreso;
    });

    return () => {
      socket.off('actualizarCarrera');
    };
  }, [inferDetallFromProgres, reducedMotion, sfx]);

  useEffect(() => {
    let intervalo;
    if (enMarcha) {
      intervalo = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [enMarcha]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    let cancelled = false;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const fireAndForget = (promise) => {
      Promise.resolve(promise).catch(() => {});
    };

    const run = async () => {
      setCountdown(3);
      fireAndForget(sfx.unlock());
      fireAndForget(sfx.playBeep(640, 90, 'square'));
      await wait(450);
      if (cancelled) return;
      setCountdown(2);
      fireAndForget(sfx.playBeep(720, 90, 'square'));
      await wait(450);
      if (cancelled) return;
      setCountdown(1);
      fireAndForget(sfx.playBeep(820, 90, 'square'));
      await wait(450);
      if (cancelled) return;
      setCountdown(0);
      fireAndForget(sfx.playBeep(980, 140, 'sine'));
      setPhase('running');
      setEnMarcha(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [phase, sfx]);

  const iniciarCarrera = async () => {
    setTiempo(0);
    setGanador(null);
    setEnMarcha(false);
    setPhase('countdown');
  };

  const reiniciarCarrera = async () => {
    try {
      await axios.post(`${API_URL}/reiniciar`);
      setProgreso({ grupo1: 0, grupo2: 0, grupo3: 0 });
      setDetallGrups(getDetallInicial({ grupo1: 0, grupo2: 0, grupo3: 0 }, puntosNecesarios));
      setTiempo(0);
      setGanador(null);
      setEnMarcha(false);
      setPhase('idle');
    } catch (_err) {
      // sin cambios de estado si falla
    }
  };

  const leader = useMemo(() => {
    const entries = Object.entries(progreso);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || null;
  }, [progreso]);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch (_err) {
      // ignore
    }
  };

  return (
    <main className={`tv-shell ${phase === 'running' ? 'is-running' : ''} ${reducedMotion ? 'reduced' : ''}`}>
      <section className="tv-frame">
        <header className="tv-topbar">
          <div className="tv-live">
            <span className="tv-dot" />
            DIRECTE
          </div>
          <div className="tv-title">
            <strong>Cursa de Camells</strong>
            <span>Objectiu: {puntosNecesarios} encerts</span>
          </div>
          <div className="tv-controls">
            <button className="tv-chip" onClick={() => navigate('/dashboard')}>Tornar a l'inici</button>
            <button className="tv-chip" onClick={() => setReducedMotion((v) => !v)}>
              {reducedMotion ? 'Moviment: desactivat' : 'Moviment: activat'}
            </button>
            <button className="tv-chip" onClick={() => sfx.setEnabled((v) => !v)}>
              {sfx.enabled ? 'So: activat' : 'So: desactivat'}
            </button>
            <button className="tv-chip" onClick={requestFullscreen}>Pantalla completa</button>
          </div>
        </header>

        <div className="tv-stage">
          <div className="tv-parallax" aria-hidden="true">
            <div className="layer layer-sky" />
            <div className="layer layer-stands" />
            <div className="layer layer-sand" />
          </div>

          <div className="tv-scoreboard">
            <div>
              <span className="k">Temps</span>
              <span className="v">{tiempo}s</span>
            </div>
            <div>
              <span className="k">Líder</span>
              <span className="v">{leader ? grupoLabel[leader] : '-'}</span>
            </div>
            <div>
              <span className="k">Estat</span>
              <span className="v">
                {phase === 'idle' ? 'Preparats' : phase === 'countdown' ? 'Sortida' : phase === 'running' ? 'En curs' : 'Final'}
              </span>
            </div>
          </div>

          {phase !== 'running' && !ganador ? (
            <div className="tv-center">
              <button className="tv-primary" onClick={iniciarCarrera}>
                Iniciar cursa
              </button>
              <p className="tv-hint">Activa el so amb el primer clic (requisit del navegador).</p>
            </div>
          ) : null}

          {phase === 'countdown' ? (
            <div className="tv-countdown" aria-live="polite">
              <div className="tv-countdown-card">
                <p>Sortida</p>
                <h2>{countdown === 0 ? 'GO' : countdown}</h2>
              </div>
            </div>
          ) : null}

          <div className="tv-lanes">
            {Object.entries(progreso).map(([grupo, avance]) => {
              const percent = Math.min(100, (avance / puntosNecesarios) * 100);
              const label = grupo === 'grupo1' ? 'Grup 1' : grupo === 'grupo2' ? 'Grup 2' : 'Grup 3';
              const isLeader = leader === grupo && phase !== 'finished';
              const laneBurst = burst[grupo] || 0;
              const detail = detallGrups[grupo] || { preguntaActual: 1, ultimaResposta: null, feedbackToken: 0 };

              return (
                <article className={`tv-lane ${isLeader ? 'is-leader' : ''}`} key={grupo}>
                  <div className="tv-lane-head">
                    <div className="lhs">
                      <h2>
                        {label}
                        <span className="tv-question-chip">
                          Pregunta {detail.preguntaActual ?? '-'}
                        </span>
                      </h2>
                      <p>{avance}/{puntosNecesarios}</p>
                    </div>
                    <div className="rhs">
                      {detail.ultimaResposta ? (
                        <span
                          key={`${grupo}-${detail.feedbackToken}`}
                          className={`tv-result ${detail.ultimaResposta}`}
                        >
                          {detail.ultimaResposta === 'correcte' ? 'Correcte' : 'Incorrecte'}
                        </span>
                      ) : null}
                      {isLeader ? <span className="badge">LÍDER</span> : null}
                    </div>
                  </div>

                  <div className="tv-track">
                    <div className="tv-track-meter" style={{ width: `${percent}%` }} />
                    <div className="tv-finish" aria-hidden="true" />

                    <div className="tv-camel" style={{ left: `${percent}%` }}>
                      <img
                        className={`tv-camel-image ${phase === 'running' ? 'is-running' : ''}`}
                        src="/caballo.png"
                        alt="Camell"
                      />
                      <span key={laneBurst} className={`tv-dust ${phase === 'running' ? 'go' : ''}`} aria-hidden="true" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {ganador ? (
            <div className="tv-lowerthird">
              <div className="lt-main">
                <span className="lt-tag">ARRIBADA</span>
                <strong>Guanya {grupoLabel[ganador] || ganador}</strong>
                <span className="lt-sub">Temps oficial: {tiempo}s</span>
              </div>
              <button className="tv-reset" onClick={reiniciarCarrera}>Reiniciar</button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default CarreraCaballos;
