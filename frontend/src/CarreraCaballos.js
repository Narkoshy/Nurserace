import { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from './config';
import './CarreraCaballos.css';

const socket = io(API_URL, { transports: ['websocket', 'polling'] });

function normalizeEstado(payload) {
  if (payload && payload.progreso) {
    return {
      progreso: payload.progreso,
      puntosNecesarios: payload.puntosNecesarios || 20,
      carreraFinalizada: Boolean(payload.carreraFinalizada),
    };
  }

  return {
    progreso: payload || { grupo1: 0, grupo2: 0, grupo3: 0 },
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

  const ensure = async () => {
    if (!ctxRef.current) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioContextCtor();
      const master = ctxRef.current.createGain();
      master.gain.value = enabled ? 0.6 : 0.0;
      master.connect(ctxRef.current.destination);
      masterGainRef.current = master;
    }
    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume();
    }
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = enabled ? 0.6 : 0.0;
    }
  }, [enabled]);

  const playBeep = async (freq, ms, type = 'sine') => {
    if (!enabled) return;
    await ensure();
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
  };

  const playWhoosh = async () => {
    if (!enabled) return;
    await ensure();
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
  };

  const playCheer = async () => {
    if (!enabled) return;
    await ensure();
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
  };

  return {
    enabled,
    setEnabled,
    unlock: ensure,
    playBeep,
    playWhoosh,
    playCheer,
  };
}

function Camel({ tint = '#f59e0b', running }) {
  return (
    <svg className={`camel ${running ? 'is-running' : ''}`} viewBox="0 0 160 100" role="img" aria-label="camell">
      <g fill={tint}>
        <path d="M20 70c2-12 10-20 24-20 8 0 12 2 18 6 6-10 14-16 26-16 10 0 18 4 24 12 5-2 10-3 16-3 15 0 25 9 25 22 0 10-6 18-15 21-6 2-12 2-19 2H50c-8 0-14-1-20-4-8-4-12-12-10-20z" opacity="0.96" />
        <path d="M62 36c5-10 12-15 21-15 10 0 18 6 22 18-9-4-16-5-23-2-7 3-12 8-15 14-2-6-4-11-5-15z" opacity="0.9" />
        <path d="M112 40c8-8 15-10 22-7 5 2 8 6 9 12-7-4-13-4-19-1-6 3-10 7-12 13-1-6-1-11 0-17z" opacity="0.85" />
      </g>
      <g className="camel-legs" stroke="#111827" strokeWidth="6" strokeLinecap="round">
        <path d="M55 78v16" />
        <path d="M72 78v16" />
        <path d="M104 78v16" />
        <path d="M121 78v16" />
      </g>
      <g>
        <circle cx="42" cy="64" r="5" fill="#0b1220" opacity="0.7" />
      </g>
    </svg>
  );
}

const CarreraCaballos = () => {
  const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
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
  }, [reducedMotion, sfx]);

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

    const run = async () => {
      setCountdown(3);
      await sfx.unlock();
      await sfx.playBeep(640, 90, 'square');
      await new Promise((r) => setTimeout(r, 450));
      if (cancelled) return;
      setCountdown(2);
      await sfx.playBeep(720, 90, 'square');
      await new Promise((r) => setTimeout(r, 450));
      if (cancelled) return;
      setCountdown(1);
      await sfx.playBeep(820, 90, 'square');
      await new Promise((r) => setTimeout(r, 450));
      if (cancelled) return;
      setCountdown(0);
      await sfx.playBeep(980, 140, 'sine');
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
              const tint = grupo === 'grupo1' ? '#06b6d4' : grupo === 'grupo2' ? '#22c55e' : '#f59e0b';
              const laneBurst = burst[grupo] || 0;

              return (
                <article className={`tv-lane ${isLeader ? 'is-leader' : ''}`} key={grupo}>
                  <div className="tv-lane-head">
                    <div className="lhs">
                      <h2>{label}</h2>
                      <p>{avance}/{puntosNecesarios}</p>
                    </div>
                    <div className="rhs">
                      {isLeader ? <span className="badge">LÍDER</span> : null}
                    </div>
                  </div>

                  <div className="tv-track">
                    <div className="tv-track-meter" style={{ width: `${percent}%` }} />
                    <div className="tv-finish" aria-hidden="true" />

                    <div className="tv-camel" style={{ left: `${percent}%` }}>
                      <Camel tint={tint} running={phase === 'running'} />
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
