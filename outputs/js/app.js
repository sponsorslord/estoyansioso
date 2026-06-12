/* ════════════════════════════════════════════════════════════
   estoyansioso.com — Main app
   ════════════════════════════════════════════════════════════ */

(() => {

  /* ── Init all modules ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    BreathingModule.init();
    ColdWaterModule.init();
    ButterflyModule.init();
    GroundingModule.init();

    initNav();
    initModal();
    initMetricDots();
  });

  /* ── Nav scroll behavior ──────────────────────────────── */
  function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Anxiety level modal ──────────────────────────────── */
  function initModal() {
    const modal      = document.getElementById('anxiety-modal');
    const btnNav     = document.getElementById('anxiety-btn');
    const btnHero    = document.getElementById('hero-anxiety-btn');
    const btnClose   = modal?.querySelector('.modal-close');
    const backdrop   = modal?.querySelector('.modal-backdrop');
    const options    = modal?.querySelectorAll('.modal-option');

    if (!modal) return;

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      btnClose?.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    btnNav?.addEventListener('click',     openModal);
    btnHero?.addEventListener('click',    openModal);
    btnClose?.addEventListener('click',   closeModal);
    backdrop?.addEventListener('click',   closeModal);

    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    options?.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        closeModal();
        const section = document.getElementById(target);
        if (section) {
          setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    });
  }

  /* ── Render metric dots ───────────────────────────────── */
  function initMetricDots() {
    document.querySelectorAll('.metric-dots[data-score]').forEach(el => {
      const score = parseInt(el.dataset.score, 10);
      let html = '';
      for (let i = 1; i <= 5; i++) {
        html += `<span class="metric-dot ${i <= score ? '' : 'empty'}" aria-hidden="true"></span>`;
      }
      el.innerHTML = html;
      el.setAttribute('aria-label', `Efecto: ${score} de 5`);
    });
  }

})();
