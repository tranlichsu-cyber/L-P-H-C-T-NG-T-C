const SW_RELOAD_KEY = 'lhtt_sw_reload_once';

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;

    const alreadyReloaded = sessionStorage.getItem(SW_RELOAD_KEY) === '1';
    if (!alreadyReloaded) {
      sessionStorage.setItem(SW_RELOAD_KEY, '1');
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        // Force an update check on every fresh page load.
        void reg.update();

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              window.dispatchEvent(new CustomEvent('app-update-available'));
            }
          };
        };
      })
      .catch((err) => {
        console.error('Service Worker registration error:', err);
      });
  });

  // Allow a future update to reload once again after this page is stable.
  window.setTimeout(() => {
    sessionStorage.removeItem(SW_RELOAD_KEY);
  }, 10000);
};
