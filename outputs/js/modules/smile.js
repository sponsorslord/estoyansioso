/* ════════════════════════════════════════════════════════════
   Smile & Laughter — 20 sec timer
   ════════════════════════════════════════════════════════════ */

const SmileModule = (() => {

  const TOTAL = 20;
  const EMOJIS = ['😄', '😁', '🤣', '😆', '😂'];
  const MESSAGES = [
    { at: 20, text: 'Hacé la sonrisa más exagerada y ridícula que puedas.' },
    { at: 12, text: 'Ahora reí si podés, aunque sea forzado. El cuerpo lo registra igual.' },
    { at:  4, text: 'El cerebro ya recibió la señal. Últimos segundos.' },
  ];

  let rAF = null, running = false, elapsed = 0, lastTime = null;
  let emojiInterval = null;
  let elIdle, elActive, elEnd, elCount, elBar, elMsg, elEmoji;
  let btnStart, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-smile')) return;

    elIdle   = document.getElementById('smile-idle');
    elActive = document.getElementById('smile-active');
    elEnd    = document.getElementById('smile-end');
    elCount  = document.getElementById('smile-count');
    elBar    = document.getElementById('smile-bar');
    elMsg    = document.getElementById('smile-msg');
    elEmoji  = document.getElementById('smile-emoji');
    btnStart  = document.getElementById('smile-start');
    btnReset  = document.getElementById('smile-reset');
    btnRepeat = document.getElementById('smile-repeat');
    btnDone   = document.getElementById('smile-done');

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

    // Cycle emojis every 2 seconds
    let eIdx = 0;
    if (elEmoji) elEmoji.textContent = EMOJIS[0];
    emojiInterval = setInterval(() => {
      eIdx = (eIdx + 1) % EMOJIS.length;
      if (elEmoji) elEmoji.textContent = EMOJIS[eIdx];
    }, 2000);

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
    cancelAnimationFrame(rAF); clearInterval(emojiInterval);
    running = false; elapsed = 0;
    elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden');
  }

  function finish() {
    cancelAnimationFrame(rAF); clearInterval(emojiInterval);
    running = false;
    elActive.classList.add('hidden'); elEnd.classList.remove('hidden');
  }

  function destroy() { cancelAnimationFrame(rAF); clearInterval(emojiInterval); running = false; }

  return { init, destroy };
})();
