/**
 * Haptic Feedback Utility
 * 촉각 피드백 통합 관리
 *
 * OKR 기여:
 * - KR1 (만족도): 프리미엄 촉각 경험 제공
 * - KR2 (재방문율): 즐거운 인터랙션
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic 피드백이 지원되는지 확인
 */
export function isHapticSupported(): boolean {
  // iOS는 항상 지원
  if (Platform.OS === 'ios') return true;

  // Android는 API 레벨 확인 필요 (생략, 대부분 지원)
  return true;
}

/**
 * Impact Feedback (물리적 충격)
 * 버튼 클릭, 스와이프 등에 사용
 */
export const haptic = {
  /**
   * 가벼운 탭 (기본)
   * 사용처: 일반 버튼, 체크박스, 라디오 버튼
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 중간 강도 탭
   * 사용처: 중요 버튼, 모달 열기/닫기
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 강한 탭
   * 사용처: 삭제 버튼, 경고 액션
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 부드러운 탭 (가장 약함)
   * 사용처: 토글, 슬라이더
   */
  soft: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 딱딱한 탭 (가장 강함)
   * 사용처: 중요한 완료 버튼
   */
  rigid: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },
};

/**
 * Notification Feedback (알림)
 * 작업 완료, 에러 등에 사용
 */
export const notification = {
  /**
   * 성공 알림
   * 사용처: 저장 완료, 업로드 완료
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 경고 알림
   * 사용처: 주의 메시지, 확인 필요
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },

  /**
   * 에러 알림
   * 사용처: 실패, 에러 발생
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptic not supported');
    }
  },
};

/**
 * Selection Feedback (선택 변경)
 * 스크롤, 피커 등에 사용
 */
export const selection = {
  /**
   * 선택 변경
   * 사용처: 날짜 피커, 숫자 피커, 슬라이더
   */
  changed: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptic not supported');
    }
  },
};

/**
 * 사용 예시별 권장 Haptic
 */
export const hapticPresets = {
  // 버튼
  button: haptic.light,
  buttonPrimary: haptic.medium,
  buttonDanger: haptic.heavy,

  // 토글/체크박스
  toggle: haptic.soft,
  checkbox: haptic.light,

  // 네비게이션
  tabChange: haptic.light,
  modalOpen: haptic.medium,
  modalClose: haptic.light,

  // 작업 완료
  taskComplete: notification.success,
  taskFailed: notification.error,
  saveSuccess: notification.success,
  deleteSuccess: haptic.heavy,

  // 스크롤/선택
  scrollEnd: haptic.soft,
  pickerChange: selection.changed,
  sliderMove: selection.changed,

  // 경고
  warning: notification.warning,
  error: notification.error,
};

/**
 * 패턴 Haptic (복합)
 * 특별한 인터랙션용
 */
export const hapticPatterns = {
  /**
   * 더블 탭 패턴
   * 사용처: 좋아요 더블 탭
   */
  doubleTap: async () => {
    await haptic.light();
    setTimeout(() => haptic.light(), 100);
  },

  /**
   * 성공 패턴 (3연속)
   * 사용처: 미션 완료, 달성
   */
  successPattern: async () => {
    await haptic.light();
    setTimeout(() => haptic.medium(), 100);
    setTimeout(() => notification.success(), 200);
  },

  /**
   * 에러 패턴 (2연속 강함)
   * 사용처: 심각한 에러
   */
  errorPattern: async () => {
    await haptic.heavy();
    setTimeout(() => notification.error(), 150);
  },

  /**
   * 삭제 확인 패턴
   * 사용처: 삭제 버튼 길게 누르기
   */
  deleteConfirm: async () => {
    await haptic.medium();
    setTimeout(() => haptic.heavy(), 300);
  },
};

/**
 * 컴포넌트별 Haptic 가이드
 *
 * @example
 * // 일반 버튼
 * <Button onPress={() => haptic.light()}>클릭</Button>
 *
 * // 저장 버튼
 * <Button onPress={async () => {
 *   await saveData();
 *   notification.success(); // 저장 완료 피드백
 * }}>저장</Button>
 *
 * // 삭제 버튼
 * <Button onPress={async () => {
 *   haptic.heavy();
 *   await deleteItem();
 *   notification.success();
 * }}>삭제</Button>
 *
 * // 체크박스
 * <Checkbox onToggle={(checked) => {
 *   haptic.soft();
 *   updateValue(checked);
 * }} />
 *
 * // 탭 네비게이션
 * <Tab onPress={() => {
 *   haptic.light();
 *   navigate('/home');
 * }} />
 */

/**
 * Haptic 비활성화 (설정에서 사용)
 */
let hapticEnabled = true;

export function setHapticEnabled(enabled: boolean) {
  hapticEnabled = enabled;
}

export function isHapticEnabled(): boolean {
  return hapticEnabled;
}

/**
 * Safe Haptic (설정 확인 후 실행)
 */
export async function safeHaptic(type: keyof typeof haptic) {
  if (!hapticEnabled) return;
  await haptic[type]();
}

export async function safeNotification(type: keyof typeof notification) {
  if (!hapticEnabled) return;
  await notification[type]();
}
