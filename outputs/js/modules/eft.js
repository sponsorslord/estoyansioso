/* EFT Tapping — 9 puntos de acupresión, usuario avanza */
const EftModule = (() => {
  const POINTS = [
    { label: 'LADO DE LA MANO',  location: 'Costado externo de la mano, debajo del meñique.',           phrase: 'Aunque me siento ansioso, me acepto como soy.' },
    { label: 'CEJA',             location: 'Inicio de la ceja, lado interno (sobre la nariz).',          phrase: 'Esta ansiedad que siento...' },
    { label: 'OJO LATERAL',      location: 'Costado del ojo, sobre el hueso.',                           phrase: 'La siento en el cuerpo...' },
    { label: 'BAJO EL OJO',      location: 'Hueso bajo el ojo, centro.',                                 phrase: 'Está pasando algo difícil...' },
    { label: 'BAJO LA NARIZ',    location: 'Entre la nariz y el labio superior.',                        phrase: 'Y aun así estoy acá...' },
    { label: 'BARBILLA',         location: 'Pliegue entre el labio inferior y la barbilla.',             phrase: 'Manejando esto como puedo...' },
    { label: 'CLAVÍCULA',        location: 'Bajo la clavícula, a 3 cm de la línea central.',             phrase: 'Me permito sentir esto...' },
    { label: 'BAJO EL BRAZO',    location: 'Costado del torso, a la altura de la axila.',                phrase: 'Y soltarlo poco a poco...' },
    { label: 'CORONILLA',        location: 'Centro de la cabeza.',                                       phrase: 'Estoy bien. Paso a paso.' },
  ];

  let stepIdx = 0;
  let elIdle, elActive, elEnd, elStepNum, elStepLabel, elStepLocation, elStepPhrase;
  let btnStart, btnNext, btnReset, btnRepeat, btnDone;

  function init() {
    if (!document.getElementById('mod-eft')) return;
    elIdle         = document.getElementById('eft-idle');
    elActive       = document.getElementById('eft-active');
    elEnd          = document.getElementById('eft-end');
    elStepNum      = document.getElementById('eft-step-num');
    elStepLabel    = document.getElementById('eft-step-label');
    elStepLocation = document.getElementById('eft-step-location');
    elStepPhrase   = document.getElementById('eft-step-phrase');
    btnStart  = document.getElementById('eft-start');
    btnNext   = document.getElementById('eft-next');
    btnReset  = document.getElementById('eft-reset');
    btnRepeat = document.getElementById('eft-repeat');
    btnDone   = document.getElementById('eft-done');
    btnStart?.addEventListener('click',  startSession);
    btnNext?.addEventListener('click',   nextStep);
    btnReset?.addEventListener('click',  reset);
    btnRepeat?.addEventListener('click', startSession);
    btnDone?.addEventListener('click', () => { elEnd.classList.add('hidden'); elIdle.classList.remove('hidden'); });
  }

  function startSession() {
    stepIdx = 0;
    elIdle.classList.add('hidden'); elEnd.classList.add('hidden'); elActive.classList.remove('hidden');
    applyStep(stepIdx);
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= POINTS.length) { finish(); return; }
    applyStep(stepIdx);
  }

  function applyStep(i) {
    const p = POINTS[i];
    elStepNum.textContent      = `${i + 1} / ${POINTS.length}`;
    elStepLabel.textContent    = p.label;
    elStepLocation.textContent = p.location;
    elStepPhrase.textContent   = p.phrase;
    if (btnNext) btnNext.textContent = i < POINTS.length - 1 ? 'Siguiente punto →' : 'Terminar';
  }

  function reset() {
    stepIdx = 0;
    elActive.classList.add('hidden'); elEnd.classList.add('hidden'); elIdle.classList.remove('hidden');
  }

  function finish() { elActive.classList.add('hidden'); elEnd.classList.remove('hidden'); }
  function destroy() {}

  return { init, destroy };
})();
