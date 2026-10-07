export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Dispatch custom event so app UI can display a non-intrusive update badge
                    window.dispatchEvent(new CustomEvent('app-update-available'));
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.error('Service Worker registration error:', err);
        });
    });
  }
};
