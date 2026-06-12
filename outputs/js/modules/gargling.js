/* ════════════════════════════════════════════════════════════
   Gargling — 30 sec countdown (vagal nerve stimulation)
   ════════════════════════════════════════════════════════════ */

const GarglingModule = (() => {

  const TOTAL = 30;
  const MESSAGES = [
    { at: 30, text: 'Agua fría en la boca. Empezá con las gárgaras.' },
    { at: 20, text: 'Seguí. La vibración está activando el nervio vago.' },
    { at: 10, text: 'Un poco más.' },
    { at:  3, text: 'Ya.' },
  ];

  let rAF = null, running = false, elapsed = 0, lastTime = null;
  let elIdle, elActive, elEnd, elCount, elBar, elMsg;
  let btnStart, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-gargling')) return;

    elIdle   = document.getElementById('gargling-idle');
    elActive = document.getElementById('gargling-active');
    elEnd    = document.getElementById('gargling-end');
    elCount  = document.getElementById('gargling-count');
    elBar    = document.getElementById('gargling-bar');
    elMsg    = document.getElementById('gargling-msg');
    btnStart  = document.getElementById('gargling-start');
    btnReset  = document.getElementById('gargling-reset');
    btnRepeat = document.getElementById('gargling-repeat');
    btnDone   = document.getElementById('gargling-done');

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
