/* ════════════════════════════════════════════════════════════
   Power Pose — 3 phases, ~2 min total
   ════════════════════════════════════════════════════════════ */

const PowerPoseModule = (() => {

  const PHASES = [
    {
      label: 'PARATE',
      desc:  'Levantate. Separà los pies a la altura de los hombros. Peso distribuido en ambos pies.',
      duration: 15,
    },
    {
      label: 'EXPANDITE',
      desc:  'Pecho abierto, hombros hacia atrás y abajo. Cabeza erguida, mentón levemente arriba.',
      duration: 15,
    },
    {
      label: 'SOSTENÉ',
      desc:  'Manos en caderas. Aguantá exactamente así. Tu cerebro está recibiendo la señal.',
      duration: 90,
    },
  ];

  let rAF = null, running = false, paused = false;
  let phaseIdx = 0, elapsed = 0, lastTime = null;

  let elIdle, elActive, elEnd;
  let elPhaseNum, elPhaseLabel, elPhaseDesc, elCount;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-pose')) return;

    elIdle      = document.getElementById('pose-idle');
    elActive    = document.getElementById('pose-active');
    elEnd       = document.getElementById('pose-end');
    elPhaseNum  = document.getElementById('pose-phase-num');
    elPhaseLabel= document.getElementById('pose-phase-label');
    elPhaseDesc = document.getElementById('pose-phase-desc');
    elCount     = document.getElementById('pose-count');
    btnStart    = document.getElementById('pose-start');
    btnPause    = document.getElementById('pose-pause');
    btnReset    = document.getElementById('pose-reset');
    btnRepeat   = document.getElementById('pose-repeat');
    btnDone     = document.getElementById('pose-done');

    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false;
    phaseIdx = 0; elapsed = 0; lastTime = null;
    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');
    applyPhase(PHASES[0]);
    rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000;
    lastTime = now;

    const phase     = PHASES[phaseIdx];
    const remaining = Math.max(0, phase.duration - elapsed);
    elCount.textContent = Math.ceil(remaining);

    if (elapsed >= phase.duration) {
      elapsed -= phase.duration;
      phaseIdx++;
      if (phaseIdx >= PHASES.length) { finish(); return; }
      applyPhase(PHASES[phaseIdx]);
    }

    rAF = requestAnimationFrame(tick);
  }

  function applyPhase(phase) {
    elPhaseNum.textContent   = `${phaseIdx + 1} / ${PHASES.length}`;
    elPhaseLabel.textContent = phase.label;
    elPhaseDesc.textContent  = phase.desc;
    elCount.textContent      = phase.duration;
  }

  function togglePause() {
    if (paused) {
      paused = false; lastTime = null;
      btnPause.textContent = '⏸ Pausar';
      rAF = requestAnimationFrame(tick);
    } else {
      paused = true;
      cancelAnimationFrame(rAF);
      btnPause.textContent = '▶ Continuar';
    }
  }

  function reset() {
    cancelAnimationFrame(rAF);
    running = false; paused = false; phaseIdx = 0; elapsed = 0;
    elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden');
    btnPause.textContent = '⏸ Pausar';
  }

  function finish() {
    cancelAnimationFrame(rAF); running = false;
    elActive.classList.add('hidden'); elEnd.classList.remove('hidden');
  }

  function destroy() { cancelAnimationFrame(rAF); running = false; paused = false; }

  return { init, destroy };
})();
