/* ════════════════════════════════════════════════════════════
   Butterfly Hug — bilateral tapping, ~1 tap/second alternating
   ════════════════════════════════════════════════════════════ */

const ButterflyModule = (() => {

  const STEPS = [
    {
      label: 'CRUZÁ',
      desc: 'Cruzá los brazos sobre el pecho. Los pulgares entrelazados forman el cuerpo de la mariposa y los dedos las alas.',
      duration: 10000, // ms
      tapping: false,
    },
    {
      label: 'TAPEÁ',
      desc: 'Alterná golpecitos suaves con cada mano. Izquierda-derecha, un golpe por segundo. Como las alas de una mariposa.',
      duration: 90000,
      tapping: true,
    },
    {
      label: 'RESPIRA',
      desc: 'Seguí tapando y respirá lentamente. Podés cerrar los ojos o mirar hacia abajo.',
      duration: 0, // continues until user advances
      tapping: true,
    },
    {
      label: 'OBSERVÁ',
      desc: 'Sin juzgar, notá qué pasa en tu cuerpo. Imágenes, pensamientos, sensaciones. Dejalos pasar.',
      duration: 30000,
      tapping: false,
    },
  ];

  const TAP_INTERVAL = 1000; // 1 tap per second

  let stepIdx   = 0;
  let tapSide   = 'left'; // which side taps next
  let tapTimer  = null;
  let stepTimer = null;
  let running   = false;
  let paused    = false;

  let elIdle, elActive, elEnd;
  let elStepNum, elStepLabel, elStepDesc;
  let elWingLeft, elWingRight;
  let elTapLeft, elTapRight;
  let btnStart, btnPause, btnReset, btnRepeat, btnDone;

  function init() {
    const card = document.getElementById('mod-butterfly');
    if (!card) return;

    elIdle       = document.getElementById('butterfly-idle');
    elActive     = document.getElementById('butterfly-active');
    elEnd        = document.getElementById('butterfly-end');
    elStepNum    = document.getElementById('bf-step-num');
    elStepLabel  = document.getElementById('bf-step-label');
    elStepDesc   = document.getElementById('bf-step-desc');
    elWingLeft   = document.getElementById('wing-left');
    elWingRight  = document.getElementById('wing-right');
    elTapLeft    = document.getElementById('tap-left');
    elTapRight   = document.getElementById('tap-right');
    btnStart     = document.getElementById('butterfly-start');
    btnPause     = document.getElementById('butterfly-pause');
    btnReset     = document.getElementById('butterfly-reset');
    btnRepeat    = document.getElementById('butterfly-repeat');
    btnDone      = document.getElementById('butterfly-done');

    btnStart?.addEventListener('click',  startSession);
    btnPause?.addEventListener('click',  togglePause);
    btnReset?.addEventListener('click',  resetSession);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => {
      elEnd.classList.add('hidden');
      elIdle.classList.remove('hidden');
    });
  }

  function startSession() {
    running  = true;
    paused   = false;
    stepIdx  = 0;
    tapSide  = 'left';

    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    showStep(0);
  }

  function showStep(idx) {
    clearTimers();
    if (idx >= STEPS.length) { finish(); return; }

    const step = STEPS[idx];
    elStepNum.textContent   = `${idx + 1} / ${STEPS.length}`;
    elStepLabel.textContent = step.label;
    elStepDesc.textContent  = step.desc;

    if (step.tapping) {
      startTapping();
    } else {
      stopTapping();
    }

    // Auto-advance if step has a fixed duration
    if (step.duration > 0) {
      stepTimer = setTimeout(() => {
        stepIdx++;
        showStep(stepIdx);
      }, step.duration);
    }

    // Step 3 (OBSERVÁ): user can also advance manually — but we rely on the timeout
  }

  function startTapping() {
    if (tapTimer) return;
    tapTimer = setInterval(() => {
      if (paused) return;
      doTap(tapSide);
      tapSide = tapSide === 'left' ? 'right' : 'left';
    }, TAP_INTERVAL);
  }

  function stopTapping() {
    clearInterval(tapTimer);
    tapTimer = null;
    // Reset visual state
    elTapLeft.classList.remove('active');
    elTapRight.classList.remove('active');
    elWingLeft.classList.remove('beat');
    elWingRight.classList.remove('beat');
  }

  function doTap(side) {
    if (side === 'left') {
      elWingLeft.classList.add('beat');
      elTapLeft.classList.add('active');
      elTapRight.classList.remove('active');
      setTimeout(() => elWingLeft.classList.remove('beat'), 480);
    } else {
      elWingRight.classList.add('beat');
      elTapRight.classList.add('active');
      elTapLeft.classList.remove('active');
      setTimeout(() => elWingRight.classList.remove('beat'), 480);
    }
  }

  function togglePause() {
    if (paused) {
      paused = false;
      btnPause.textContent = '⏸ Pausar';
    } else {
      paused = true;
      btnPause.textContent = '▶ Continuar';
      stopTapping();
    }
  }

  function resetSession() {
    clearTimers();
    running = false;
    paused  = false;
    stepIdx = 0;

    stopTapping();
    elActive.classList.add('hidden');
    elEnd.classList.add('hidden');
    elIdle.classList.remove('hidden');
    btnPause.textContent = '⏸ Pausar';
  }

  function finish() {
    clearTimers();
    stopTapping();
    running = false;
    elActive.classList.add('hidden');
    elEnd.classList.remove('hidden');
  }

  function clearTimers() {
    clearTimeout(stepTimer);
    clearInterval(tapTimer);
    stepTimer = null;
    tapTimer  = null;
  }

  return { init };
})();
