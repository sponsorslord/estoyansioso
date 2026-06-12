/* Meditación 3 Minutos — 3 fases con timer */
const MeditationModule = (() => {
  const PHASES = [
    { label: 'NOTÁ', desc: 'Notá cómo estás en este momento. Sin juzgar, sin cambiar nada.', duration: 60 },
    { label: 'RESPIRACIÓN', desc: 'Prestá atención solo a la respiración. Cuando la mente se va, volvé sin esfuerzo.', duration: 90 },
    { label: 'CUERPO', desc: 'Expandí la conciencia al cuerpo entero. Pies, manos, cara. Completamente presente.', duration: 50 },
  ];

  let rAF = null, running = false, paused = false;
  let phaseIdx = 0, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elPhaseNum, elPhaseLabel, elPhaseDesc, elCount;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-meditation')) return;
    elIdle       = document.getElementById('med-idle');
    elActive     = document.getElementById('med-active');
    elEnd        = document.getElementById('med-end');
    elPhaseNum   = document.getElementById('med-phase-num');
    elPhaseLabel = document.getElementById('med-phase-label');
    elPhaseDesc  = document.getElementById('med-phase-desc');
    elCount      = document.getElementById('med-count');
    btnStart  = document.getElementById('med-start');
    btnPause  = document.getElementById('med-pause');
    btnReset  = document.getElementById('med-reset');
    btnRepeat = document.getElementById('med-repeat');
    btnDone   = document.getElementById('med-done');
    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false; phaseIdx = 0; elapsed = 0; lastTime = null;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    applyPhase(PHASES[0]); rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000; lastTime = now;
    elCount.textContent = Math.ceil(Math.max(0, PHASES[phaseIdx].duration - elapsed));
    if (elapsed >= PHASES[phaseIdx].duration) {
      elapsed -= PHASES[phaseIdx].duration; phaseIdx++;
      if (phaseIdx >= PHASES.length) { finish(); return; }
      applyPhase(PHASES[phaseIdx]);
    }
    rAF = requestAnimationFrame(tick);
  }

  function applyPhase(p) {
    elPhaseNum.textContent   = `${phaseIdx + 1} / ${PHASES.length}`;
    elPhaseLabel.textContent = p.label;
    elPhaseDesc.textContent  = p.desc;
    elCount.textContent      = p.duration;
  }

  function togglePause() {
    if (paused) { paused = false; lastTime = null; btnPause.textContent = '⏸ Pausar'; rAF = requestAnimationFrame(tick); }
    else { paused = true; cancelAnimationFrame(rAF); btnPause.textContent = '▶ Continuar'; }
  }

  function reset() {
    cancelAnimationFrame(rAF); running = false; paused = false;
    elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden');
    if (btnPause) btnPause.textContent = '⏸ Pausar';
  }

  function finish() { cancelAnimationFrame(rAF); running = false; elActive.classList.add('hidden'); elEnd.classList.remove('hidden'); }
  function destroy() { cancelAnimationFrame(rAF); running = false; paused = false; }

  return { init, destroy };
})();
