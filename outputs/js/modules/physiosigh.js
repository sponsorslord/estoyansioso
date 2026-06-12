/* Suspiro Fisiológico — 3 rondas: inhale(3s) + sip(1s) + exhale(6s) */
const SighModule = (() => {
  const MAX_ROUNDS = 3;
  const PHASES = [
    { label: 'INHALÁ', desc: 'Respirá profundo por la nariz, llenando el pecho.', duration: 3 },
    { label: 'UN POCO MÁS', desc: 'Un segundo soplo corto. Llenate un poco más.', duration: 1 },
    { label: 'EXHALÁ LARGO', desc: 'Soltá todo el aire por la boca, lento y largo.', duration: 6 },
  ];

  let rAF = null, running = false, paused = false;
  let phaseIdx = 0, elapsed = 0, round = 1, lastTime = null;
  let elIdle, elActive, elEnd, elLabel, elDesc, elCount, elRounds;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-sigh')) return;
    elIdle   = document.getElementById('sigh-idle');
    elActive = document.getElementById('sigh-active');
    elEnd    = document.getElementById('sigh-end');
    elLabel  = document.getElementById('sigh-label');
    elDesc   = document.getElementById('sigh-desc');
    elCount  = document.getElementById('sigh-count');
    elRounds = document.getElementById('sigh-rounds');
    btnStart  = document.getElementById('sigh-start');
    btnPause  = document.getElementById('sigh-pause');
    btnReset  = document.getElementById('sigh-reset');
    btnRepeat = document.getElementById('sigh-repeat');
    btnDone   = document.getElementById('sigh-done');
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
