/* ════════════════════════════════════════════════════════════
   Tarareo / VOO — 3 rounds: inhale (4s) + VOO (8s)
   ════════════════════════════════════════════════════════════ */

const HummingModule = (() => {

  const MAX_ROUNDS = 3;

  const PHASES = [
    { id: 'inhale', label: 'INHALÁ', desc: 'Respirá profundo por la nariz.', duration: 4 },
    { id: 'voo',    label: 'VOO…',   desc: 'Exhalá emitiendo "VOO" suave y sostenido.', duration: 8 },
  ];

  let rAF = null, running = false, paused = false;
  let phaseIdx = 0, elapsed = 0, round = 0, lastTime = null;

  let elIdle, elActive, elEnd;
  let elLabel, elDesc, elCount, elRounds;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-humming')) return;

    elIdle   = document.getElementById('humming-idle');
    elActive = document.getElementById('humming-active');
    elEnd    = document.getElementById('humming-end');
    elLabel  = document.getElementById('humming-label');
    elDesc   = document.getElementById('humming-desc');
    elCount  = document.getElementById('humming-count');
    elRounds = document.getElementById('humming-rounds');
    btnStart  = document.getElementById('humming-start');
    btnPause  = document.getElementById('humming-pause');
    btnReset  = document.getElementById('humming-reset');
    btnRepeat = document.getElementById('humming-repeat');
    btnDone   = document.getElementById('humming-done');

    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    running = true; paused = false;
    phaseIdx = 0; elapsed = 0; round = 1; lastTime = null;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');
    renderRounds();
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
      if (phaseIdx >= PHASES.length) {
        phaseIdx = 0;
        round++;
        if (round > MAX_ROUNDS) { finish(); return; }
        renderRounds();
      }
      applyPhase(PHASES[phaseIdx]);
    }

    rAF = requestAnimationFrame(tick);
  }

  function applyPhase(phase) {
    elLabel.textContent = phase.label;
    elDesc.textContent  = phase.desc;
    elCount.textContent = phase.duration;
  }

  function renderRounds() {
    if (!elRounds) return;
    let html = '';
    for (let i = 1; i <= MAX_ROUNDS; i++) {
      html += `<span class="cycle-dot${i < round ? ' done' : ''}"></span>`;
    }
    html += `<span class="cycle-text">Ronda ${Math.min(round, MAX_ROUNDS)} de ${MAX_ROUNDS}</span>`;
    elRounds.innerHTML = html;
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
    running = false; paused = false; phaseIdx = 0; elapsed = 0; round = 0;
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
