/* Estiramiento — 6 pasos de 30s con auto-avance */
const StretchingModule = (() => {
  const STEPS = [
    { label: 'CUELLO DERECHO',   desc: 'Incliná la cabeza hacia el hombro derecho. Mano derecha jalando suave sobre la cabeza.', duration: 30 },
    { label: 'CUELLO IZQUIERDO', desc: 'Cambiá de lado. Mano izquierda sobre la cabeza.', duration: 30 },
    { label: 'HOMBROS ADELANTE', desc: 'Entrelazá los dedos, estirá los brazos adelante. Pecho hundido, espalda redondeada.', duration: 30 },
    { label: 'PECHO ABIERTO',    desc: 'Manos atrás, entrelazadas. Abrí el pecho, sacás los hombros hacia atrás.', duration: 30 },
    { label: 'TORSIÓN DERECHA',  desc: 'Girá el torso hacia la derecha. Mano izquierda en la rodilla derecha.', duration: 30 },
    { label: 'TORSIÓN IZQUIERDA',desc: 'Cambiá de lado.', duration: 30 },
  ];

  let rAF = null, running = false, paused = false;
  let stepIdx = 0, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elStepDesc, elCount, elBar;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-stretching')) return;
    elIdle      = document.getElementById('str-idle');
    elActive    = document.getElementById('str-active');
    elEnd       = document.getElementById('str-end');
    elStepNum   = document.getElementById('str-step-num');
    elStepLabel = document.getElementById('str-step-label');
    elStepDesc  = document.getElementById('str-step-desc');
    elCount     = document.getElementById('str-count');
    elBar       = document.getElementById('str-bar');
    btnStart  = document.getElementById('str-start');
    btnPause  = document.getElementById('str-pause');
    btnReset  = document.getElementById('str-reset');
    btnRepeat = document.getElementById('str-repeat');
    btnDone   = document.getElementById('str-done');
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
