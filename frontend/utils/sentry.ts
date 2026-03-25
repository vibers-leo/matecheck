// Sentry stub — @sentry/react-native 미설치 상태, 추후 활성화 예정
// OKR KR3: 배포 후 Sentry DSN 설정 시 실제 구현으로 교체

export function initSentry() {}
export function setSentryUser(_userId: string, _email?: string, _nickname?: string) {}
export function clearSentryUser() {}
export function setSentryContext(_nestId?: string, _nestName?: string) {}
export function addSentryBreadcrumb(_category: string, _message: string, _data?: any) {}
export function logErrorToSentry(error: any, _context?: Record<string, any>) {
  if (__DEV__) console.error('[Error]', error);
}
export function logMessageToSentry(_message: string, _level?: 'info' | 'warning' | 'error', _context?: Record<string, any>) {}
export function startSentryTransaction(_name: string, _op?: string) {
  return { finish: () => {} };
}
export function setupNativeCrashReporting() {}
export const Sentry = null;
