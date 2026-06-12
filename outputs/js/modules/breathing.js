/* ════════════════════════════════════════════════════════════
   Box Breathing 4-4-4-4
   Timer driven by requestAnimationFrame (no drift)
   ════════════════════════════════════════════════════════════ */

const BreathingModule = (() => {

  const PHASES = [
    {
      id: 'inhale',
      label: 'INHALÁ',
      sub: 'por la nariz',
      duration: 4,
      instruction: 'Respirá profundo por la nariz. Sentí cómo se expande el vientre.',
      color: '#EF4444',
      ringColor: '#EF4444',
      overlayColor: 'rgba(239,68,68,.06)',
    },
    {
      id: 'hold',
      label: 'RETENÉ',
      sub: 'sin tensión',
      duration: 4,
      instruction: 'Mantené el aire sin tensión. Cuerpo relajado, postura abierta.',
      color: '#3B82F6',
      ringColor: '#3B82F6',
      overlayColor: 'rgba(59,130,246,.06)',
    },
    {
      id: 'exhale',
      label: 'EXHALÁ',
      sub: 'por la boca',
      duration: 4,
      instruction: 'Soltá el aire lento por la boca. Sentí cómo se libera la tensión.',
      color: '#10B981',
      ringColor: '#10B981',
      overlayColor: 'rgba(16,185,129,.06)',
    },
    {
      id: 'pause',
      label: 'PAUSA',
      sub: 'pulmones vacíos',
      duration: 4,
      instruction: 'Pulmones vacíos, sin forzar. Observá el silencio del cuerpo.',
      color: '#F59E0B',
      ringColor: '#F59E0B',
      overlayColor: 'rgba(245,158,11,.06)',
    },
  ];

  const MAX_CYCLES = 5;
  const RING_CIRCUMFERENCE = 2 * Math.PI * 88; // r=88

  let rAF = null;
  let running = false;
  let paused = false;
  let phaseIdx = 0;
  let elapsed = 0;
  let cycleCount = 0;
  let lastTime = null;

  // DOM refs
  let elIdle, elActive, elEnd;
  let elLabel, elCounter, elSub, elInstruction;
  let elOverlay, elRing, elInner;
  let elCycles;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    const card = document.getElementById('mod-box');
    if (!card) return;

    elIdle        = document.getElementById('box-idle');
    elActive      = document.getElementById('box-active');
    elEnd         = document.getElementById('box-end');
    elLabel       = document.getElementById('box-label');
    elCounter     = document.getElementById('box-counter');
    elSub         = document.getElementById('box-sublabel');
    elInstruction = document.getElementById('box-instruction');
    elOverlay     = document.getElementById('box-overlay');
    elRing        = document.getElementById('box-ring');
    elInner       = card.querySelector('.breath-inner');
    elCycles      = document.getElementById('box-cycles');
    btnStart      = document.getElementById('box-start');
    btnPause      = document.getElementById('box-pause');
    btnReset      = document.getElementById('box-reset');
    btnRepeat     = document.getElementById('box-repeat');
    btnDone       = document.getElementById('box-done');

    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  resetSession);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click',   () => {
      elEnd.classList.add('hidden');
      elIdle.classList.remove('hidden');
    });
  }

  function startSession() {
    running    = true;
    paused     = false;
    phaseIdx   = 0;
    elapsed    = 0;
    cycleCount = 0;
    lastTime   = null;

    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    renderCycles();
    applyPhase(PHASES[0]);

    rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;

    if (lastTime === null) lastTime = now;
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    elapsed += delta;

    const phase = PHASES[phaseIdx];
    const remaining = phase.duration - elapsed;
    const progress  = elapsed / phase.duration; // 0→1

    // Update counter (ceiling so it shows 4,3,2,1 not 3,2,1,0)
    const displayNum = Math.max(1, Math.ceil(remaining));
    if (elCounter.textContent !== String(displayNum)) {
      elCounter.textContent = displayNum;
    }

    // Update SVG progress ring
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    elRing.style.strokeDashoffset = offset;

    if (elapsed >= phase.duration) {
      elapsed -= phase.duration;
      phaseIdx = (phaseIdx + 1) % PHASES.length;

      if (phaseIdx === 0) {
        cycleCount++;
        renderCycles();
        if (cycleCount >= MAX_CYCLES) {
          finish();
          return;
        }
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
    elOverlay.style.backgroundColor = phase.overlayColor;
    elRing.style.stroke       = phase.ringColor;
    elInner.style.borderColor = phase.color + '66';
    elRing.style.strokeDashoffset = RING_CIRCUMFERENCE;
  }

  function togglePause() {
    if (paused) {
      paused    = false;
      lastTime  = null;
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
    running  = false;
    paused   = false;
    phaseIdx = 0;
    elapsed  = 0;
    cycleCount = 0;

    elActive.classList.add('hidden');
    elEnd.classList.add('hidden');
    elIdle.classList.remove('hidden');

    elOverlay.style.backgroundColor = '';
    btnPause.textContent = '⏸ Pausar';
  }

  function finish() {
    cancelAnimationFrame(rAF);
    running = false;

    elActive.classList.add('hidden');
    elEnd.classList.remove('hidden');
  }

  function renderCycles() {
    if (!elCycles) return;
    let html = '';
    for (let i = 0; i < MAX_CYCLES; i++) {
      const cls = i < cycleCount ? 'done' : '';
      html += `<span class="cycle-dot ${cls}" aria-hidden="true"></span>`;
    }
    const current = Math.min(cycleCount + 1, MAX_CYCLES);
    html += `<span class="cycle-text">Ciclo ${current} de ${MAX_CYCLES}</span>`;
    elCycles.innerHTML = html;
    elCycles.setAttribute('aria-label', `Ciclo ${current} de ${MAX_CYCLES}`);
  }

  function destroy() {
    cancelAnimationFrame(rAF);
    running = false;
    paused  = false;
  }

  return { init, destroy };
})();
