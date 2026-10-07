export const APP_VERSION = '1.1.0';
export const IS_PRODUCTION =
  import.meta.env.VITE_APP_ENV === 'production' || import.meta.env.PROD;

export const getAppBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return window.location.origin;
};

// Production Console Guard
if (IS_PRODUCTION) {
  // In production, suppress verbose debug logs to preserve user privacy and clean performance
  const noop = () => {};
  console.debug = noop;
}

export const getAppDiagnostics = () => {
  return {
    version: APP_VERSION,
    environment: import.meta.env.VITE_APP_ENV || (IS_PRODUCTION ? 'production' : 'development'),
    dataMode: import.meta.env.VITE_DATA_MODE || 'firebase',
    baseUrl: getAppBaseUrl(),
    isProduction: IS_PRODUCTION,
  };
};
