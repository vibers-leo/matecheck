/**
 * Authentication Utilities
 * JWT 토큰 관리 및 암호화된 저장소 사용
 *
 * OKR 기여:
 * - KR3 (안정성): 보안 강화, 안전한 토큰 저장
 * - KR1 (만족도): 자동 로그인, 세션 유지
 */

import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';

// SecureStore 키 상수
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const USER_EMAIL_KEY = 'user_email';

/**
 * JWT 토큰 저장
 * 안전한 암호화된 저장소(Keychain/Keystore)에 저장
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    // API 클라이언트에도 토큰 설정
    setAuthToken(token);

    if (__DEV__) {
      console.log('✅ Auth token saved securely');
    }
  } catch (error) {
    console.error('Failed to save auth token:', error);
    throw error;
  }
};

/**
 * Refresh Token 저장
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);

    if (__DEV__) {
      console.log('✅ Refresh token saved securely');
    }
  } catch (error) {
    console.error('Failed to save refresh token:', error);
    throw error;
  }
};

/**
 * 사용자 정보 저장 (선택 사항)
 */
export const saveUserCredentials = async (userId: string, email: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);

    if (__DEV__) {
      console.log('✅ User credentials saved securely');
    }
  } catch (error) {
    console.error('Failed to save user credentials:', error);
  }
};

/**
 * JWT 토큰 로드
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

    // API 클라이언트에도 토큰 설정
    if (token) {
      setAuthToken(token);
    }

    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Refresh Token 로드
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

/**
 * 사용자 정보 로드
 */
export const getUserCredentials = async (): Promise<{ userId: string | null; email: string | null }> => {
  try {
    const userId = await SecureStore.getItemAsync(USER_ID_KEY);
    const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
    return { userId, email };
  } catch (error) {
    console.error('Failed to get user credentials:', error);
    return { userId: null, email: null };
  }
};

/**
 * 모든 인증 데이터 삭제 (로그아웃)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_ID_KEY),
      SecureStore.deleteItemAsync(USER_EMAIL_KEY),
    ]);

    // API 클라이언트에서도 토큰 제거
    setAuthToken(null);

    if (__DEV__) {
      console.log('✅ Auth data cleared');
    }
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * 토큰 유효성 검사 (만료 체크)
 * JWT 디코딩하여 exp 필드 확인
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    // JWT는 header.payload.signature 형식
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Payload 디코딩 (Base64)
    const payload = JSON.parse(atob(parts[1]));

    // 만료 시간 체크 (exp는 초 단위 Unix 타임스탬프)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }

    return true; // exp가 없으면 유효하다고 간주
  } catch (error) {
    console.error('Failed to validate token:', error);
    return false;
  }
};

/**
 * 자동 로그인 체크
 * 앱 시작 시 저장된 토큰 확인 및 유효성 검사
 */
export const checkAutoLogin = async (): Promise<{
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  email: string | null;
}> => {
  try {
    const token = await getAuthToken();

    // 토큰이 없거나 만료됨
    if (!token || !isTokenValid(token)) {
      await clearAuthData();
      return { isLoggedIn: false, token: null, userId: null, email: null };
    }

    // 사용자 정보 로드
    const { userId, email } = await getUserCredentials();

    if (__DEV__) {
      console.log('✅ Auto login successful');
    }

    return { isLoggedIn: true, token, userId, email };
  } catch (error) {
    console.error('Auto login failed:', error);
    return { isLoggedIn: false, token: null, userId: null, email: null };
  }
};

/**
 * 토큰에서 사용자 ID 추출
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id || payload.sub || null; // 백엔드 구조에 따라 조정
  } catch (error) {
    console.error('Failed to extract user ID from token:', error);
    return null;
  }
};
