// 테마 유틸리티 — 중복 테마 코드 제거용
import { THEMES } from '../constants/data';

/**
 * nestTheme와 appMode에 따라 테마 클래스명을 반환
 * 각 탭 화면에서 반복되는 테마 로직을 통합
 */
export function getThemeColors(nestTheme: string, appMode: string) {
  const isToss = appMode === 'roommatecheck';
  const theme = THEMES[nestTheme];

  return {
    bg: isToss ? 'bg-toss-blue' : (theme?.color || 'bg-orange-500'),
    text: isToss ? 'text-toss-blue' : (theme?.color?.replace('bg-', 'text-') || 'text-orange-600'),
    bgSoft: isToss ? 'bg-blue-50' : (theme?.bg || 'bg-orange-50'),
    border: isToss ? 'border-toss-blue' : (theme?.color?.replace('bg-', 'border-') || 'border-orange-500'),
    isToss,
  };
}
