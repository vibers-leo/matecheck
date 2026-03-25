# Firebase Crashlytics 설정 가이드

> 크래시 모니터링 및 에러 추적 시스템 구축

---

## 📋 사전 준비

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - "프로젝트 추가" 클릭
   - 프로젝트 이름: `MateCheck`

2. **Firebase 앱 등록**
   - iOS 앱 추가: Bundle ID `com.matecheck.juuuno`
   - Android 앱 추가: Package name `com.matecheck.juuuno`

---

## 🔧 설정 단계

### 1. Firebase 설정 파일 다운로드

#### iOS

1. Firebase Console에서 `GoogleService-Info.plist` 다운로드
2. 파일을 `frontend/ios/` 폴더에 복사
3. Xcode에서 프로젝트에 파일 추가

#### Android

1. Firebase Console에서 `google-services.json` 다운로드
2. 파일을 `frontend/android/app/` 폴더에 복사

### 2. Android 설정 (build.gradle)

**`frontend/android/build.gradle`**

```gradle
buildscript {
    dependencies {
        // Firebase 추가
        classpath 'com.google.gms:google-services:4.3.15'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.5'
    }
}
```

**`frontend/android/app/build.gradle`**

```gradle
// 파일 상단에 추가
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.crashlytics'

android {
    // ...
}

dependencies {
    // Firebase BOM (Bill of Materials)
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-crashlytics'
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 3. iOS 설정 (Podfile)

**`frontend/ios/Podfile`**

```ruby
# Firebase 추가
pod 'Firebase/Crashlytics'
pod 'Firebase/Analytics'
```

설치:

```bash
cd ios
pod install
cd ..
```

### 4. 환경 변수 업데이트

**`.env`**

```bash
# 프로덕션에서만 활성화 (개발 중에는 false로 유지)
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
```

**프로덕션 빌드 시:**

```bash
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

---

## 📱 앱 초기화

**`app/_layout.tsx`**

```tsx
import { initializeCrashlytics } from '../utils/crashlytics';

export default function Layout() {
  useEffect(() => {
    // Crashlytics 초기화
    initializeCrashlytics();
  }, []);

  // ...
}
```

---

## 🔍 사용 예시

### 1. 사용자 정보 설정 (로그인 후)

```tsx
import { setUserForCrashlytics } from '../utils/crashlytics';

const handleLogin = async (email, password) => {
  const user = await login(email, password);

  // Crashlytics에 사용자 정보 설정
  setUserForCrashlytics(user.id, user.email);
};
```

### 2. 에러 기록

```tsx
import { recordError, logCrashlytics } from '../utils/crashlytics';

try {
  await fetchData();
} catch (error) {
  // 에러 기록 (컨텍스트 포함)
  recordError(error as Error, {
    screen: 'HomeScreen',
    action: 'fetchData',
    userId: user.id,
  });

  // 사용자에게 Toast 표시
  showErrorToast('데이터를 불러올 수 없습니다.');
}
```

### 3. 커스텀 로그

```tsx
import { logCrashlytics, setCrashlyticsAttribute } from '../utils/crashlytics';

// 중요한 이벤트 로깅
logCrashlytics('User started checkout process');

// 커스텀 속성 설정
setCrashlyticsAttribute('plan_type', 'premium');
setCrashlyticsAttribute('experiment_group', 'A');
```

### 4. Error Boundary 통합

**`components/ErrorBoundary.tsx`**

```tsx
import { recordError } from '../utils/crashlytics';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Crashlytics에 에러 기록
  recordError(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });

  // ...
}
```

---

## 🧪 테스트

### 개발 모드에서 테스트

```tsx
import { testCrash } from '../utils/crashlytics';

// ⚠️ 테스트용 버튼 (개발 모드에서만 사용)
{__DEV__ && (
  <TouchableOpacity onPress={testCrash}>
    <Text>Test Crash</Text>
  </TouchableOpacity>
)}
```

### 크래시 확인

1. 앱에서 크래시 발생
2. 앱 재시작
3. Firebase Console → Crashlytics → 대시보드
4. 약 5분 후 크래시 리포트 확인

---

## 📊 Firebase Console에서 확인할 수 있는 정보

### 1. Crashlytics 대시보드

- **크래시 없는 사용자 비율**: 99.5% 목표 (KR3)
- **크래시 발생 횟수**: 시간대별, 버전별
- **영향받은 사용자 수**: 심각도 파악

### 2. 크래시 상세 정보

- **스택 트레이스**: 정확한 에러 위치
- **사용자 정보**: User ID, 이메일
- **기기 정보**: OS 버전, 기기 모델
- **커스텀 로그**: 크래시 전 발생한 이벤트

### 3. 이슈 관리

- **우선순위 설정**: 크래시 빈도 기반
- **상태 변경**: Open → Fixed → Closed
- **Jira 연동**: 자동 이슈 생성

---

## ⚠️ 주의사항

### 개발 모드

- Crashlytics는 **프로덕션 빌드에서만 활성화**
- 개발 중에는 `.env`에서 `ENABLE_CRASH_REPORTING=false`

### 개인정보 보호

- **민감한 정보 로깅 금지**: 비밀번호, 신용카드 등
- **사용자 동의**: 크래시 리포팅 수집 동의 받기
- **GDPR 준수**: EU 사용자는 opt-out 가능

### 성능 영향

- Crashlytics는 **매우 가벼움** (< 1% 성능 영향)
- 네트워크 사용량 최소화 (WiFi에서만 전송)

---

## 🎯 KR3 목표 달성

**목표: 크래시율 0.5% 이하**

### 모니터링 지표

```
크래시 없는 사용자 = (전체 사용자 - 크래시 경험 사용자) / 전체 사용자 × 100
```

### 목표값

- **Crash-free users**: ≥ 99.5%
- **Crash-free sessions**: ≥ 99.8%

### 대응 프로세스

1. **긴급 (Crash-free < 98%)**
   - 즉시 핫픽스 배포
   - 사용자에게 업데이트 안내

2. **높음 (Crash-free 98-99%)**
   - 24시간 내 수정
   - 다음 버전에 포함

3. **보통 (Crash-free 99-99.5%)**
   - 1주일 내 수정
   - 다음 마이너 업데이트

4. **낮음 (Crash-free > 99.5%)**
   - 다음 메이저 업데이트

---

## 📚 참고 자료

- [Firebase Crashlytics 공식 문서](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase](https://rnfirebase.io/crashlytics/usage)

---

**마지막 업데이트**: 2026-02-14
