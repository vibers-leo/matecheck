/**
 * App Configuration
 * 환경 변수를 통해 API URL 및 기타 설정을 관리합니다
 *
 * 환경 변수는 .env 파일에서 관리됩니다
 * - 개발: EXPO_PUBLIC_API_URL
 * - 프로덕션: EXPO_PUBLIC_API_URL_PRODUCTION
 *
 * Note: React Native에서는 window.location이 없으므로
 * EXPO_PUBLIC_APP_ENV 환경 변수로 환경을 구분합니다
 */

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
const IS_DEV = APP_ENV === 'development';
const IS_PREVIEW = APP_ENV === 'preview';
const IS_PRODUCTION = APP_ENV === 'production';

// API URL 설정
export const API_URL = IS_PRODUCTION
  ? (process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'http://matecheck.vibers.co.kr')
  : (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000');

// 환경별 설정
export const CONFIG = {
  API_URL,
  APP_ENV,
  IS_DEV,
  IS_PREVIEW,
  IS_PRODUCTION,

  // Feature Flags
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',

  // API Timeouts
  API_TIMEOUT: IS_DEV ? 30000 : 10000, // 개발: 30초, 프로덕션: 10초

  // Retry Configuration
  API_RETRY_COUNT: IS_DEV ? 1 : 3,
  API_RETRY_DELAY: 1000, // 1초
} as const;

// 디버깅용 로그 (개발 환경에서만)
if (IS_DEV && __DEV__) {
  console.log('🔧 App Configuration:', {
    API_URL,
    APP_ENV,
    ENABLE_ANALYTICS: CONFIG.ENABLE_ANALYTICS,
    ENABLE_CRASH_REPORTING: CONFIG.ENABLE_CRASH_REPORTING,
  });
}

// Android Expo Go에서 localhost 접속 시 주의사항
if (IS_DEV && API_URL.includes('localhost')) {
  console.warn(
    '⚠️ Android Expo Go에서는 localhost 대신 컴퓨터의 로컬 IP 주소를 사용해야 합니다.\n' +
    '예: http://192.168.x.x:3000\n' +
    '.env 파일의 EXPO_PUBLIC_API_URL을 수정하세요.'
  );
}
