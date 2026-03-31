/**
 * API Client
 * 모든 API 호출을 추상화하여 일관된 에러 핸들링, 인증, 타임아웃 등을 제공합니다
 *
 * OKR 기여:
 * - KR3 (안정성): 자동 재시도, 타임아웃, 에러 핸들링, Sentry 통합
 * - 코드 품질: 중복 코드 제거, 유지보수성 향상
 */

import { API_URL, CONFIG } from '../constants/Config';
import { showApiError } from '../utils/toast';
import { logErrorToSentry, addSentryBreadcrumb } from '../utils/sentry';

// API 응답 타입
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// API 클라이언트 옵션
interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  showErrorToast?: boolean;
}

/**
 * API 요청 타임아웃 구현
 */
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

/**
 * API 요청 재시도 로직
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  timeout: number,
  retryCount: number = CONFIG.API_RETRY_COUNT,
  retryDelay: number = CONFIG.API_RETRY_DELAY
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let i = 0; i <= retryCount; i++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);

      // 5xx 에러는 재시도 (서버 오류)
      if (response.status >= 500 && i < retryCount) {
        lastError = new Error(`Server error: ${response.status}`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1))); // Exponential backoff
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // 네트워크 오류는 재시도
      if (i < retryCount && (error as Error).message.includes('Network')) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Request failed after retries');
};

/**
 * 기본 API 클라이언트
 */
const apiClient = async <T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = CONFIG.API_TIMEOUT,
    retry = true,
    showErrorToast: shouldShowErrorToast = true,
  } = options;

  const url = `${API_URL}${endpoint}`;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Sentry Breadcrumb: API 요청 시작
    addSentryBreadcrumb('api', `${method} ${endpoint}`, { body });

    const response = retry
      ? await fetchWithRetry(url, requestOptions, timeout)
      : await fetchWithTimeout(url, requestOptions, timeout);

    // HTTP 에러 체크
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const httpError = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);

      // Sentry: HTTP 에러 로깅 (4xx는 info, 5xx는 error)
      if (response.status >= 500) {
        logErrorToSentry(httpError, {
          endpoint,
          method,
          statusCode: response.status,
          body,
        });
      }

      throw httpError;
    }

    // Sentry Breadcrumb: API 성공
    addSentryBreadcrumb('api', `${method} ${endpoint} - Success`, { status: response.status });

    // 응답 파싱
    const data = await response.json();
    return data as T;
  } catch (error) {
    // 에러 로깅
    if (__DEV__) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
    }

    // Sentry: 네트워크/타임아웃 에러 로깅
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('timeout') || errorMessage.includes('Network')) {
      logErrorToSentry(error, {
        endpoint,
        method,
        errorType: 'network',
        body,
      });
    }

    // 사용자에게 Toast 표시 (선택 사항)
    if (shouldShowErrorToast) {
      showApiError(error);
    }

    throw error;
  }
};

/**
 * HTTP 메서드별 편의 함수
 */
export const api = {
  /**
   * GET 요청
   * @example
   * const todos = await api.get<Todo[]>('/nests/123/missions');
   */
  get: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST 요청
   * @example
   * const newTodo = await api.post<Todo>('/nests/123/missions', { title: '할 일' });
   */
  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, body, method: 'POST' }),

  /**
   * PATCH 요청
   * @example
   * await api.patch('/nests/123/missions/456', { is_completed: true });
   */
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, body, method: 'PATCH' }),

  /**
   * PUT 요청
   */
  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, body, method: 'PUT' }),

  /**
   * DELETE 요청
   * @example
   * await api.delete('/nests/123/missions/456');
   */
  delete: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * 인증 토큰 관리 — SecureStore 기반
 * 앱 시작 시 SecureStore에서 토큰을 불러오고, 로그인/로그아웃 시 업데이트
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'matecheck_jwt_token';
let authToken: string | null = null;

/** SecureStore에서 토큰 로드 (앱 시작 시 호출) */
export const loadToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    authToken = token;
    return token;
  } catch (error) {
    console.error('토큰 로드 실패:', error);
    return null;
  }
};

/** 토큰 저장 (로그인/회원가입 성공 시 호출) */
export const setAuthToken = async (token: string | null) => {
  authToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};

export const getAuthToken = () => authToken;

/** 토큰 삭제 (로그아웃 시 호출) */
export const clearToken = async () => {
  authToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
};

/**
 * 인증이 필요한 API 클라이언트
 * (Phase 1-4에서 JWT 구현 시 사용)
 */
export const authenticatedApi = {
  get: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'GET',
      headers: {
        ...options?.headers,
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, {
      ...options,
      body,
      method: 'POST',
      headers: {
        ...options?.headers,
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, {
      ...options,
      body,
      method: 'PATCH',
      headers: {
        ...options?.headers,
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(endpoint, {
      ...options,
      body,
      method: 'PUT',
      headers: {
        ...options?.headers,
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'DELETE',
      headers: {
        ...options?.headers,
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    }),
};

export default api;
