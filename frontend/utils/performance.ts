/**
 * Performance Utilities
 * React 성능 최적화를 위한 유틸리티
 *
 * OKR 기여:
 * - KR2 (재방문율): 빠른 렌더링, 매끄러운 애니메이션
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * 디바운스 훅
 * 빠르게 연속된 호출을 마지막 호출만 실행
 *
 * @example
 * const debouncedSearch = useDebounce((query) => {
 *   fetchSearchResults(query);
 * }, 500);
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * 쓰로틀 훅
 * 일정 시간 내 최대 1번만 실행
 *
 * @example
 * const throttledScroll = useThrottle((event) => {
 *   handleScroll(event);
 * }, 100);
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * 이전 값 기억 훅
 * 리렌더링 시 이전 값과 비교할 때 유용
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * 마운트 여부 확인 훅
 * 컴포넌트가 언마운트된 후 setState를 방지
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

/**
 * 성능 측정 유틸리티
 * 개발 모드에서만 동작
 */
export const measurePerformance = (label: string, fn: () => void) => {
  if (__DEV__) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⏱️ [Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

/**
 * 메모리 사용량 로깅 (개발 모드)
 */
export const logMemoryUsage = (label?: string) => {
  if (__DEV__ && (performance as any).memory) {
    const { usedJSHeapSize, totalJSHeapSize } = (performance as any).memory;
    const usedMB = (usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (totalJSHeapSize / 1024 / 1024).toFixed(2);
    console.log(
      `💾 [Memory${label ? ` - ${label}` : ''}]: ${usedMB}MB / ${totalMB}MB`
    );
  }
};
