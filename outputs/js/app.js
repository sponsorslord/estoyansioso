/* ════════════════════════════════════════════════════════════
   estoyansioso.com — App init
   ════════════════════════════════════════════════════════════ */

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    Selector.init();
  });

  function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }
})();
