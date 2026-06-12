/* ════════════════════════════════════════════════════════════
   Grounding 5-4-3-2-1 — step-by-step sensory anchoring
   ════════════════════════════════════════════════════════════ */

const GroundingModule = (() => {

  const STEPS = [
    {
      emoji: '👁️',
      count: '5 COSAS',
      instruction: 'Mirá alrededor. Nombrá 5 cosas que podés ver. Sé específico: "un vaso con agua a la mitad", no solo "un vaso".',
      placeholder: 'Un libro rojo, la luz del techo...',
    },
    {
      emoji: '🤲',
      count: '4 TEXTURAS',
      instruction: 'Tocá cosas cercanas. Nombrá 4 texturas que podés sentir: la tela de tu ropa, el escritorio, el aire frío.',
      placeholder: 'El tejido de mi remera, el borde de la mesa...',
    },
    {
      emoji: '👂',
      count: '3 SONIDOS',
      instruction: 'Cerrá los ojos si querés. Escuchá 3 cosas: el aire acondicionado, pasos afuera, tu propia respiración.',
      placeholder: 'El ventilador, tráfico afuera...',
    },
    {
      emoji: '👃',
      count: '2 OLORES',
      instruction: 'Identificá 2 cosas que podés oler. Si no hay aromas cercanos, levantate y buscá: jabón, café, aire exterior.',
      placeholder: 'El jabón de mis manos, el aire...',
    },
    {
      emoji: '👅',
      count: '1 SABOR',
      instruction: 'Prestá atención a qué sabor tenés en la boca ahora mismo. Sin juzgar. Solo observá.',
      placeholder: 'Un sabor neutro, ligero a café...',
    },
  ];

  let stepIdx = 0;

  let elIdle, elActive, elEnd;
  let elProgress;
  let elEmoji, elCount, elInstruction, elInput;
  let elStepCard;
  let btnStart, btnNext, btnRepeat, btnDone;

  function init() {
    const card = document.getElementById('mod-grounding');
    if (!card) return;

    elIdle       = document.getElementById('grounding-idle');
    elActive     = document.getElementById('grounding-active');
    elEnd        = document.getElementById('grounding-end');
    elProgress   = document.getElementById('grounding-progress');
    elEmoji      = document.getElementById('g-emoji');
    elCount      = document.getElementById('g-count');
    elInstruction= document.getElementById('g-instruction');
    elInput      = document.getElementById('g-input');
    elStepCard   = document.getElementById('grounding-step-card');
    btnStart     = document.getElementById('grounding-start');
    btnNext      = document.getElementById('grounding-next');
    btnRepeat    = document.getElementById('grounding-repeat');
    btnDone      = document.getElementById('grounding-done');

    btnStart?.addEventListener('click',  startSession);
    btnNext?.addEventListener('click',   nextStep);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => {
      elEnd.classList.add('hidden');
      elIdle.classList.remove('hidden');
    });
  }

  function startSession() {
    stepIdx = 0;

    elIdle.classList.add('hidden');
    elEnd.classList.add('hidden');
    elActive.classList.remove('hidden');

    renderProgress();
    showStep(0);
  }

  function showStep(idx) {
    const step = STEPS[idx];

    // Animate card out/in
    elStepCard.style.animation = 'none';
    elStepCard.offsetHeight; // reflow
    elStepCard.style.animation = '';

    elEmoji.textContent       = step.emoji;
    elCount.textContent       = step.count;
    elInstruction.textContent = step.instruction;
    elInput.value             = '';
    elInput.placeholder       = step.placeholder;

    // Update next button text on last step
    btnNext.textContent = idx === STEPS.length - 1 ? 'Terminé ✓' : 'Listo, siguiente →';
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= STEPS.length) {
      finish();
    } else {
      renderProgress();
      showStep(stepIdx);
    }
  }

  function renderProgress() {
    if (!elProgress) return;
    let html = '';
    for (let i = 0; i < STEPS.length; i++) {
      let cls = '';
      if (i === stepIdx)   cls = 'active';
      else if (i < stepIdx) cls = 'done';
      html += `<div class="grounding-dot ${cls}" aria-hidden="true"></div>`;
    }
    elProgress.innerHTML = html;
    elProgress.setAttribute('aria-label', `Paso ${stepIdx + 1} de ${STEPS.length}`);
  }

  function finish() {
    elActive.classList.add('hidden');
    elEnd.classList.remove('hidden');
  }

  function destroy() {
    stepIdx = 0;
  }

  return { init, destroy };
})();
