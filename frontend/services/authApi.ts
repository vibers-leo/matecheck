/**
 * Authentication API
 * 로그인, 회원가입, 토큰 갱신 등 인증 관련 API 호출
 *
 * OKR 기여:
 * - KR3 (안정성): 안전한 인증 플로우
 * - KR1 (만족도): 빠르고 편리한 로그인/회원가입
 */

import api from './api';
import { saveAuthToken, saveRefreshToken, saveUserCredentials, clearAuthData } from '../utils/auth';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// API 응답 타입
export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar_id: number;
  };
}

export interface SignupResponse {
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar_id: number;
  };
}

/**
 * 로그인
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/login', {
      email,
      password,
    });

    // 토큰 저장
    if (response.token) {
      await saveAuthToken(response.token);
    }

    if (response.refresh_token) {
      await saveRefreshToken(response.refresh_token);
    }

    // 사용자 정보 저장
    if (response.user) {
      await saveUserCredentials(response.user.id, response.user.email);
    }

    showSuccessToast('로그인되었습니다!', `환영합니다, ${response.user.nickname}님`);

    return response;
  } catch (error) {
    // API 클라이언트가 자동으로 Toast 표시
    throw error;
  }
};

/**
 * 회원가입
 */
export const signup = async (
  email: string,
  password: string,
  passwordConfirmation: string,
  nickname: string
): Promise<SignupResponse> => {
  try {
    const response = await api.post<SignupResponse>('/signup', {
      email,
      password,
      password_confirmation: passwordConfirmation,
      nickname,
    });

    // 토큰 저장
    if (response.token) {
      await saveAuthToken(response.token);
    }

    if (response.refresh_token) {
      await saveRefreshToken(response.refresh_token);
    }

    // 사용자 정보 저장
    if (response.user) {
      await saveUserCredentials(response.user.id, response.user.email);
    }

    showSuccessToast('회원가입이 완료되었습니다!', `환영합니다, ${response.user.nickname}님`);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택 사항)
    // await api.post('/logout');

    // 로컬 토큰 삭제
    await clearAuthData();

    showSuccessToast('로그아웃되었습니다.');
  } catch (error) {
    // 에러가 발생해도 로컬 토큰은 삭제
    await clearAuthData();
    console.error('Logout error:', error);
  }
};

/**
 * 토큰 갱신
 * Refresh Token을 사용하여 새로운 Access Token 발급
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await api.post<{ token: string }>('/refresh', {
      refresh_token: refreshToken,
    }, {
      showErrorToast: false, // 자동 에러 Toast 비활성화
    });

    // 새 토큰 저장
    if (response.token) {
      await saveAuthToken(response.token);
    }

    return response.token;
  } catch (error) {
    // Refresh Token도 만료됨 → 재로그인 필요
    await clearAuthData();
    showErrorToast('세션이 만료되었습니다. 다시 로그인해주세요.');
    throw error;
  }
};

/**
 * 비밀번호 변경
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
): Promise<void> => {
  try {
    await api.put('/users/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });

    showSuccessToast('비밀번호가 변경되었습니다.');
  } catch (error) {
    throw error;
  }
};

/**
 * 계정 삭제
 */
export const deleteAccount = async (password: string): Promise<void> => {
  try {
    await api.delete('/users', {
      body: { password },
    });

    // 로컬 데이터 삭제
    await clearAuthData();

    showSuccessToast('계정이 삭제되었습니다.');
  } catch (error) {
    throw error;
  }
};
