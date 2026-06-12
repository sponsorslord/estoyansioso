/* ════════════════════════════════════════════════════════════
   Journaling Express — textarea + optional 10-min timer
   No storage: text is never saved.
   ════════════════════════════════════════════════════════════ */

const JournalingModule = (() => {

  const TIMER_SECONDS = 10 * 60;

  let rAF = null, running = false, elapsed = 0, lastTime = null;
  let elTextarea, elTimerDisplay, elTimerStart, elClear;

  function init() {
    if (!document.getElementById('mod-journaling')) return;

    elTextarea    = document.getElementById('journaling-textarea');
    elTimerDisplay= document.getElementById('journaling-timer-display');
    elTimerStart  = document.getElementById('journaling-timer-start');
    elClear       = document.getElementById('journaling-clear');

    elTimerStart?.addEventListener('click', toggleTimer);
    elClear?.addEventListener('click', clearAll);
  }

  function toggleTimer() {
    if (running) {
      cancelAnimationFrame(rAF);
      running = false;
      elTimerStart.textContent = '⏱ Iniciar temporizador (10 min)';
    } else {
      if (elapsed >= TIMER_SECONDS) { elapsed = 0; }
      running = true; lastTime = null;
      elTimerStart.textContent = '⏹ Detener';
      rAF = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    if (!running) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000;
    lastTime = now;

    const remaining = Math.max(0, TIMER_SECONDS - elapsed);
    renderTimer(remaining);

    if (elapsed >= TIMER_SECONDS) {
      running = false;
      cancelAnimationFrame(rAF);
      elTimerStart.textContent = '⏱ Iniciar temporizador (10 min)';
      elapsed = 0;
      if (elTimerDisplay) elTimerDisplay.textContent = '10:00';
      return;
    }

    rAF = requestAnimationFrame(tick);
  }

  function renderTimer(remaining) {
    if (!elTimerDisplay) return;
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    elTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function clearAll() {
    if (elTextarea) elTextarea.value = '';
    cancelAnimationFrame(rAF);
    running = false; elapsed = 0;
    if (elTimerDisplay) elTimerDisplay.textContent = '10:00';
    if (elTimerStart)   elTimerStart.textContent = '⏱ Iniciar temporizador (10 min)';
  }

  function destroy() {
    cancelAnimationFrame(rAF);
    running = false;
  }

  return { init, destroy };
})();
