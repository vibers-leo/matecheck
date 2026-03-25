# Sentry 크래시 모니터링 연동 가이드

## 🎯 목표
**KR3 (안정성 99.5%+)** 달성을 위한 실시간 크래시 모니터링 시스템 구축

---

## 📋 준비사항

### 1. Sentry 계정 생성
1. [sentry.io](https://sentry.io) 접속
2. 회원가입 (무료 플랜: 월 5,000 이벤트)
3. "Create Project" 클릭
4. Platform: **React Native** 선택
5. Project 이름: `matecheck-app`
6. DSN 키 복사 (예: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. 예상 비용
- **무료 플랜**: 월 5,000 에러 이벤트 (개발 단계 충분)
- **Team 플랜**: $26/월 (월 50,000 이벤트, 500명 사용자 기준 충분)

---

## 🚀 설치 및 설정

### Step 1: Sentry 패키지 설치

```bash
cd frontend

# Sentry React Native SDK 설치
npm install @sentry/react-native --save

# Sentry CLI 설치 (소스맵 업로드용)
npm install @sentry/cli --save-dev

# Expo 플러그인 설치
npx expo install sentry-expo
```

### Step 2: 환경 변수 설정

**`frontend/.env` 파일 생성:**
```bash
# Sentry DSN (sentry.io에서 복사)
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID

# Sentry 프로젝트 정보 (소스맵 업로드용)
SENTRY_ORG=your-org-name
SENTRY_PROJECT=matecheck-app
SENTRY_AUTH_TOKEN=your-auth-token
```

**`.env` 파일을 `.gitignore`에 추가:**
```bash
echo ".env" >> .gitignore
```

### Step 3: Sentry 초기화 파일 생성

**이미 생성됨:** `/frontend/utils/sentry.ts`

### Step 4: 앱 진입점에 Sentry 통합

**`frontend/app/_layout.tsx` 수정:**
```typescript
import { useEffect } from 'react';
import { initSentry } from '../utils/sentry';

export default function RootLayout() {
  useEffect(() => {
    // Sentry 초기화 (앱 시작 시 1회)
    initSentry();
  }, []);

  return (
    // ... 기존 코드
  );
}
```

### Step 5: Error Boundary 통합

**`frontend/app/_layout.tsx`에 ErrorBoundary 추가:**
```typescript
import { SentryErrorBoundary } from '../components/SentryErrorBoundary';

export default function RootLayout() {
  return (
    <SentryErrorBoundary>
      {/* 기존 앱 컴포넌트 */}
    </SentryErrorBoundary>
  );
}
```

### Step 6: app.json 설정

**`frontend/app.json`에 Sentry 플러그인 추가:**
```json
{
  "expo": {
    "plugins": [
      [
        "sentry-expo",
        {
          "organization": "your-org-name",
          "project": "matecheck-app"
        }
      ]
    ]
  }
}
```

---

## 🧪 테스트

### 1. 개발 환경에서 테스트

**테스트 에러 트리거 버튼 추가 (디버그용):**
```typescript
// 임시 테스트 화면
import * as Sentry from '@sentry/react-native';

<TouchableOpacity onPress={() => {
  Sentry.captureException(new Error('테스트 에러입니다!'));
}}>
  <Text>Sentry 테스트</Text>
</TouchableOpacity>
```

### 2. 테스트 체크리스트
- [ ] Sentry 대시보드에 에러가 표시되는가?
- [ ] 사용자 정보 (userId, nestId)가 함께 기록되는가?
- [ ] Breadcrumbs (네비게이션 히스토리)가 표시되는가?
- [ ] 디바이스 정보 (OS, 버전)가 포함되는가?
- [ ] 소스맵이 정상 업로드되어 원본 파일명/줄번호가 보이는가?

---

## 📊 Sentry 대시보드 활용

### 주요 지표 모니터링
1. **Crash Free Rate**: 99.5% 이상 유지 (KR3 목표)
2. **Error Volume**: 하루 50건 이하 목표
3. **Most Common Errors**: 가장 많이 발생하는 에러 우선 수정

### 알림 설정
1. Sentry 프로젝트 → Settings → Alerts
2. "Create Alert Rule" 클릭
3. 조건 설정:
   - Crash free rate falls below 99%
   - 10 errors in 1 hour
4. 알림 채널: Email, Slack 연동 가능

---

## 🔒 보안 고려사항

### 1. 민감 정보 필터링
```typescript
// sentry.ts에 이미 설정됨
beforeSend(event) {
  // 비밀번호, 토큰 등 민감 정보 제거
  if (event.request?.data?.password) {
    delete event.request.data.password;
  }
  return event;
}
```

### 2. 개발/프로덕션 분리
- 개발: `environment: 'development'`
- 프로덕션: `environment: 'production'`
- Sentry에서 환경별로 필터링 가능

---

## 📈 예상 효과

### Before Sentry
- ❌ 크래시 발생해도 알 수 없음
- ❌ 사용자 신고로만 버그 파악
- ❌ 재현 불가능한 버그 많음
- ❌ 평균 대응 시간: 3일

### After Sentry
- ✅ 실시간 크래시 알림
- ✅ 자동으로 버그 수집/분석
- ✅ Breadcrumbs로 재현 가능
- ✅ 평균 대응 시간: 2시간

---

## 🎯 OKR 기여

| KR | 기여 내용 | 예상 개선 |
|----|----------|----------|
| **KR3 (안정성)** | 실시간 크래시 모니터링 → 빠른 대응 | 99% → 99.5%+ |
| **KR1 (만족도)** | 버그 조기 발견 → 사용자 불만 감소 | 4.0 → 4.5+ |
| **KR2 (재방문율)** | 안정적인 앱 → 이탈 방지 | 35% → 40%+ |

---

## 🚨 주의사항

1. **프로덕션 빌드에서만 활성화**
   - 개발 중에는 로컬 에러만으로도 충분
   - `enableInExpoDevelopment: false` 설정됨

2. **이벤트 할당량 관리**
   - 무료 플랜: 월 5,000 이벤트
   - 불필요한 에러 (네트워크 타임아웃 등) 필터링
   - `beforeSend`에서 필터 로직 추가 가능

3. **소스맵 업로드**
   - 프로덕션 배포 시 필수
   - `sentry-cli`로 자동 업로드 설정
   - 디버깅 정보 유출 방지 (프로덕션에서 민감 정보 제거)

---

## 📚 참고 자료

- [Sentry React Native 공식 문서](https://docs.sentry.io/platforms/react-native/)
- [Expo + Sentry 통합 가이드](https://docs.expo.dev/guides/using-sentry/)
- [Sentry Error Monitoring Best Practices](https://docs.sentry.io/product/best-practices/)

---

**작성일**: 2026-02-16
**작성자**: Claude Sonnet 4.5
**다음 업데이트**: 배포 후 1주일 내
