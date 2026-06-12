/* Automasaje — 5 zonas de 30s con auto-avance */
const SelfMassageModule = (() => {
  const STEPS = [
    { label: 'CUERO CABELLUDO', desc: 'Yemas de los dedos haciendo círculos por todo el cuero cabelludo. Lento y con presión.', duration: 30 },
    { label: 'NUCA',            desc: 'Cuatro dedos en la base del cráneo. Círculos hacia abajo, hasta los hombros.', duration: 30 },
    { label: 'HOMBROS',         desc: 'Mano derecha amasando el hombro izquierdo con fuerza. Luego cambiá.', duration: 30 },
    { label: 'MANOS',           desc: 'Pulgar haciendo círculos en la palma opuesta. Entre los dedos también.', duration: 30 },
    { label: 'CARA',            desc: 'Frente, sienes, mandíbula. Donde sentís más tensión, quedáte ahí.', duration: 30 },
  ];

  let rAF = null, running = false, paused = false;
  let stepIdx = 0, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elStepDesc, elCount, elBar;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-selfmassage')) return;
    elIdle      = document.getElementById('mass-idle');
    elActive    = document.getElementById('mass-active');
    elEnd       = document.getElementById('mass-end');
    elStepNum   = document.getElementById('mass-step-num');
    elStepLabel = document.getElementById('mass-step-label');
    elStepDesc  = document.getElementById('mass-step-desc');
    elCount     = document.getElementById('mass-count');
    elBar       = document.getElementById('mass-bar');
    btnStart  = document.getElementById('mass-start');
    btnPause  = document.getElementById('mass-pause');
    btnReset  = document.getElementById('mass-reset');
    btnRepeat = document.getElementById('mass-repeat');
    btnDone   = document.getElementById('mass-done');
    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false; stepIdx = 0; elapsed = 0; lastTime = null;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    applyStep(0); startBar(STEPS[0].duration); rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000; lastTime = now;
    const dur = STEPS[stepIdx].duration;
    elCount.textContent = Math.ceil(Math.max(0, dur - elapsed));
    if (elapsed >= dur) {
      elapsed -= dur; stepIdx++;
      if (stepIdx >= STEPS.length) { finish(); return; }
      applyStep(stepIdx); startBar(STEPS[stepIdx].duration);
    }
    rAF = requestAnimationFrame(tick);
  }

  function applyStep(i) {
    elStepNum.textContent   = `${i + 1} / ${STEPS.length}`;
    elStepLabel.textContent = STEPS[i].label;
    elStepDesc.textContent  = STEPS[i].desc;
    elCount.textContent     = STEPS[i].duration;
  }

  function startBar(dur) {
    if (!elBar) return;
    elBar.style.transition = 'none'; elBar.style.width = '100%';
    requestAnimationFrame(() => { elBar.style.transition = `width ${dur}s linear`; elBar.style.width = '0%'; });
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
