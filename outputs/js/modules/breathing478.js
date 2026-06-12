/* Respiración 4-7-8 — 4 rondas: inhale(4s) + hold(7s) + exhale(8s) */
const Breathing478Module = (() => {
  const MAX_ROUNDS = 4;
  const PHASES = [
    { label: 'INHALÁ', desc: 'Inhalá suave por la nariz durante 4 segundos.', duration: 4 },
    { label: 'RETENÉ', desc: 'Aguantá el aire. El corazón empieza a ralentizarse.', duration: 7 },
    { label: 'EXHALÁ', desc: 'Soltá todo el aire por la boca en 8 segundos. Esta es la clave.', duration: 8 },
  ];

  let rAF = null, running = false, paused = false;
  let phaseIdx = 0, elapsed = 0, round = 1, lastTime = null;
  let elIdle, elActive, elEnd, elLabel, elDesc, elCount, elRounds;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-478')) return;
    elIdle   = document.getElementById('b478-idle');
    elActive = document.getElementById('b478-active');
    elEnd    = document.getElementById('b478-end');
    elLabel  = document.getElementById('b478-label');
    elDesc   = document.getElementById('b478-desc');
    elCount  = document.getElementById('b478-count');
    elRounds = document.getElementById('b478-rounds');
    btnStart  = document.getElementById('b478-start');
    btnPause  = document.getElementById('b478-pause');
    btnReset  = document.getElementById('b478-reset');
    btnRepeat = document.getElementById('b478-repeat');
    btnDone   = document.getElementById('b478-done');
    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false; phaseIdx = 0; elapsed = 0; round = 1; lastTime = null;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    renderRounds(); applyPhase(PHASES[0]); rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000; lastTime = now;
    elCount.textContent = Math.ceil(Math.max(0, PHASES[phaseIdx].duration - elapsed));
    if (elapsed >= PHASES[phaseIdx].duration) {
      elapsed -= PHASES[phaseIdx].duration; phaseIdx++;
      if (phaseIdx >= PHASES.length) { phaseIdx = 0; round++; if (round > MAX_ROUNDS) { finish(); return; } renderRounds(); }
      applyPhase(PHASES[phaseIdx]);
    }
    rAF = requestAnimationFrame(tick);
  }

  function applyPhase(p) { elLabel.textContent = p.label; elDesc.textContent = p.desc; elCount.textContent = p.duration; }

  function renderRounds() {
    if (!elRounds) return;
    let h = '';
    for (let i = 1; i <= MAX_ROUNDS; i++) h += `<span class="cycle-dot${i < round ? ' done' : ''}"></span>`;
    h += `<span class="cycle-text">Ronda ${Math.min(round, MAX_ROUNDS)} de ${MAX_ROUNDS}</span>`;
    elRounds.innerHTML = h;
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
