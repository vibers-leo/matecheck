// 앱 상수 설정

// API 서버 URL
export const API_URL = 'https://matecheck.vibers.co.kr';

// 앱 정보
export const APP_NAME = '룸메이트체크';
export const APP_SCHEME = 'roommatecheck';

// 색상 상수 (토스 디자인 시스템 기준)
export const COLORS = {
  // 토스 브랜드 색상
  tossBLue: '#3182F6',
  tossBlueLight: '#E8F3FF',
  tossBlueDark: '#1B64DA',

  // 그레이 스케일
  gray50: '#F9FAFB',
  gray100: '#F2F4F6',
  gray200: '#E5E8EB',
  gray300: '#D1D6DB',
  gray400: '#B0B8C1',
  gray500: '#8B95A1',
  gray600: '#6B7684',
  gray700: '#4E5968',
  gray800: '#333D4B',
  gray900: '#191F28',

  // 기능 색상
  white: '#FFFFFF',
  black: '#191F28',
  red: '#F04452',
  green: '#2FC473',
  yellow: '#FFC043',
} as const;

// API 설정
export const CONFIG = {
  API_TIMEOUT: 10000,
  API_RETRY_COUNT: 2,
  API_RETRY_DELAY: 1000,
} as const;
