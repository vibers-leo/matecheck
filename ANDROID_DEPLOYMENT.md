# 📱 MateCheck 안드로이드 배포 가이드

## 🚀 빠른 시작 (3가지 방법)

### 방법 1: APK 빌드 (가장 빠름, 테스트용)
```bash
# 1. Expo 로그인
npx eas-cli login

# 2. 프로젝트 설정
npx eas-cli build:configure

# 3. APK 빌드 (5-10분 소요)
npx eas-cli build --platform android --profile preview

# 빌드 완료 후 다운로드 링크가 제공됩니다
# APK 파일을 다운로드하여 안드로이드 기기에 직접 설치 가능
```

### 방법 2: AAB 빌드 (Google Play 배포용)
```bash
# Production 빌드
npx eas-cli build --platform android --profile production

# 빌드 완료 후 .aab 파일 다운로드
# Google Play Console에 업로드
```

### 방법 3: 로컬 빌드 (Android Studio 필요)
```bash
# Expo 프리빌드
npx expo prebuild --platform android

# Android Studio로 열기
cd android
./gradlew assembleRelease

# APK 위치: android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ 주의사항

### 1. **필수 준비물**
- ✅ Expo 계정 (https://expo.dev 무료 가입)
- ✅ 앱 아이콘 (1024x1024px PNG)
- ✅ 스플래시 스크린 이미지
- ⚠️ Google Play Console 계정 ($25, Play Store 배포 시)

### 2. **앱 정보 확인**
현재 설정:
- **앱 이름**: MateCheck
- **패키지명**: com.matecheck.app
- **버전**: 1.0.0 (versionCode: 1)

### 3. **빌드 전 체크리스트**
```bash
# API URL 확인
# frontend/constants/Config.ts
export const API_URL = 'https://your-backend-url.com';

# 아이콘 확인
ls -la assets/icon.png
ls -la assets/adaptive-icon.png
ls -la assets/splash-icon.png

# 의존성 설치 확인
npm install
```

### 4. **보안 주의사항**
- ⚠️ API 키는 환경변수로 관리
- ⚠️ 프로덕션 빌드 전 디버그 코드 제거
- ⚠️ 민감한 정보 하드코딩 금지

### 5. **빌드 시간**
- **EAS Build (클라우드)**: 5-15분
- **로컬 빌드**: 10-30분 (첫 빌드)
- **재빌드**: 2-5분

---

## 📋 단계별 상세 가이드

### Step 1: Expo 계정 생성
```bash
# 브라우저에서 https://expo.dev 접속
# Sign Up 클릭하여 계정 생성
```

### Step 2: EAS CLI 로그인
```bash
npx eas-cli login
# 이메일과 비밀번호 입력
```

### Step 3: 프로젝트 초기화
```bash
cd /Users/admin/Desktop/matecheck/frontend
npx eas-cli build:configure
# Android 선택
# 자동으로 eas.json 생성됨 (이미 생성됨)
```

### Step 4: 빌드 실행
```bash
# 테스트용 APK
npx eas-cli build --platform android --profile preview

# 또는 프로덕션 AAB
npx eas-cli build --platform android --profile production
```

### Step 5: 빌드 모니터링
```bash
# 빌드 상태 확인
npx eas-cli build:list

# 또는 웹에서 확인
# https://expo.dev/accounts/[your-username]/projects/matecheck/builds
```

---

## 🎨 아이콘 & 스플래시 준비

### 필요한 이미지
1. **앱 아이콘** (`assets/icon.png`)
   - 크기: 1024x1024px
   - 형식: PNG (투명 배경 가능)
   
2. **적응형 아이콘** (`assets/adaptive-icon.png`)
   - 크기: 1024x1024px
   - 안전 영역: 중앙 66% (684x684px)
   
3. **스플래시 스크린** (`assets/splash-icon.png`)
   - 크기: 1284x2778px (또는 비율 유지)
   - 배경색: `#FF7F50` (오렌지)

