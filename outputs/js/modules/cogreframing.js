/* Reencuadre Cognitivo (TCC) — 4 prompts con textarea */
const CogReframingModule = (() => {
  const PROMPTS = [
    { heading: 'EL PENSAMIENTO ANSIOSO',  label: '¿Cuál es el pensamiento que te genera ansiedad?',      placeholder: 'Escribilo tal como aparece en tu cabeza.' },
    { heading: 'EVIDENCIA A FAVOR',       label: '¿Qué evidencia tenés de que ese pensamiento es cierto?', placeholder: 'Sé honesto/a. Hechos concretos, no sensaciones.' },
    { heading: 'EVIDENCIA EN CONTRA',     label: '¿Qué evidencia tenés de que NO es cierto?',             placeholder: 'Veces que el miedo no se cumplió, recursos que tenés...' },
    { heading: 'VERSIÓN EQUILIBRADA',     label: 'Escribí una versión más equilibrada y realista del pensamiento.', placeholder: 'Ej: "Puede que salga mal, y si sale mal lo voy a poder manejar."' },
  ];

  let elSteps = [], elTextareas = [], btnNexts = [];
  let elEnd, btnRepeat, btnClear, btnDone;
  let currentStep = 0;

  function init() {
    if (!document.getElementById('mod-reframing')) return;
    elEnd    = document.getElementById('ref-end');
    btnRepeat = document.getElementById('ref-repeat');
    btnClear  = document.getElementById('ref-clear');
    btnDone   = document.getElementById('ref-done');

    for (let i = 0; i < PROMPTS.length; i++) {
      elSteps.push(document.getElementById(`ref-step-${i + 1}`));
      elTextareas.push(document.getElementById(`ref-ta-${i + 1}`));
      const btn = document.getElementById(`ref-next-${i + 1}`);
      btnNexts.push(btn);
      if (btn) { const idx = i; btn.addEventListener('click', () => advanceTo(idx + 1)); }
    }

    btnRepeat?.addEventListener('click', reset);
    btnClear?.addEventListener('click',  clearAll);
    btnDone?.addEventListener('click', () => { if (elEnd) elEnd.classList.add('hidden'); showStep(0); });
  }

  function showStep(i) {
    elSteps.forEach((el, idx) => { if (el) el.classList.toggle('hidden', idx !== i); });
    if (elEnd) elEnd.classList.add('hidden');
    currentStep = i;
  }

  function advanceTo(i) {
    if (i >= PROMPTS.length) { elSteps.forEach(el => el?.classList.add('hidden')); if (elEnd) elEnd.classList.remove('hidden'); return; }
    showStep(i);
  }

  function clearAll() { elTextareas.forEach(t => { if (t) t.value = ''; }); showStep(0); }
  function reset() { clearAll(); }
  function destroy() {}

  return { init, destroy };
})();
