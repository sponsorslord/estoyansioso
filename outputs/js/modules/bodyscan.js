/* Body Scan — 8 zonas de 50s con auto-avance */
const BodyScanModule = (() => {
  const STEPS = [
    { label: 'PIES',            desc: 'Llevá la atención a los pies. Temperatura, contacto con el piso, tensión. Solo observá.', duration: 50 },
    { label: 'PIERNAS',         desc: 'Pantorrillas y rodillas. ¿Hay tensión? No cambies nada, solo notá.', duration: 50 },
    { label: 'MUSLOS Y CADERA', desc: 'Subí hasta la cadera. ¿Cómo está la zona lumbar? ¿Apoyada o tensa?', duration: 50 },
    { label: 'ABDOMEN',         desc: 'El vientre. ¿Está apretado? ¿La respiración llega hasta ahí?', duration: 50 },
    { label: 'PECHO',           desc: 'El pecho. El ritmo del corazón. Sentilo desde adentro.', duration: 50 },
    { label: 'MANOS Y BRAZOS',  desc: 'Las manos. Calor o frío en las palmas. Subí lento por los brazos.', duration: 50 },
    { label: 'HOMBROS Y CUELLO',desc: 'Los hombros. Probablemente tensos. Solo observá sin tratar de cambiar.', duration: 50 },
    { label: 'CARA Y CABEZA',   desc: 'Músculos alrededor de los ojos, mandíbula, frente. Cara hacia el piso o al techo, lo que sea cómodo.', duration: 50 },
  ];

  let rAF = null, running = false, paused = false;
  let stepIdx = 0, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elStepDesc, elCount, elBar;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-bodyscan')) return;
    elIdle      = document.getElementById('bs-idle');
    elActive    = document.getElementById('bs-active');
    elEnd       = document.getElementById('bs-end');
    elStepNum   = document.getElementById('bs-step-num');
    elStepLabel = document.getElementById('bs-step-label');
    elStepDesc  = document.getElementById('bs-step-desc');
    elCount     = document.getElementById('bs-count');
    elBar       = document.getElementById('bs-bar');
    btnStart  = document.getElementById('bs-start');
    btnPause  = document.getElementById('bs-pause');
    btnReset  = document.getElementById('bs-reset');
    btnRepeat = document.getElementById('bs-repeat');
    btnDone   = document.getElementById('bs-done');
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
