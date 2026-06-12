/* Defusión Cognitiva (ACT) — 3 pasos con textarea */
const CogDefusionModule = (() => {
  let elSteps = [], elTextareas = [], btnNexts = [];
  let elEnd, btnRepeat, btnClear, btnDone;
  let currentStep = 0;

  const PROMPTS = [
    { heading: 'ESCRIBÍ EL PENSAMIENTO',  placeholder: 'Ej: "Si no lo hago perfecto, todo va a salir mal..."', note: '' },
    { heading: 'REESCRIBILO',             placeholder: 'Estoy teniendo el pensamiento de que...', note: 'Empezá exactamente con esa frase.' },
    { heading: '¿CAMBIÓ ALGO?',           placeholder: 'Observá la diferencia. ¿El pensamiento pesa lo mismo? Escribí lo que notás.', note: 'Opcional.' },
  ];

  function init() {
    if (!document.getElementById('mod-defusion')) return;
    elEnd    = document.getElementById('def-end');
    btnRepeat = document.getElementById('def-repeat');
    btnClear  = document.getElementById('def-clear');
    btnDone   = document.getElementById('def-done');

    for (let i = 0; i < PROMPTS.length; i++) {
      elSteps.push(document.getElementById(`def-step-${i + 1}`));
      elTextareas.push(document.getElementById(`def-ta-${i + 1}`));
      const btn = document.getElementById(`def-next-${i + 1}`);
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
