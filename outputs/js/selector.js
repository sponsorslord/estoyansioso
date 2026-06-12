/* ════════════════════════════════════════════════════════════
   Selector inteligente — filtros + grid de cards
   ════════════════════════════════════════════════════════════ */

const Selector = (() => {

  let activeFilters = { urgency: null, target: null, time: null };
  let expandedCardId = null;
  let gridEl, resultsHeader, resultsCountEl, btnClear, showAllWrapper;

  /* ── Wiring: module ID → interactive handler ─────────────── */
  const handlers = {
    'box-breathing': {
      getHTML:   getBreathingHTML,
      onExpand:  () => BreathingModule.init(),
      onCollapse:() => BreathingModule.destroy?.(),
    },
    'cold-water': {
      getHTML:   getColdWaterHTML,
      onExpand:  () => ColdWaterModule.init(),
      onCollapse:() => ColdWaterModule.destroy?.(),
    },
    'butterfly-hug': {
      getHTML:   getButterflyHTML,
      onExpand:  () => ButterflyModule.init(),
      onCollapse:() => ButterflyModule.destroy?.(),
    },
    'grounding-54321': {
      getHTML:   getGroundingHTML,
      onExpand:  () => GroundingModule.init(),
      onCollapse:() => GroundingModule.destroy?.(),
    },
    'music': {
      getHTML:   getMusicHTML,
      onExpand:  () => initMusicTabs(),
      onCollapse:() => {},
    },
  };

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    gridEl        = document.getElementById('modules-grid');
    resultsHeader = document.getElementById('results-header');
    resultsCountEl= document.getElementById('results-count');
    btnClear      = document.getElementById('btn-clear-filters');
    showAllWrapper= document.querySelector('.show-all-wrapper');

    if (!gridEl) return;

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => toggleChip(chip));
    });

    document.querySelectorAll('.triage-btn').forEach(btn => {
      btn.addEventListener('click', () => handleTriage(btn.dataset.urgency));
    });

    document.getElementById('btn-show-all')?.addEventListener('click', () => {
      if (showAllWrapper) showAllWrapper.hidden = true;
      renderCards(MODULES_DATA);
      updateUI(MODULES_DATA, false);
    });

    btnClear?.addEventListener('click', clearFilters);

    renderCards(MODULES_DATA);
    updateUI(MODULES_DATA, false);
  }

  /* ── Filter logic ─────────────────────────────────────────── */
  function toggleChip(chip) {
    const { dim, val } = chip.dataset;
    const wasSame = activeFilters[dim] === val;
    document.querySelectorAll(`.chip[data-dim="${dim}"]`).forEach(c => c.classList.remove('active'));
    activeFilters[dim] = wasSame ? null : val;
    if (!wasSame) chip.classList.add('active');
    if (dim === 'urgency') syncTriageButtons();
    render();
  }

  function handleTriage(urgency) {
    const wasSame = activeFilters.urgency === urgency;
    document.querySelectorAll('.chip[data-dim="urgency"]').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.triage-btn').forEach(b => b.classList.remove('active'));
    activeFilters.urgency = wasSame ? null : urgency;
    if (!wasSame) {
      document.querySelector(`.chip[data-dim="urgency"][data-val="${urgency}"]`)?.classList.add('active');
      document.querySelector(`.triage-btn[data-urgency="${urgency}"]`)?.classList.add('active');
    }
    document.getElementById('selector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(render, 50);
  }

  function clearFilters() {
    activeFilters = { urgency: null, target: null, time: null };
    document.querySelectorAll('.chip.active, .triage-btn.active').forEach(el => el.classList.remove('active'));
    render();
  }

  function syncTriageButtons() {
    document.querySelectorAll('.triage-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.urgency === activeFilters.urgency);
    });
  }

  function getFiltered() {
    return MODULES_DATA.filter(m => {
      if (activeFilters.urgency && !m.urgency.includes(activeFilters.urgency)) return false;
      if (activeFilters.target && !m.target.includes(activeFilters.target)) return false;
      if (activeFilters.time   && m.time !== activeFilters.time)              return false;
      return true;
    });
  }

  function hasFilter() {
    return !!(activeFilters.urgency || activeFilters.target || activeFilters.time);
  }

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    const filtered   = getFiltered();
    const isFiltered = hasFilter();

    if (expandedCardId && !filtered.find(m => m.id === expandedCardId)) {
      collapseCard(true);
    }

    renderCards(filtered);
    updateUI(filtered, isFiltered);
  }

  function renderCards(modules) {
    if (!gridEl) return;

    // Destroy running module before clearing DOM
    if (expandedCardId && modules.find(m => m.id === expandedCardId)) {
      handlers[expandedCardId]?.onCollapse?.();
    }

    gridEl.innerHTML = '';

    modules.forEach((mod, i) => {
      const card = buildCard(mod);
      card.style.animationDelay = `${i * 40}ms`;

      if (mod.id === expandedCardId) {
        card.classList.add('expanded');
        card.querySelector('.card-header').setAttribute('aria-expanded', 'true');
        const h = handlers[mod.id];
        const contentEl = card.querySelector('.card-content');
        contentEl.innerHTML = buildContentHTML(mod, h);
        contentEl.hidden = false;
        if (h) requestAnimationFrame(() => h.onExpand());
      }

      gridEl.appendChild(card);
    });
  }

  function updateUI(modules, isFiltered) {
    if (resultsHeader) resultsHeader.hidden = !isFiltered;
    if (resultsCountEl && isFiltered) {
      resultsCountEl.textContent = modules.length === 0
        ? 'Ningún ejercicio coincide'
        : `${modules.length} ${modules.length === 1 ? 'ejercicio' : 'ejercicios'}`;
    }
  }

  /* ── Card builder ─────────────────────────────────────────── */
  function getBadge(mod) {
    if (mod.urgency.includes('alta'))        return { label: 'Urgente',  cls: 'badge-urgent' };
    if (mod.urgency.includes('media'))       return { label: 'Moderado', cls: 'badge-moderate' };
    return { label: 'Relajado', cls: 'badge-calm' };
  }

  function buildCard(mod) {
    const card = document.createElement('article');
    card.className = 'module-card';
    card.dataset.moduleId = mod.id;
    card.setAttribute('role', 'listitem');

    const badge = getBadge(mod);
    const dots  = Array.from({ length: 5 }, (_, i) =>
      `<span class="effect-dot${i < mod.effect ? ' on' : ''}"></span>`
    ).join('');

    card.innerHTML = `
      <div class="card-header" role="button" tabindex="0" aria-expanded="false" aria-label="Abrir: ${mod.name}">
        <div class="card-header-top">
          <span class="card-emoji" aria-hidden="true">${mod.emoji}</span>
          <span class="card-badge ${badge.cls}">${badge.label}</span>
        </div>
        <div class="card-name">${mod.name}</div>
        <div class="card-footer-row">
          <span class="card-meta">${mod.timeLabel} · ${badge.label}</span>
          <span class="card-effect" aria-label="Efectividad: ${mod.effect} de 5">${dots}</span>
        </div>
      </div>
      <div class="card-content" hidden></div>
    `;

    const header = card.querySelector('.card-header');
    header.addEventListener('click',   () => toggleCard(mod.id));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(mod.id); }
    });

    return card;
  }

  function buildContentHTML(mod, handler) {
    const phraseHTML = mod.openingPhrase
      ? `<p class="module-phrase">"${mod.openingPhrase}"</p>` : '';
    const bodyHTML = handler ? handler.getHTML() : getStaticHTML(mod);
    return `<div class="card-content-inner">${phraseHTML}${bodyHTML}</div>`;
  }

  /* ── Card expand / collapse ──────────────────────────────── */
  function toggleCard(moduleId) {
    expandedCardId === moduleId ? collapseCard() : (expandedCardId && collapseCard(true), expandCard(moduleId));
  }

  function expandCard(moduleId) {
    expandedCardId = moduleId;
    const card = gridEl.querySelector(`[data-module-id="${moduleId}"]`);
    if (!card) return;

    card.classList.add('expanded');
    card.querySelector('.card-header').setAttribute('aria-expanded', 'true');

    const h = handlers[moduleId];
    const mod = MODULES_DATA.find(m => m.id === moduleId);
    const contentEl = card.querySelector('.card-content');
    contentEl.innerHTML = buildContentHTML(mod, h);
    contentEl.hidden = false;

    if (h) requestAnimationFrame(() => h.onExpand());
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  }

  function collapseCard(silent = false) {
    if (!expandedCardId) return;
    const card = gridEl?.querySelector(`[data-module-id="${expandedCardId}"]`);
    if (card) {
      handlers[expandedCardId]?.onCollapse?.();
      card.classList.remove('expanded');
      card.querySelector('.card-header').setAttribute('aria-expanded', 'false');
      const contentEl = card.querySelector('.card-content');
      contentEl.hidden = true;
      contentEl.innerHTML = '';
    }
    expandedCardId = null;
  }

  /* ════════════════════════════════════════════════════════════
     HTML templates
     ════════════════════════════════════════════════════════════ */

  function getBreathingHTML() {
    return `
<div id="mod-box">
  <div class="breath-tabs" role="tablist" aria-label="Variante de respiración">
    <button class="breath-tab active" data-mode="box"  role="tab" aria-selected="true">4-4-4-4</button>
    <button class="breath-tab"        data-mode="478"  role="tab" aria-selected="false">4-7-8</button>
    <button class="breath-tab"        data-mode="sigh" role="tab" aria-selected="false">Suspiro</button>
  </div>

  <div id="box-idle">
    <p class="mod-idle-text" id="box-idle-desc">5 ciclos de 4-4-4-4 · 90 segundos</p>
    <button id="box-start" class="btn-primary">Empezar respiración</button>
  </div>

  <div id="box-active" class="hidden">
    <div id="box-overlay-wrap" class="breath-container">
      <div class="breath-bg-overlay" id="box-overlay"></div>
      <div class="breath-outer" id="box-ring-outer" style="--breath-dur:4s">
        <div class="breath-mid">
          <div class="breath-inner">
            <div id="box-label"    class="breath-phase-label">INHALÁ</div>
            <div id="box-counter"  class="breath-counter"     aria-live="polite">4</div>
            <div id="box-sublabel" class="breath-sublabel">por la nariz</div>
          </div>
        </div>
      </div>
    </div>
    <p id="box-instruction" class="breath-instruction"></p>
    <div id="box-cycles" class="breath-cycles" aria-live="polite"></div>
    <div class="controls-row">
      <button id="box-pause" class="btn-secondary">⏸ Pausar</button>
      <button id="box-reset" class="btn-secondary">Reiniciar</button>
    </div>
  </div>

  <div id="box-end" class="hidden mod-end">
    <p>Completaste los ciclos. Bien hecho.</p>
    <div class="end-actions">
      <button id="box-repeat" class="btn-primary" style="width:auto;padding:10px 24px">Repetir</button>
      <button id="box-done"   class="btn-secondary">Cerrar</button>
    </div>
  </div>
</div>`;
  }

  function getColdWaterHTML() {
    return `
<div id="mod-water">
  <div id="water-idle">
    <p class="mod-idle-text">Andá al grifo. Agua fría en cara y frente durante 30 segundos.</p>
    <button id="water-start" class="btn-primary">Iniciar cuenta regresiva</button>
  </div>
  <div id="water-active" class="hidden">
    <div id="water-count" class="water-count" aria-live="polite">30</div>
    <div class="water-bar-wrap"><div id="water-bar" class="water-bar"></div></div>
    <p id="water-msg" class="water-msg"></p>
    <div class="controls-row" style="margin-top:20px">
      <button id="water-reset" class="btn-secondary">Reiniciar</button>
    </div>
  </div>
  <div id="water-end" class="hidden mod-end">
    <p>Listo. El reflejo de buceo bajó tu ritmo cardíaco.</p>
    <div class="end-actions">
      <button id="water-repeat" class="btn-primary" style="width:auto;padding:10px 24px">Repetir</button>
      <button id="water-done"   class="btn-secondary">Cerrar</button>
    </div>
  </div>
</div>`;
  }

  function getButterflyHTML() {
    return `
<div id="mod-butterfly">
  <div class="butterfly-illustration">
    <svg viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="28" r="18" fill="#EEF4EB" stroke="#7A9E7E" stroke-width="1.5"/>
      <circle cx="54" cy="25" r="2.5" fill="#7A9E7E" opacity=".8"/>
      <circle cx="66" cy="25" r="2.5" fill="#7A9E7E" opacity=".8"/>
      <path d="M54 33 Q60 37 66 33" stroke="#7A9E7E" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <rect x="44" y="48" width="32" height="52" rx="16" fill="#EEF4EB" stroke="#3D6B4A" stroke-width="1.5"/>
      <path d="M44 62 Q26 72 37 88 Q44 96 60 90" stroke="#7A9E7E" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M76 62 Q94 72 83 88 Q76 96 60 90" stroke="#3D6B4A" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="54" cy="88" rx="11" ry="7" fill="#7A9E7E" opacity=".3"/>
      <ellipse cx="66" cy="83" rx="11" ry="7" fill="#3D6B4A" opacity=".3"/>
      <path d="M50 100 L47 132" stroke="#3D6B4A" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 100 L73 132" stroke="#3D6B4A" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <p>Cruzá los brazos sobre el pecho como en la imagen.<br>Los pulgares entrelazados, manos sobre hombros opuestos.</p>
  </div>
  <div id="butterfly-idle">
    <button id="butterfly-start" class="btn-primary">Comenzar</button>
  </div>
  <div id="butterfly-active" class="hidden">
    <div id="bf-step-card" class="bf-step-card">
      <div id="bf-step-num"  class="bf-step-num">1 / 4</div>
      <div id="bf-step-label" class="bf-step-label">CRUZÁ</div>
      <div id="bf-step-desc"  class="bf-step-desc"></div>
    </div>
    <div class="butterfly-taps">
      <div id="tap-left"  class="tap-indicator" aria-hidden="true">✋</div>
      <div id="tap-right" class="tap-indicator" aria-hidden="true">✋</div>
    </div>
    <div class="wings">
      <span id="wing-left"  class="wing">🦋</span>
      <span id="wing-right" class="wing wing-right">🦋</span>
    </div>
    <div class="controls-row">
      <button id="butterfly-pause" class="btn-secondary">⏸ Pausar</button>
      <button id="butterfly-reset" class="btn-secondary">Reiniciar</button>
    </div>
  </div>
  <div id="butterfly-end" class="hidden mod-end">
    <p>Secuencia completa. ¿Cómo te sentís ahora?</p>
    <div class="end-actions">
      <button id="butterfly-repeat" class="btn-primary" style="width:auto;padding:10px 24px">Repetir</button>
      <button id="butterfly-done"   class="btn-secondary">Cerrar</button>
    </div>
  </div>
</div>`;
  }

  function getGroundingHTML() {
    return `
<div id="mod-grounding">
  <div id="grounding-idle">
    <p class="mod-idle-text">5 pasos · 3 a 5 minutos. Te trae al presente usando los 5 sentidos.</p>
    <button id="grounding-start" class="btn-primary">Comenzar grounding</button>
  </div>
  <div id="grounding-active" class="hidden">
    <div id="grounding-progress" class="grounding-progress" aria-live="polite"></div>
    <div id="grounding-step-card" class="grounding-step-card">
      <span id="g-emoji"        class="g-emoji">👁️</span>
      <div  id="g-count"        class="g-count">5 COSAS</div>
      <p    id="g-instruction"  class="g-instruction"></p>
      <textarea id="g-input" class="grounding-input" rows="2" placeholder=""></textarea>
    </div>
    <button id="grounding-next" class="btn-primary" style="margin-top:12px">Listo, siguiente →</button>
  </div>
  <div id="grounding-end" class="hidden mod-end">
    <p>Completaste el grounding. Estás acá, en el presente.</p>
    <div class="end-actions">
      <button id="grounding-repeat" class="btn-primary" style="width:auto;padding:10px 24px">Repetir</button>
      <button id="grounding-done"   class="btn-secondary">Cerrar</button>
    </div>
  </div>
</div>`;
  }

  function getMusicHTML() {
    const cats = [
      { id: 'lofi',     label: 'Lo-fi',    videos: [
        { id: 'CFGLoQIhmow', label: 'Lofi Girl mix' },
        { id: 'lA9FONoiuFA', label: 'Best of Lofi 2024' },
        { id: 'lTRiuFIWV54', label: '1 A.M Study Session' },
      ]},
      { id: 'rain',     label: 'Lluvia',   videos: [
        { id: 'zC4nzOl6xLQ', label: 'Lluvia 1 hora' },
        { id: 'hzAxtosyeNQ', label: 'Lluvia intensa' },
      ]},
      { id: 'binaural', label: 'Binaural', videos: [
        { id: 'WPni755-Krg', label: 'Ondas Alpha 10 Hz' },
        { id: 'A4ANOsRoWGY', label: 'Ondas Theta' },
      ]},
      { id: 'noise',    label: 'Ruido',    videos: [
        { id: 'HJMnIfd6Lcg', label: 'Ruido marrón' },
        { id: 'MT0Ta_Qldrs', label: 'Ruido profundo' },
      ]},
      { id: 'piano',    label: 'Piano',    videos: [
        { id: 'Dx5qFachd3A', label: 'Jazz relajante' },
        { id: '2OEL4P1Rz04', label: 'Piano calmante' },
      ]},
    ];

    const tabs = cats.map((c, i) =>
      `<button class="music-tab${i === 0 ? ' active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${i === 0}">${c.label}</button>`
    ).join('');

    const panels = cats.map((c, i) => {
      const iframes = c.videos.map(v => `
<div class="music-item">
  <iframe src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&autoplay=0"
    title="${v.label}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen loading="lazy" frameborder="0"></iframe>
  <div class="music-label">${v.label}</div>
</div>`).join('');
      return `<div class="music-panel${i === 0 ? '' : ' hidden'}" data-cat="${c.id}">${iframes}</div>`;
    }).join('');

    return `
<div id="mod-music">
  <p class="mod-idle-text" style="text-align:left;margin-bottom:16px">Elegí una categoría. Usá auriculares para binaural y ruido.</p>
  <div class="music-tabs" role="tablist">${tabs}</div>
  <div class="music-panels">${panels}</div>
  <p class="static-note">Todos los videos tienen duración fija. Verificado: ninguno es livestream.</p>
</div>`;
  }

  function initMusicTabs() {
    const container = document.getElementById('mod-music');
    if (!container) return;
    container.querySelectorAll('.music-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.cat;
        container.querySelectorAll('.music-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        container.querySelectorAll('.music-panel').forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        container.querySelector(`.music-panel[data-cat="${cat}"]`)?.classList.remove('hidden');
      });
    });
  }

  function getStaticHTML(mod) {
    if (!mod) return '';
    return `
<div class="static-module">
  <p style="font-size:15px;color:var(--color-text-muted);line-height:1.7;margin-bottom:16px">${mod.description}</p>
  <p class="static-note">Podés practicar esta técnica sin guía. Próximamente con ejercicio interactivo.</p>
</div>`;
  }

  return { init };
})();
