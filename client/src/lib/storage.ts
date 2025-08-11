export const PWA_STORAGE_KEY = 'office-tracker-pwa';

export interface PWAInstallState {
  prompted: boolean;
  installed: boolean;
  dismissed: boolean;
}

export function getPWAInstallState(): PWAInstallState {
  const stored = localStorage.getItem(PWA_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    prompted: false,
    installed: false,
    dismissed: false,
  };
}

export function setPWAInstallState(state: Partial<PWAInstallState>) {
  const current = getPWAInstallState();
  const updated = { ...current, ...state };
  localStorage.setItem(PWA_STORAGE_KEY, JSON.stringify(updated));
}

export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
}
