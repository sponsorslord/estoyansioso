/* ════════════════════════════════════════════════════════════
   Movement Express — 60 sec countdown (cortisol drain)
   ════════════════════════════════════════════════════════════ */

const MovementModule = (() => {

  const TOTAL = 60;
  const MESSAGES = [
    { at: 60, text: 'Empezá a saltar o sacudirte. Sin parar.' },
    { at: 45, text: 'Seguí. La adrenalina se está drenando.' },
    { at: 25, text: 'Últimos 25 segundos. El cuerpo ya lo siente.' },
    { at: 10, text: 'Todo lo que tenés, estos 10 segundos.' },
    { at:  3, text: 'Ya.' },
  ];

  let rAF = null, running = false, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elCount, elBar, elMsg;
  let btnStart, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-movement')) return;

    elIdle   = document.getElementById('movement-idle');
    elActive = document.getElementById('movement-active');
    elEnd    = document.getElementById('movement-end');
    elCount  = document.getElementById('movement-count');
    elBar    = document.getElementById('movement-bar');
    elMsg    = document.getElementById('movement-msg');
    btnStart  = document.getElementById('movement-start');
    btnReset  = document.getElementById('movement-reset');
    btnRepeat = document.getElementById('movement-repeat');
    btnDone   = document.getElementById('movement-done');

    btnStart?.addEventListener('click',  start);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', start);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function start() {
    running = true; elapsed = 0; lastTime = null;
    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    update(TOTAL);
    elMsg.textContent = MESSAGES[0].text;
    elBar.style.transition = 'none';
    elBar.style.width = '100%';
    requestAnimationFrame(() => {
      elBar.style.transition = `width ${TOTAL}s linear`;
      elBar.style.width = '0%';
    });
    rAF = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running) return;
    if (lastTime === null) lastTime = now;
    elapsed += (now - lastTime) / 1000;
    lastTime = now;

    const remaining = Math.max(0, TOTAL - elapsed);
    update(Math.ceil(remaining));

    for (const m of MESSAGES) {
      if (Math.ceil(remaining) === m.at && elMsg.textContent !== m.text) elMsg.textContent = m.text;
    }

    if (elapsed >= TOTAL) { finish(); return; }
    rAF = requestAnimationFrame(tick);
  }

  function update(n) {
    elCount.textContent = n;
    elCount.setAttribute('aria-label', `${n} segundos restantes`);
  }

  function reset() {
    cancelAnimationFrame(rAF); running = false; elapsed = 0;
    elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden');
  }

  function finish() {
    cancelAnimationFrame(rAF); running = false;
    elActive.classList.add('hidden'); elEnd.classList.remove('hidden');
  }

  function destroy() { cancelAnimationFrame(rAF); running = false; }

  return { init, destroy };
})();
