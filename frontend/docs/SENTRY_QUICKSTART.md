# Sentry 빠른 시작 가이드

> ⏱️ **예상 소요 시간**: 40분
> 🎯 **목표**: KR3 안정성 99.5%+ 달성

---

## ✅ 체크리스트

### Phase 1: 설치 (10분)

```bash
cd frontend

# 1. Sentry 패키지 설치
npm install @sentry/react-native sentry-expo --save

# 2. Sentry CLI 설치 (소스맵용)
npm install @sentry/cli --save-dev

# 3. 설치 확인
npm list @sentry/react-native
```

**확인:**
- [ ] package.json에 `@sentry/react-native` 추가됨
- [ ] package.json에 `sentry-expo` 추가됨

---

### Phase 2: Sentry 계정 설정 (5분)

1. **Sentry 가입**
   - [sentry.io](https://sentry.io) 방문
   - 무료 계정 생성 (GitHub/Google 로그인 가능)

2. **프로젝트 생성**
   - "Create Project" 클릭
   - Platform: **React Native** 선택
   - Project Name: `matecheck-app`
   - Team: 본인 팀 선택

3. **DSN 복사**
   - 프로젝트 생성 후 표시되는 DSN 키 복사
   - 형식: `https://xxx@xxx.ingest.sentry.io/xxx`

**확인:**
- [ ] Sentry 계정 생성 완료
- [ ] 프로젝트 `matecheck-app` 생성 완료
- [ ] DSN 키 복사 완료

---

### Phase 3: 환경 변수 설정 (5분)

**`frontend/.env` 파일 생성:**

```bash
# Sentry DSN (방금 복사한 키 붙여넣기)
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID

# Sentry 조직/프로젝트 정보
SENTRY_ORG=your-org-name
SENTRY_PROJECT=matecheck-app

# Auth Token (나중에 설정)
# SENTRY_AUTH_TOKEN=your-token
```

**`.gitignore`에 추가:**
```bash
echo ".env" >> .gitignore
```

**확인:**
- [ ] `.env` 파일 생성 완료
- [ ] SENTRY_DSN에 실제 키 입력 완료
- [ ] `.gitignore`에 `.env` 추가 완료

---

### Phase 4: 앱 통합 (15분)

#### 4.1 app.json 수정

**`frontend/app.json`에 플러그인 추가:**

```json
{
  "expo": {
    "name": "MateCheck",
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

#### 4.2 _layout.tsx 수정

**`frontend/app/_layout.tsx` (또는 `app/toss/_layout.tsx`) 파일 상단에 추가:**

```typescript
import { useEffect } from 'react';
import { initSentry, setSentryUser, setSentryContext } from '../utils/sentry';
import { SentryErrorBoundary } from '../components/SentryErrorBoundary';
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  const { userId, email, nickname, nestId, nestName } = useUserStore();

  // Sentry 초기화
  useEffect(() => {
    initSentry();
  }, []);

  // 사용자 정보 동기화
  useEffect(() => {
    if (userId) {
      setSentryUser(userId, email, nickname);
      setSentryContext(nestId, nestName);
    }
  }, [userId, email, nickname, nestId, nestName]);

  return (
    <SentryErrorBoundary>
      {/* 기존 앱 컴포넌트 */}
      <Slot />
    </SentryErrorBoundary>
  );
}
```

**확인:**
- [ ] app.json에 sentry-expo 플러그인 추가 완료
- [ ] _layout.tsx에 Sentry 통합 코드 추가 완료
- [ ] Error Boundary 적용 완료

---

### Phase 5: 테스트 (5분)

#### 5.1 개발 서버 재시작

```bash
# 캐시 삭제 후 재시작
npx expo start -c
```

#### 5.2 테스트 버튼 추가 (임시)

**아무 화면에나 테스트 버튼 추가:**

```typescript
import * as Sentry from '@sentry/react-native';

<TouchableOpacity
  onPress={() => {
    Sentry.captureMessage('🧪 Sentry 테스트 메시지', 'info');
    alert('Sentry에 테스트 메시지 전송됨!');
  }}
  style={{ padding: 20, backgroundColor: '#4CAF50' }}
>
  <Text style={{ color: 'white' }}>Sentry 테스트</Text>
</TouchableOpacity>
```

#### 5.3 Sentry 대시보드 확인

1. 테스트 버튼 클릭
2. [sentry.io](https://sentry.io) → 프로젝트 → Issues 메뉴 확인
3. "🧪 Sentry 테스트 메시지" 이벤트가 표시되는지 확인

**확인:**
- [ ] 앱이 정상 실행됨
- [ ] 테스트 버튼 클릭 시 Sentry에 메시지 전송됨
- [ ] Sentry 대시보드에서 이벤트 확인 완료

---

## 🎉 완료!

### 최종 확인 사항

- [x] ✅ Sentry 패키지 설치 완료
- [x] ✅ Sentry 계정 및 프로젝트 생성 완료
- [x] ✅ 환경 변수 (.env) 설정 완료
- [x] ✅ 앱에 Sentry 통합 완료
- [x] ✅ Error Boundary 적용 완료
- [x] ✅ 테스트 성공 (Sentry 대시보드에서 확인)

---

## 📊 모니터링 시작

### 주요 지표

Sentry 대시보드에서 다음 지표를 확인하세요:

1. **Crash Free Rate**: 99.5% 이상 유지 (KR3 목표)
2. **Error Volume**: 하루 50건 이하
3. **Response Time**: 평균 2시간 이내 대응

### 알림 설정

1. Sentry → Settings → Alerts
2. "Create Alert Rule"
3. 조건:
   - Crash free rate < 99%
   - 10 errors in 1 hour
4. 알림: Email 또는 Slack 연동

---

## 🚨 문제 해결

### "Sentry DSN not found" 에러
- `.env` 파일이 frontend 디렉토리에 있는지 확인
- `SENTRY_DSN` 키가 올바르게 입력되었는지 확인
- 앱 재시작 (`npx expo start -c`)

### Sentry 대시보드에 이벤트가 안 보임
- 프로덕션 환경인지 확인 (`enableInExpoDevelopment: false` 설정됨)
- 네트워크 연결 확인
- Sentry DSN이 올바른지 확인

### 앱이 실행되지 않음
- `npm install` 재실행
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

---

## 📚 다음 단계

- [ ] **Phase 1-3 배포 전**: 소스맵 업로드 설정
- [ ] **1주일 후**: Sentry 대시보드 리뷰, 주요 에러 수정
- [ ] **1개월 후**: Crash Free Rate 99.5% 달성 여부 확인

---

**작성일**: 2026-02-16
**예상 비용**: 무료 (월 5,000 이벤트 한도)
**유료 전환 시점**: 사용자 500명+ (월 $26)
