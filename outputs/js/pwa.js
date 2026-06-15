/* PWA — registro del service worker + lógica del modal de instalación */

(function () {

  // Registrar service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // Capturar el evento de instalación nativa (Chrome/Android)
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    // Mostrar botón de instalación nativa si existe
    const btnNative = document.getElementById('pwa-native-btn');
    if (btnNative) btnNative.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const modal = document.getElementById('pwa-modal');
    if (modal) modal.hidden = true;
  });

  // Abrir / cerrar modal
  function openModal() {
    const modal = document.getElementById('pwa-modal');
    if (modal) { modal.hidden = false; document.body.style.overflow = 'hidden'; }
  }

  function closeModal() {
    const modal = document.getElementById('pwa-modal');
    if (modal) { modal.hidden = true; document.body.style.overflow = ''; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pwa-trigger')?.addEventListener('click', openModal);
    document.getElementById('pwa-close')?.addEventListener('click', closeModal);
    document.getElementById('pwa-modal')?.addEventListener('click', e => {
      if (e.target.id === 'pwa-modal') closeModal();
    });

    // Botón de instalación nativa (Chrome/Android)
    document.getElementById('pwa-native-btn')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') closeModal();
      deferredPrompt = null;
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  });

})();
