import AppMetrica from '@appmetrica/react-native-analytics';
import Constants from 'expo-constants';

const API_KEY = ((Constants.expoConfig?.extra as { appMetricaApiKey?: string } | undefined)?.appMetricaApiKey || '').trim();

let initialized = false;

/**
 * Activates AppMetrica (analytics + native/JS crash reporting).
 * No-ops if no API key is configured (app.json -> expo.extra.appMetricaApiKey).
 */
export function initAnalytics(): void {
  if (!API_KEY || initialized) return;

  AppMetrica.activate({
    apiKey: API_KEY,
    sessionTimeout: 120,
    firstActivationAsUpdate: false,
    crashReporting: true,
    nativeCrashReporting: true,
  });
  initialized = true;

  const errorUtils = (global as { ErrorUtils?: { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils;
  if (errorUtils?.setGlobalHandler && errorUtils.getGlobalHandler) {
    const previousHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      AppMetrica.reportUnhandledException(error);
      previousHandler?.(error, isFatal);
    });
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!initialized) return;
  AppMetrica.reportEvent(name, params);
}

export function reportError(id: string, error: unknown): void {
  if (!initialized) return;
  const message = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
  AppMetrica.reportError(id, message);
}
