/**
 * Toast 메시지 유틸리티
 * react-native-toast-message를 래핑하여 일관된 Toast UI 제공
 *
 * OKR 기여:
 * - KR1 (만족도): 사용자에게 명확한 피드백 제공
 * - KR3 (안정성): 에러 상황을 사용자 친화적으로 전달
 */

import Toast, { ToastShowParams } from 'react-native-toast-message';

// Toast 타입 정의
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
  position?: 'top' | 'bottom';
}

/**
 * Toast 메시지 표시 (기본)
 */
const showToast = (
  type: ToastType,
  options: ToastOptions
) => {
  const { title, message, duration = 3000, position = 'top' } = options;

  Toast.show({
    type,
    text1: title,
    text2: message,
    position,
    visibilityTime: duration,
    autoHide: true,
    topOffset: 60,
    bottomOffset: 40,
  } as ToastShowParams);
};

/**
 * 성공 Toast
 *
 * @example
 * showSuccessToast('할 일이 추가되었습니다!');
 * showSuccessToast('저장 완료', '변경사항이 성공적으로 저장되었습니다.');
 */
export const showSuccessToast = (message: string, title?: string) => {
  showToast('success', {
    title: title || '✅ 성공',
    message,
  });
};

/**
 * 에러 Toast
 *
 * @example
 * showErrorToast('네트워크 오류가 발생했습니다.');
 * showErrorToast('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
 */
export const showErrorToast = (message: string, title?: string) => {
  showToast('error', {
    title: title || '❌ 오류',
    message,
    duration: 4000, // 에러는 조금 더 길게 표시
  });
};

/**
 * 정보 Toast
 *
 * @example
 * showInfoToast('새로운 업데이트가 있습니다.');
 */
export const showInfoToast = (message: string, title?: string) => {
  showToast('info', {
    title: title || 'ℹ️ 안내',
    message,
  });
};

/**
 * 경고 Toast
 *
 * @example
 * showWarningToast('입력하지 않은 항목이 있습니다.');
 */
export const showWarningToast = (message: string, title?: string) => {
  showToast('warning', {
    title: title || '⚠️ 주의',
    message,
  });
};

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 *
 * @example
 * try {
 *   await fetch(...);
 * } catch (error) {
 *   showApiError(error);
 * }
 */
export const showApiError = (error: unknown, customMessage?: string) => {
  let message = customMessage || '요청 처리 중 오류가 발생했습니다.';

  if (error instanceof Error) {
    // 네트워크 오류
    if (error.message.includes('Network')) {
      message = '네트워크 연결을 확인해주세요.';
    }
    // 타임아웃 오류
    else if (error.message.includes('timeout')) {
      message = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    // 기타 에러 (개발 모드에서는 실제 메시지 표시)
    else if (__DEV__) {
      message = error.message;
    }
  }

  showErrorToast(message);

  // 개발 모드에서는 콘솔에도 출력
  if (__DEV__) {
    console.error('API Error:', error);
  }
};

/**
 * 로딩 Toast (자동으로 사라지지 않음)
 *
 * @example
 * const hide = showLoadingToast('데이터를 불러오는 중...');
 * // ... API 호출 ...
 * hide(); // 로딩 완료 시 숨김
 */
export const showLoadingToast = (message: string = '처리 중...') => {
  Toast.show({
    type: 'info',
    text2: message,
    position: 'top',
    visibilityTime: 0, // 자동으로 사라지지 않음
    autoHide: false,
  } as ToastShowParams);

  // 숨기기 함수 반환
  return () => Toast.hide();
};

/**
 * Toast 숨기기
 */
export const hideToast = () => {
  Toast.hide();
};

/**
 * 유효성 검사 에러 Toast
 *
 * @example
 * if (!title.trim()) {
 *   showValidationError('제목을 입력해주세요.');
 *   return;
 * }
 */
export const showValidationError = (message: string) => {
  showWarningToast(message, '입력 확인');
};
