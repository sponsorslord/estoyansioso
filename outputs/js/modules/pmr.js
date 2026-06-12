/* Relajación Muscular Progresiva — 10 grupos: tensa(5s) + suelta(20s) */
const PmrModule = (() => {
  const TENSE_DUR = 5, RELEASE_DUR = 20;
  const MUSCLES = [
    { label: 'PIES',         tense: 'Tensá los dedos del pie doblándolos hacia adentro.',        release: 'Soltá completamente. Sentí la diferencia.' },
    { label: 'PANTORRILLAS', tense: 'Apuntá los pies hacia arriba, tensando las pantorrillas.',   release: 'Soltá. Notá el calor que queda.' },
    { label: 'MUSLOS',       tense: 'Apretá los muslos juntos con fuerza.',                       release: 'Soltá. Dejá caer las piernas.' },
    { label: 'ABDOMEN',      tense: 'Contraé el abdomen como si fuera a recibir un golpe.',       release: 'Soltá. Respirá profundo.' },
    { label: 'MANOS',        tense: 'Apretá los puños con toda tu fuerza.',                       release: 'Abrí las manos. Sentí el hormigueo.' },
    { label: 'ANTEBRAZOS',   tense: 'Doblá las muñecas hacia arriba tensando los antebrazos.',    release: 'Soltá. Manos caídas.' },
    { label: 'BÍCEPS',       tense: 'Doblá los codos, apretá los bíceps fuerte.',                 release: 'Soltá los brazos completamente.' },
    { label: 'HOMBROS',      tense: 'Subí los hombros hasta las orejas. Todo lo que puedas.',     release: 'Dejálos caer de golpe. Todo el peso.' },
    { label: 'CARA',         tense: 'Apretá los ojos, arrugá la nariz, apretá la mandíbula.',     release: 'Soltá la cara entera. Suave.' },
    { label: 'FRENTE',       tense: 'Levantá las cejas lo más alto posible.',                     release: 'Soltá. Cara completamente relajada.' },
  ];

  let rAF = null, running = false, paused = false;
  let muscleIdx = 0, subPhase = 0, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elPhaseLabel, elPhaseDesc, elCount, elBar;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-pmr')) return;
    elIdle        = document.getElementById('pmr-idle');
    elActive      = document.getElementById('pmr-active');
    elEnd         = document.getElementById('pmr-end');
    elStepNum     = document.getElementById('pmr-step-num');
    elStepLabel   = document.getElementById('pmr-step-label');
    elPhaseLabel  = document.getElementById('pmr-phase-label');
    elPhaseDesc   = document.getElementById('pmr-phase-desc');
    elCount       = document.getElementById('pmr-count');
    elBar         = document.getElementById('pmr-bar');
    btnStart  = document.getElementById('pmr-start');
    btnPause  = document.getElementById('pmr-pause');
    btnReset  = document.getElementById('pmr-reset');
    btnRepeat = document.getElementById('pmr-repeat');
    btnDone   = document.getElementById('pmr-done');
    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false; muscleIdx = 0; subPhase = 0; elapsed = 0; lastTime = null;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    applySubPhase(); rAF = requestAnimationFrame(tick);
  }

  function currentDur() { return subPhase === 0 ? TENSE_DUR : RELEASE_DUR; }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000; lastTime = now;
    elCount.textContent = Math.ceil(Math.max(0, currentDur() - elapsed));
    if (elapsed >= currentDur()) {
      elapsed -= currentDur();
      if (subPhase === 0) { subPhase = 1; applySubPhase(); startBar(RELEASE_DUR); }
      else { muscleIdx++; if (muscleIdx >= MUSCLES.length) { finish(); return; } subPhase = 0; applySubPhase(); startBar(TENSE_DUR); }
    }
    rAF = requestAnimationFrame(tick);
  }

  function applySubPhase() {
    const m = MUSCLES[muscleIdx];
    elStepNum.textContent   = `${muscleIdx + 1} / ${MUSCLES.length}`;
    elStepLabel.textContent = m.label;
    elPhaseLabel.textContent= subPhase === 0 ? 'TENSÁ' : 'SOLTÁ';
    elPhaseDesc.textContent = subPhase === 0 ? m.tense : m.release;
    elCount.textContent     = currentDur();
    startBar(currentDur());
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
