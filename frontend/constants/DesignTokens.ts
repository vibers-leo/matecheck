/**
 * Design Tokens - Toss Design System (TDS) 기반
 *
 * 모든 UI 컴포넌트에서 일관된 디자인을 위한 단일 소스
 *
 * OKR 기여:
 * - KR1 (만족도): 일관된 디자인으로 전문성 향상
 * - 코드 품질: 중복 제거, 유지보수성 향상
 */

/**
 * 색상 시스템
 * Toss Design System 기반
 */
export const TDS_COLORS = {
  // Primary Colors
  blue: '#3182F6',
  blueLight: '#EBF4FF',

  // Grayscale (900 → 50, 어두운 것부터 밝은 것까지)
  grey900: '#191F28',
  grey800: '#333D4B',
  grey700: '#4E5968',
  grey600: '#6B7684',
  grey500: '#8B95A1',
  grey400: '#B0B8C1',
  grey300: '#D1D5DB',
  grey200: '#E5E8EB',
  grey100: '#F2F4F6',
  grey50: '#F9FAFB',

  // Semantic Colors
  white: '#FFFFFF',
  red: '#F04452',
  success: '#2DA07A',
  error: '#F04452',
} as const;

/**
 * 타이포그래피 시스템
 * 폰트 크기, 가중치, letter-spacing을 정의
 */
export const TDS_TYPOGRAPHY = {
  // Display (가장 큰 텍스트)
  display1: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    letterSpacing: -0.5
  },
  display2: {
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: -0.5
  },

  // Heading (제목)
  h1: {
    fontSize: 20,
    fontWeight: 'bold' as const
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold' as const
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold' as const
  },

  // Body (본문)
  body1: {
    fontSize: 15,
    fontWeight: '600' as const
  },
  body2: {
    fontSize: 14,
    fontWeight: '500' as const
  },

  // Caption (작은 텍스트)
  caption1: {
    fontSize: 13,
    fontWeight: '600' as const
  },
  caption2: {
    fontSize: 12,
    fontWeight: 'bold' as const
  },
  caption3: {
    fontSize: 11,
    fontWeight: 'bold' as const
  },
  tiny: {
    fontSize: 10,
    fontWeight: 'bold' as const
  },
} as const;

/**
 * 스페이싱 시스템
 * 일관된 여백/패딩을 위한 값
 */
export const TDS_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

/**
 * Border Radius 시스템
 * 일관된 모서리 둥글기
 */
export const TDS_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
} as const;

/**
 * Shadow (Elevation) 시스템
 * 카드/모달의 그림자 효과 (iOS shadowOpacity + Android elevation 포함)
 */
export const TDS_SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  // 프리미엄 카드용 (파란색 그림자)
  premium: {
    shadowColor: '#3182F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
} as const;

/**
 * Elevation Presets
 * 용도별로 미리 정의된 그림자 스타일
 */
export const TDS_ELEVATION = {
  // 일반 카드 (home, plan, budget 등)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  // 눌렸을 때 카드
  cardPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  // 떠있는 카드 (모달, 팝업)
  cardFloating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  // Floating Action Button (FAB)
  fab: {
    shadowColor: TDS_COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  // FAB 눌렸을 때
  fabPressed: {
    shadowColor: TDS_COLORS.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // 없음 (flat 디자인)
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

/**
 * 헬퍼 타입
 * TypeScript 자동완성을 위한 타입 정의
 */
export type TDSColor = keyof typeof TDS_COLORS;
export type TDSTypography = keyof typeof TDS_TYPOGRAPHY;
export type TDSSpacing = keyof typeof TDS_SPACING;
export type TDSRadius = keyof typeof TDS_RADIUS;
export type TDSShadow = keyof typeof TDS_SHADOW;
export type TDSElevation = keyof typeof TDS_ELEVATION;
