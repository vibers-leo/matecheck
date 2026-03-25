/**
 * Sentry Integration Example
 * app/_layout.tsx에 추가할 코드 예시
 *
 * ⚠️ 이 파일은 예시이며 실제로 실행되지 않습니다
 * 아래 코드를 app/_layout.tsx 또는 app/toss/_layout.tsx에 복사하세요
 */

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';

// 1️⃣ Sentry 유틸리티 import
import {
  initSentry,
  setSentryUser,
  setSentryContext,
  addSentryBreadcrumb,
} from '../utils/sentry';

// 2️⃣ Error Boundary import
import { SentryErrorBoundary } from '../components/SentryErrorBoundary';

// Zustand store (사용자 정보)
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { userId, nestId, nestName, nickname, email } = useUserStore();

  // 3️⃣ Sentry 초기화 (앱 시작 시 1회)
  useEffect(() => {
    console.log('🚀 Initializing Sentry...');
    initSentry();
  }, []);

  // 4️⃣ 사용자 정보 동기화 (로그인 시)
  useEffect(() => {
    if (userId) {
      setSentryUser(userId, email, nickname);
      setSentryContext(nestId, nestName);
      console.log('✅ Sentry user context set:', userId);
    }
  }, [userId, email, nickname, nestId, nestName]);

  // 5️⃣ 네비게이션 추적 (Breadcrumbs)
  useEffect(() => {
    const currentRoute = segments.join('/');
    if (currentRoute) {
      addSentryBreadcrumb('navigation', `Navigated to /${currentRoute}`);
      console.log('🧭 Navigation:', currentRoute);
    }
  }, [segments]);

  return (
    // 6️⃣ Error Boundary로 앱 전체 감싸기
    <SentryErrorBoundary>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SentryErrorBoundary>
  );
}

/**
 * 사용 예시 (다른 컴포넌트에서)
 */

// 예시 1: API 호출 중 에러 (api.ts에서 자동 처리)
import { api } from '../services/api';

async function fetchTodos() {
  try {
    const todos = await api.get('/nests/123/missions');
    // ✅ 성공 시 Sentry Breadcrumb 자동 기록
  } catch (error) {
    // ✅ 실패 시 Sentry에 자동 전송
    console.error('Failed to fetch todos:', error);
  }
}

// 예시 2: 수동 에러 캡처
import { logErrorToSentry } from '../utils/sentry';

async function riskyOperation() {
  try {
    // 위험한 작업
    const result = JSON.parse(someUnknownData);
  } catch (error) {
    // Sentry에 수동으로 전송
    logErrorToSentry(error, {
      operation: 'riskyOperation',
      context: 'parsing user data',
    });
  }
}

// 예시 3: 커스텀 이벤트 기록
import { logMessageToSentry, addSentryBreadcrumb } from '../utils/sentry';

function handleUserAction() {
  // 사용자 행동 기록 (Breadcrumb)
  addSentryBreadcrumb('user_action', 'Clicked submit button', {
    formType: 'todo_creation',
  });

  // 중요한 이벤트 기록 (메시지)
  logMessageToSentry('User completed onboarding', 'info', {
    userId: '123',
    nestId: '456',
  });
}

// 예시 4: 성능 측정
import { startSentryTransaction } from '../utils/sentry';

async function loadHomeScreen() {
  const transaction = startSentryTransaction('load_home_screen', 'screen_load');

  // 화면 로딩 작업
  await fetchHomeData();
  await loadUserPreferences();

  transaction.finish(); // 측정 완료
}

/**
 * 배포 전 체크리스트
 */

// ✅ 1. .env 파일에 SENTRY_DSN 추가
// ✅ 2. app.json에 sentry-expo 플러그인 추가
// ✅ 3. app/_layout.tsx에 Sentry 통합 코드 추가
// ✅ 4. Error Boundary로 앱 전체 감싸기
// ✅ 5. 테스트 에러 발생시켜서 Sentry 대시보드 확인
// ✅ 6. 프로덕션 빌드 전 소스맵 업로드 설정
