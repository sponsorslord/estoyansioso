/* Visualización Guiada — 6 pasos, usuario avanza */
const VisualizationModule = (() => {
  const STEPS = [
    { label: 'PREPARATE',   desc: 'Cerrá los ojos. Respirá profundo tres veces. Dejá que el cuerpo se asiente.' },
    { label: 'TU LUGAR',    desc: 'Imaginá un lugar donde te sentís completamente seguro. Puede ser real o inventado.' },
    { label: 'LO QUE VÉS', desc: 'Notá los colores y la luz de ese lugar. ¿Es de día o de noche? ¿Hay plantas, agua, cielo?' },
    { label: 'LO QUE ESCUCHÁS', desc: '¿Qué sonidos hay? ¿Viento, agua, silencio, pájaros? Dejáte envolver.' },
    { label: 'LO QUE SENTÍS',   desc: 'La temperatura en la piel. El suelo bajo tus pies. El aire en la cara.' },
    { label: 'QUEDÁTE',          desc: 'Estás ahí. Completamente presente en ese lugar. Quedáte tanto como quieras.' },
  ];

  let stepIdx = 0;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elStepDesc;
  let btnStart, btnNext, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-viz')) return;
    elIdle      = document.getElementById('viz-idle');
    elActive    = document.getElementById('viz-active');
    elEnd       = document.getElementById('viz-end');
    elStepNum   = document.getElementById('viz-step-num');
    elStepLabel = document.getElementById('viz-step-label');
    elStepDesc  = document.getElementById('viz-step-desc');
    btnStart  = document.getElementById('viz-start');
    btnNext   = document.getElementById('viz-next');
    btnReset  = document.getElementById('viz-reset');
    btnRepeat = document.getElementById('viz-repeat');
    btnDone   = document.getElementById('viz-done');
    btnStart?.addEventListener('click',  startSession);
    btnNext?.addEventListener('click',   nextStep);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    stepIdx = 0;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    applyStep(0);
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= STEPS.length) { finish(); return; }
    applyStep(stepIdx);
  }

  function applyStep(i) {
    elStepNum.textContent   = `${i + 1} / ${STEPS.length}`;
    elStepLabel.textContent = STEPS[i].label;
    elStepDesc.textContent  = STEPS[i].desc;
    if (btnNext) btnNext.textContent = i < STEPS.length - 1 ? 'Siguiente →' : 'Terminar';
  }

  function reset() { stepIdx = 0; elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); }
  function finish() { elActive.classList.add('hidden'); elEnd.classList.remove('hidden'); }
  function destroy() {}

  return { init, destroy };
})();
