/* ════════════════════════════════════════════════════════════
   Breathing module — 3 variantes: 4-4-4-4 / 4-7-8 / Suspiro
   Timer por requestAnimationFrame (sin drift)
   ════════════════════════════════════════════════════════════ */

const BreathingModule = (() => {

  /* ── Variants ─────────────────────────────────────────────── */
  const VARIANTS = {
    box: {
      idleDesc: '5 ciclos de 4-4-4-4 · 90 segundos',
      maxCycles: 5,
      phases: [
        { id: 'inhale',  label: 'INHALÁ', sub: 'por la nariz', duration: 4, instruction: 'Respirá profundo por la nariz. Sentí cómo se expande el vientre.',         color: '#C47B5A', expand: true  },
        { id: 'hold',    label: 'RETENÉ', sub: 'sin tensión',  duration: 4, instruction: 'Mantené el aire sin tensión. Cuerpo relajado, postura abierta.',            color: '#8CB8C6', expand: null  },
        { id: 'exhale',  label: 'EXHALÁ', sub: 'por la boca',  duration: 4, instruction: 'Soltá el aire lento por la boca. Sentí cómo se libera la tensión.',        color: '#7A9E7E', expand: false },
        { id: 'pause',   label: 'PAUSA',  sub: 'vacíos',       duration: 4, instruction: 'Pulmones vacíos, sin forzar. Observá el silencio.',                        color: '#C8A882', expand: null  },
      ],
    },
    '478': {
      idleDesc: '4 ciclos de 4-7-8 · Ideal para antes de dormir',
      maxCycles: 4,
      phases: [
        { id: 'inhale', label: 'INHALÁ', sub: 'por la nariz', duration: 4, instruction: 'Inhalá suave por la nariz durante 4 segundos.',                            color: '#C47B5A', expand: true  },
        { id: 'hold',   label: 'RETENÉ', sub: 'retené',       duration: 7, instruction: 'Aguantá el aire durante 7 segundos. El corazón empieza a ralentizarse.',   color: '#8CB8C6', expand: null  },
        { id: 'exhale', label: 'EXHALÁ', sub: 'por la boca',  duration: 8, instruction: 'Soltá todo el aire por la boca durante 8 segundos. Esta es la clave.',     color: '#7A9E7E', expand: false },
      ],
    },
    sigh: {
      idleDesc: '3 suspiros · 30 segundos · Para el pánico inmediato',
      maxCycles: 3,
      phases: [
        { id: 'inhale',  label: 'INHALÁ',   sub: 'nariz, profundo',  duration: 3, instruction: 'Inhalá profundo por la nariz, llenando el pecho.',                color: '#C47B5A', expand: true  },
        { id: 'inhale2', label: 'INHALÁ +', sub: 'un poco más',      duration: 1, instruction: 'Un segundo soplo corto. Llenate un poco más todavía.',             color: '#C47B5A', expand: true  },
        { id: 'exhale',  label: 'EXHALÁ',   sub: 'largo, por boca',  duration: 6, instruction: 'Soltá TODO el aire por la boca, lento y largo.',                  color: '#7A9E7E', expand: false },
      ],
    },
  };

  /* ── State ────────────────────────────────────────────────── */
  let currentMode  = 'box';
  let PHASES       = VARIANTS.box.phases;
  let MAX_CYCLES   = VARIANTS.box.maxCycles;

  let rAF          = null;
  let running      = false;
  let paused       = false;
  let phaseIdx     = 0;
  let elapsed      = 0;
  let cycleCount   = 0;
  let lastTime     = null;
  let previewDone  = false;

  /* ── DOM refs ─────────────────────────────────────────────── */
  let elIdle, elActive, elEnd;
  let elLabel, elCounter, elSub, elInstruction;
  let elOverlay, elRingOuter;
  let elCycles, elIdleDesc;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    const card = document.getElementById('mod-box');
    if (!card) return;

    elIdle       = document.getElementById('box-idle');
    elActive     = document.getElementById('box-active');
    elEnd        = document.getElementById('box-end');
    elLabel      = document.getElementById('box-label');
    elCounter    = document.getElementById('box-counter');
    elSub        = document.getElementById('box-sublabel');
    elInstruction= document.getElementById('box-instruction');
    elOverlay    = document.getElementById('box-overlay');
    elRingOuter  = document.getElementById('box-ring-outer');
    elCycles     = document.getElementById('box-cycles');
    elIdleDesc   = document.getElementById('box-idle-desc');
    btnStart     = document.getElementById('box-start');
    btnPause     = document.getElementById('box-pause');
    btnReset     = document.getElementById('box-reset');
    btnRepeat    = document.getElementById('box-repeat');
    btnDone      = document.getElementById('box-done');

    // Reset to default mode
    currentMode = 'box';
    PHASES      = VARIANTS.box.phases;
    MAX_CYCLES  = VARIANTS.box.maxCycles;

    // Tab wiring
    card.querySelectorAll('.breath-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        if (running) return;
        card.querySelectorAll('.breath-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        switchVariant(btn.dataset.mode);
      });
    });

    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  resetSession);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click',   () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function switchVariant(mode) {
    const v = VARIANTS[mode];
    if (!v) return;
    currentMode = mode;
    PHASES      = v.phases;
    MAX_CYCLES  = v.maxCycles;
    if (elIdleDesc) elIdleDesc.textContent = v.idleDesc;
  }

  /* ── Session ──────────────────────────────────────────────── */
  function startSession() {
    running    = true;
    paused     = false;
    phaseIdx   = 0;
    elapsed    = 0;
    cycleCount = 0;
    lastTime   = null;
    previewDone= false;

    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    // Reset ring to contracted state
    if (elRingOuter) {
      elRingOuter.style.transition = 'none';
      elRingOuter.classList.remove('expand');
    }
    if (elOverlay) { elOverlay.classList.remove('active'); elOverlay.style.backgroundColor = ''; }

    renderCycles();
    applyPhase(PHASES[0]);
    rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;

    const delta    = (now - lastTime) / 1000;
    lastTime       = now;
    elapsed       += delta;

    const phase    = PHASES[phaseIdx];
    const remaining= phase.duration - elapsed;

    // Update countdown (ceiling: shows 4,3,2,1 not 3,2,1,0)
    const displayNum = Math.max(1, Math.ceil(remaining));
    if (elCounter.textContent !== String(displayNum)) elCounter.textContent = displayNum;

    // Anticipate next phase color 200ms before transition
    if (remaining <= 0.2 && !previewDone) {
      previewDone = true;
      const nextIdx = (phaseIdx + 1) % PHASES.length;
      triggerOverlay(PHASES[nextIdx].color);
    }

    if (elapsed >= phase.duration) {
      elapsed -= phase.duration;
      previewDone = false;
      phaseIdx = (phaseIdx + 1) % PHASES.length;

      if (phaseIdx === 0) {
        cycleCount++;
        renderCycles();
        if (cycleCount >= MAX_CYCLES) { finish(); return; }
      }

      applyPhase(PHASES[phaseIdx]);
    }

    rAF = requestAnimationFrame(tick);
  }

  function applyPhase(phase) {
    elLabel.textContent       = phase.label;
    elSub.textContent         = phase.sub;
    elInstruction.textContent = phase.instruction;
    elCounter.textContent     = phase.duration;

    triggerOverlay(phase.color);

    // Update ring color
    if (elRingOuter) elRingOuter.style.borderColor = phase.color;

    // Scale animation
    if (elRingOuter && phase.expand !== null) {
      elRingOuter.style.setProperty('--breath-dur', `${phase.duration}s`);
      elRingOuter.style.transition = `transform cubic-bezier(0.4, 0, 0.6, 1) var(--breath-dur, ${phase.duration}s), border-color .5s ease`;
      requestAnimationFrame(() => {
        if (phase.expand === true)  elRingOuter.classList.add('expand');
        if (phase.expand === false) elRingOuter.classList.remove('expand');
      });
    }
  }

  function triggerOverlay(color) {
    if (!elOverlay) return;
    elOverlay.style.backgroundColor = color;
    elOverlay.classList.add('active');
  }

  /* ── Controls ─────────────────────────────────────────────── */
  function togglePause() {
    if (paused) {
      paused   = false;
      lastTime = null;
      btnPause.textContent = '⏸ Pausar';
      rAF = requestAnimationFrame(tick);
    } else {
      paused = true;
      cancelAnimationFrame(rAF);
      btnPause.textContent = '▶ Continuar';
    }
  }

  function resetSession() {
    cancelAnimationFrame(rAF);
    running    = false;
    paused     = false;
    phaseIdx   = 0;
    elapsed    = 0;
    cycleCount = 0;

    if (elRingOuter) { elRingOuter.style.transition = 'none'; elRingOuter.classList.remove('expand'); elRingOuter.style.borderColor = ''; }
    if (elOverlay)   { elOverlay.classList.remove('active'); elOverlay.style.backgroundColor = ''; }

    elActive.classList.add('hidden');
    elEnd.classList.add('hidden');
    elIdle.classList.remove('hidden');
    btnPause.textContent = '⏸ Pausar';
  }

  function finish() {
    cancelAnimationFrame(rAF);
    running = false;
    if (elOverlay) { elOverlay.classList.remove('active'); }
    elActive.classList.add('hidden');
    elEnd.classList.remove('hidden');
  }

  function renderCycles() {
    if (!elCycles) return;
    let html = '';
    for (let i = 0; i < MAX_CYCLES; i++) {
      html += `<span class="cycle-dot${i < cycleCount ? ' done' : ''}" aria-hidden="true"></span>`;
    }
    const current = Math.min(cycleCount + 1, MAX_CYCLES);
    html += `<span class="cycle-text">Ciclo ${current} de ${MAX_CYCLES}</span>`;
    elCycles.innerHTML = html;
    elCycles.setAttribute('aria-label', `Ciclo ${current} de ${MAX_CYCLES}`);
  }

  /* ── Destroy ──────────────────────────────────────────────── */
  function destroy() {
    cancelAnimationFrame(rAF);
    running = false;
    paused  = false;
  }

  return { init, destroy };
})();