### 이미지 생성 도구
- Figma: https://figma.com
- Canva: https://canva.com
- Icon Kitchen: https://icon.kitchen

---

## 🏪 Google Play Store 배포

### 1. Google Play Console 설정
```
1. https://play.google.com/console 접속
2. 계정 생성 ($25 결제)
3. "앱 만들기" 클릭
4. 앱 정보 입력:
   - 앱 이름: MateCheck
   - 기본 언어: 한국어
   - 앱 유형: 앱
   - 무료/유료: 무료
```

### 2. 앱 정보 작성
- **짧은 설명** (80자 이내)
- **전체 설명** (4000자 이내)
- **스크린샷** (최소 2개, 권장 4-8개)
  - 휴대전화: 16:9 비율
  - 7인치 태블릿: 16:9 비율
- **그래픽 이미지** (1024x500px)

### 3. AAB 업로드
```bash
# 1. Production 빌드
npx eas-cli build --platform android --profile production

# 2. .aab 파일 다운로드
# 3. Play Console > 프로덕션 > 새 버전 만들기
# 4. AAB 파일 업로드
# 5. 버전 정보 입력
# 6. 검토 제출
```

### 4. 심사 대기
- 일반적으로 1-3일 소요
- 첫 배포는 최대 7일 가능

---

## 🔧 트러블슈팅

### 문제 1: 빌드 실패
```bash
# 캐시 클리어
rm -rf node_modules
npm install

# Expo 캐시 클리어
npx expo start --clear
```

### 문제 2: 패키지명 충돌
```json
// app.json에서 고유한 패키지명 사용
"android": {
  "package": "com.yourcompany.matecheck"
}
```

### 문제 3: 서명 키 오류
```bash
# EAS가 자동으로 관리하므로 별도 설정 불필요
# 수동 관리 시:
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

---

## 📊 빌드 프로필 설명

### `preview` (테스트용)
- APK 형식
- 내부 배포용
- 빠른 테스트 가능
- Google Play 업로드 불가

### `production` (배포용)
- AAB 형식 (기본)
- Google Play 업로드 가능
- 최적화된 빌드
- 크기 최소화

---

## 🎯 권장 배포 순서

1. **개발 단계**
   ```bash
   # 로컬 개발
   npm run web
   npm run android  # 에뮬레이터
   ```

2. **내부 테스트**
   ```bash
   # APK 빌드
   npx eas-cli build --platform android --profile preview
   # 팀원들에게 APK 공유
   ```

3. **베타 테스트**
   ```bash
   # AAB 빌드
   npx eas-cli build --platform android --profile production
   # Play Console > 비공개 테스트 트랙 업로드
   ```

4. **정식 배포**
   ```bash
   # Play Console > 프로덕션 트랙으로 승격
   ```

---

## 📞 도움말

### Expo 공식 문서
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/submit/android/

### Google Play 가이드
- https://support.google.com/googleplay/android-developer/

### 커뮤니티
- Expo Discord: https://chat.expo.dev
- Stack Overflow: [expo] 태그

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] API URL이 프로덕션 서버로 설정됨
- [ ] 앱 아이콘 준비 완료
- [ ] 스플래시 스크린 준비 완료
- [ ] 앱 이름 및 설명 작성 완료
- [ ] 스크린샷 준비 (최소 2개)
- [ ] 개인정보 처리방침 URL 준비
- [ ] 테스트 완료 (주요 기능 동작 확인)
- [ ] 버전 번호 확인 (app.json)
- [ ] Expo 계정 로그인 완료

배포 후 확인사항:
- [ ] 앱 설치 테스트
- [ ] 주요 기능 동작 확인
- [ ] 권한 요청 정상 작동
- [ ] 네트워크 연결 확인
- [ ] 크래시 없음

---

**첫 배포는 시간이 걸리지만, 이후 업데이트는 훨씬 빠릅니다!**
**궁금한 점이 있으면 언제든 물어보세요! 🚀**
