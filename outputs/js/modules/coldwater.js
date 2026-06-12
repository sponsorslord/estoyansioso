/* ════════════════════════════════════════════════════════════
   Cold Water — 30-second countdown timer
   ════════════════════════════════════════════════════════════ */

const ColdWaterModule = (() => {

  const TOTAL = 30;
  const MESSAGES = [
    { at: 30, text: 'Agua fría en cara, frente y pómulos.' },
    { at: 20, text: 'Sostené el contacto. Ya está funcionando.' },
    { at: 10, text: 'Casi listo. Seguí unos segundos más.' },
    { at:  3, text: 'Ya.' },
  ];

  let rAF = null;
  let running = false;
  let elapsed = 0;
  let lastTime = null;

  let elIdle, elActive, elEnd;
  let elCount, elBar, elMsg;
  let btnStart, btnReset, btnRepeat, btnDone;

  function init() {
    const card = document.getElementById('mod-water');
    if (!card) return;

    elIdle   = document.getElementById('water-idle');
    elActive = document.getElementById('water-active');
    elEnd    = document.getElementById('water-end');
    elCount  = document.getElementById('water-count');
    elBar    = document.getElementById('water-bar');
    elMsg    = document.getElementById('water-msg');
    btnStart  = document.getElementById('water-start');
    btnReset  = document.getElementById('water-reset');
    btnRepeat = document.getElementById('water-repeat');
    btnDone   = document.getElementById('water-done');

    btnStart?.addEventListener('click',  startTimer);
    btnReset?.addEventListener('click',  resetTimer);
    btnRepeat?.addEventListener('click', startTimer);
    btnDone?.addEventListener('click', () => {
      elEnd.classList.add('hidden');
      elIdle.classList.remove('hidden');
    });
  }

  function startTimer() {
    running  = true;
    elapsed  = 0;
    lastTime = null;

    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    updateDisplay(TOTAL);
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

    const delta = (now - lastTime) / 1000;
    lastTime = now;
    elapsed += delta;

    const remaining = Math.max(0, TOTAL - elapsed);
    updateDisplay(Math.ceil(remaining));

    // Update message
    for (const m of MESSAGES) {
      if (Math.ceil(remaining) === m.at && elMsg.textContent !== m.text) {
        elMsg.textContent = m.text;
      }
    }

    if (elapsed >= TOTAL) {
      finish();
      return;
    }

    rAF = requestAnimationFrame(tick);
  }

  function updateDisplay(num) {
    elCount.textContent = num;
    elCount.setAttribute('aria-label', `${num} segundos restantes`);
  }

  function resetTimer() {
    cancelAnimationFrame(rAF);
    running = false;
    elapsed = 0;

    elActive.classList.add('hidden');
    elEnd.classList.add('hidden');
    elIdle.classList.remove('hidden');
  }

  function finish() {
    cancelAnimationFrame(rAF);
    running = false;
    elActive.classList.add('hidden');
    elEnd.classList.remove('hidden');
  }

  return { init };
})();
