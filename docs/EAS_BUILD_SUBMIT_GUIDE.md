# EAS Build 및 Submit 종합 가이드

> 앱 빌드부터 앱스토어 제출까지 완벽 가이드

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [EAS CLI 설정](#eas-cli-설정)
3. [개발 빌드](#개발-빌드)
4. [프리뷰 빌드](#프리뷰-빌드)
5. [프로덕션 빌드](#프로덕션-빌드)
6. [iOS App Store 제출](#ios-app-store-제출)
7. [Google Play Store 제출](#google-play-store-제출)
8. [문제 해결](#문제-해결)

---

## 🛠️ 사전 준비

### 1. 계정 및 멤버십

#### Apple Developer Program (iOS)

- **비용**: $99/년
- **등록**: https://developer.apple.com/programs/
- **준비물**:
  - Apple ID
  - 신용카드 또는 체크카드
  - 사업자 등록증 (법인 계정의 경우)

**등록 절차**:
1. Apple Developer 사이트 접속
2. "Enroll" 클릭
3. Apple ID로 로그인
4. 개인/조직 선택
5. 정보 입력 및 결제
6. 승인 대기 (1-2일)

#### Google Play Developer (Android)

- **비용**: $25 (1회 결제)
- **등록**: https://play.google.com/console/signup
- **준비물**:
  - Google 계정
  - 신용카드
  - 개인정보 (주소, 전화번호)

**등록 절차**:
1. Google Play Console 접속
2. "Create account" 클릭
3. 정보 입력
4. $25 결제
5. 즉시 승인

---

### 2. EAS 계정

```bash
# Expo 계정이 없다면 생성
npx expo register

# 또는 로그인
npx expo login
```

---

### 3. 필수 소프트웨어

```bash
# Node.js 18+ 확인
node --version  # v18.0.0 이상

# Expo CLI 설치 (최신 버전)
npm install -g expo-cli

# EAS CLI 설치
npm install -g eas-cli

# 버전 확인
eas --version  # 13.2.0 이상
```

---

## 🚀 EAS CLI 설정

### 1. EAS 로그인

```bash
cd /Users/admin/Desktop/matecheck/frontend

# EAS 로그인
eas login

# 로그인 확인
eas whoami
```

---

### 2. 프로젝트 설정

```bash
# EAS 프로젝트 설정 (이미 설정됨)
# eas.json이 이미 있으므로 스킵

# 프로젝트 ID 확인
# app.config.js의 extra.eas.projectId: 5b232716-3c32-4694-92a6-54d5762b0098
```

---

### 3. 자격증명 설정

#### iOS

```bash
# Apple Developer 계정 연결
eas credentials

# 또는 자동 관리 (권장)
# eas.json에 autoIncrement 설정됨
```

**필요한 자격증명**:
- Distribution Certificate (배포 인증서)
- Provisioning Profile (프로비저닝 프로파일)
- Push Notification Key (선택)

#### Android

```bash
# Keystore 생성 (자동)
# 처음 빌드 시 EAS가 자동으로 생성

# 또는 기존 Keystore 업로드
eas credentials
```

---

## 💻 개발 빌드 (Development Build)

> 개발 중 테스트용 빌드

### iOS

```bash
# 시뮬레이터용 빌드
eas build --profile development --platform ios

# 실제 기기용 빌드 (Ad Hoc)
eas build --profile development --platform ios --local
```

### Android

```bash
# APK 빌드 (빠른 설치)
eas build --profile development --platform android
```

### 설치

```bash
# 빌드 완료 후 QR 코드 스캔
# 또는 URL 링크로 다운로드

# iOS: Expo Go 필요 없음 (Development Client)
# Android: APK 직접 설치
```

---

## 🔍 프리뷰 빌드 (Preview Build)

> 내부 테스터용 빌드 (TestFlight, Internal Testing)

### 환경 변수 설정

```bash
# .env.staging 파일 사용
cp .env.staging .env

# 또는 eas.json에서 자동으로 로드됨 (preview 프로파일)
```

### iOS Preview 빌드

```bash
# Preview 빌드
eas build --profile preview --platform ios

# TestFlight에 자동 업로드
eas submit --platform ios --latest
```

### Android Preview 빌드

```bash
# APK 빌드
eas build --profile preview --platform android

# 다운로드 후 수동 배포
```

---

## 🎯 프로덕션 빌드 (Production Build)

> 앱스토어 제출용 빌드

### 1. 사전 체크리스트

- [ ] 앱 아이콘 준비 완료 (1024×1024px)
- [ ] 스크린샷 4-6장 준비 완료
- [ ] 개인정보 처리방침 URL 준비
- [ ] 서비스 이용약관 URL 준비
- [ ] 앱 설명 및 키워드 준비
- [ ] 테스트 완료 (크래시 없음)
- [ ] 버전 번호 확인 (app.config.js)

---

### 2. 환경 변수 설정

```bash
# .env.production 파일 사용
cp .env.production .env

# 프로덕션 환경 변수 확인
cat .env

# 출력:
# EXPO_PUBLIC_APP_ENV=production
# EXPO_PUBLIC_API_URL=http://matecheck.vibers.co.kr
# EXPO_PUBLIC_ENABLE_ANALYTICS=true
# EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

---

### 3. iOS Production 빌드

```bash
# iOS 프로덕션 빌드 (AAB)
eas build --profile production --platform ios

# 빌드 진행 상황 확인
# https://expo.dev/accounts/[username]/projects/matecheck/builds

# 빌드 완료 (약 15-30분 소요)
# ✓ Build completed!
```

**빌드 결과**:
- `.ipa` 파일 (iOS App Bundle)
- App Store Connect에 자동 업로드 가능

---

### 4. Android Production 빌드

```bash
# Android 프로덕션 빌드 (AAB)
eas build --profile production --platform android

# 빌드 완료 (약 10-20분 소요)
# ✓ Build completed!
```

**빌드 결과**:
- `.aab` 파일 (Android App Bundle)
- Google Play Console에 업로드

---

### 5. 동시 빌드 (권장)

```bash
# iOS와 Android 동시 빌드
eas build --profile production --platform all

# 시간 절약 (병렬 처리)
```

---

## 🍎 iOS App Store 제출

### 1. App Store Connect 준비

#### 앱 생성

1. https://appstoreconnect.apple.com 접속
2. "My Apps" → "+" → "New App" 클릭
3. 정보 입력:
   - **Platform**: iOS
   - **Name**: `MateCheck - 우리집 공동 생활 관리`
   - **Primary Language**: Korean
   - **Bundle ID**: `com.matecheck.juuuno`
   - **SKU**: `matecheck-ios-001`
   - **User Access**: Full Access

#### 앱 정보 입력

**1. App Information**
- **Category**: Productivity (생산성)
- **Secondary Category**: Lifestyle (라이프스타일)

**2. Pricing and Availability**
- **Price**: Free
- **Availability**: All countries

**3. App Privacy**
- **Privacy Policy URL**: https://matecheck.app/privacy
- **Data Types**:
  - Contact Info (Email)
  - User Content (Tasks, Calendars, Budget)
  - Usage Data

**4. Version Information (1.0.0)**

**App Previews and Screenshots**:
- iPhone 14 Pro Max (1284 × 2778px) 4-10장 업로드

**Description** (docs/APP_STORE_METADATA.md 참조):
```
🏠 MateCheck - 우리집이 행복해지는 공동 생활 관리 앱
...
```

**Keywords** (100자):
```
가족,룸메이트,커플,일정,할일,가계부,공유,동거,신혼,청소,집안일,관리비,생활비,투두,캘린더
```

**Support URL**: https://matecheck.app/support
**Marketing URL**: https://matecheck.app

**Version**: 1.0.0
**Copyright**: 2026 MateCheck

---

### 2. 빌드 제출

#### EAS Submit 사용 (권장)

```bash
# 최신 프로덕션 빌드 자동 제출
eas submit --platform ios --latest

# 특정 빌드 제출
eas submit --platform ios --id [build-id]

# 대화형 프롬프트 따라가기
# Apple ID: your-apple-id@example.com
# App-specific password: (App Store Connect에서 생성)
```

#### 수동 제출

1. EAS 빌드 페이지에서 `.ipa` 다운로드
2. Transporter 앱 실행 (Mac App Store에서 다운)
3. `.ipa` 파일 드래그 앤 드롭
4. "Deliver" 클릭

---

### 3. 심사 제출

1. App Store Connect → 앱 선택
2. "1.0.0 Prepare for Submission" 클릭
3. 빌드 선택 (업로드된 빌드)
4. 모든 정보 확인
5. "Submit for Review" 클릭

**심사 정보**:
- **Export Compliance**: No (암호화 미사용)
- **Content Rights**: Yes (모든 콘텐츠 권리 보유)
- **Advertising Identifier**: No (광고 미사용)

**심사 노트**:
```
테스트 계정:
Email: test@matecheck.app
Password: Test1234!

앱 설명:
MateCheck는 가족, 커플, 룸메이트가 함께 사용하는 공동 생활 관리 앱입니다.
할 일, 일정, 가계부를 공유할 수 있습니다.

테스트 방법:
1. 테스트 계정으로 로그인
2. 보금자리 생성 또는 기존 보금자리 확인
3. 할 일 추가/완료
4. 일정 등록
5. 가계부 입력
```

**심사 기간**: 1-3일 (평균 24시간)

---

## 🤖 Google Play Store 제출

### 1. Google Play Console 준비

#### 앱 생성

1. https://play.google.com/console 접속
2. "Create app" 클릭
3. 정보 입력:
   - **App name**: `MateCheck - 가족·커플·룸메이트 일정 공유 및 가계부`
   - **Default language**: Korean (한국어)
   - **App or game**: App
   - **Free or paid**: Free

#### 스토어 설정

**Main store listing**:

1. **App details**
   - **Short description** (80자):
     ```
     가족, 연인, 룸메이트와 할 일, 일정, 가계부를 한 곳에서 공유하세요. 무료!
     ```
   - **Full description** (4,000자) - docs/APP_STORE_METADATA.md 참조

2. **Graphics**
   - **Icon**: 512 × 512px (PNG)
   - **Feature graphic**: 1024 × 500px
   - **Phone screenshots**: 1080 × 1920px (최소 2장)
   - **Tablet screenshots**: 선택 사항

3. **Categorization**
   - **App category**: Productivity
   - **Tags**: Family, Roommate, Budget, Calendar

4. **Contact details**
   - **Email**: support@matecheck.app
   - **Phone**: (선택 사항)
   - **Website**: https://matecheck.app

5. **Privacy Policy**
   - **URL**: https://matecheck.app/privacy

---

### 2. 앱 콘텐츠

**1. Content rating**
- 설문지 작성 (모든 연령)
- ESRB: Everyone

**2. Target audience**
- Age groups: All ages

**3. Data safety**
- Collects data: Yes
  - Email address
  - User content (tasks, events, budgets)
- Shares data: No
- Encryption: Yes (in transit)

**4. App access**
- All functionality is available without restrictions

**5. Ads**
- Contains ads: No

---

### 3. 릴리스 만들기

#### Internal Testing (선택)

```bash
# Internal testing track
eas submit --platform android --latest --track internal
```

1. "Internal testing" → "Create new release" 클릭
2. `.aab` 파일 업로드
3. Release name: `1.0.0 (1)` (자동)
4. Release notes:
   ```
   첫 번째 릴리스입니다!

   주요 기능:
   - 할 일 관리
   - 일정 공유
   - 공동 가계부
   ```
5. "Review release" → "Start rollout" 클릭

#### Production

```bash
# Production track
eas submit --platform android --latest
```

1. "Production" → "Create new release" 클릭
2. `.aab` 파일 업로드
3. Release notes 작성 (위와 동일)
4. 국가 및 지역 선택: 전체 또는 한국
5. "Review release" → "Start rollout to Production" 클릭

**심사 기간**: 수시간 ~ 3일 (평균 1일)

---

## 🔧 문제 해결

### 빌드 실패

#### iOS 인증서 문제

```bash
# 인증서 재생성
eas credentials

# 선택: iOS → Production → Distribution Certificate
# "Remove" → "Add new"
```

#### Android 키스토어 문제

```bash
# 키스토어 확인
eas credentials

# 선택: Android → Production → Keystore
# "Create new" (주의: 기존 앱이 있으면 업데이트 불가!)
```

---

### 빌드 너무 오래 걸림

```bash
# 로컬 빌드 (더 빠름, Mac only)
eas build --profile production --platform ios --local

# 또는 우선순위 빌드 (유료 플랜)
```

---

### 심사 거부 (iOS)

**일반적인 이유**:
1. **스크린샷 문제**: 실제 앱과 다름
2. **개인정보 처리방침 부재**: URL 확인
3. **크래시**: 테스트 미흡
4. **메타데이터 부정확**: 설명과 실제 기능 불일치

**해결**:
1. 거부 사유 확인
2. 문제 수정
3. 새 빌드 업로드 (필요시)
4. "Resubmit for Review"

---

### 빌드 성공했지만 앱이 안 열림

**확인 사항**:
1. 환경 변수 올바른지 확인 (.env.production)
2. API URL 정확한지 확인
3. Crashlytics 로그 확인
4. 실제 기기에서 테스트

---

## 📊 빌드 모니터링

### EAS Dashboard

https://expo.dev/accounts/[username]/projects/matecheck

**확인 가능한 정보**:
- 빌드 진행 상황
- 빌드 로그
- 다운로드 통계
- 크래시 리포트

---

### 빌드 로그 확인

```bash
# 최신 빌드 로그 보기
eas build:list

# 특정 빌드 로그
eas build:view [build-id]
```

---

## 🎉 배포 완료 후

### 1. 모니터링

```bash
# Crashlytics 확인
# Firebase Console → Crashlytics

# 앱스토어 리뷰 모니터링
# App Store Connect / Play Console

# 사용자 피드백 수집
# support@matecheck.app
```

---

### 2. 업데이트 배포

**버전 번호 규칙**:
- **Patch** (1.0.1): 버그 수정
- **Minor** (1.1.0): 새 기능 추가
- **Major** (2.0.0): 대규모 변경

```bash
# app.config.js에서 버전 업데이트
# version: '1.0.1'
# iOS buildNumber: '2'
# Android versionCode: 2

# 새 빌드
eas build --profile production --platform all

# 제출
eas submit --platform all --latest
```

---

### 3. OTA 업데이트 (Over-The-Air)

> 앱스토어 심사 없이 JS 코드 업데이트 (선택)

```bash
# Expo Updates 설정
# app.config.js에 이미 설정됨

# 업데이트 배포
eas update --branch production --message "Bug fixes"

# 사용자가 앱 재시작 시 자동 적용
```

---

## 📚 참고 자료

- [Expo EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit 문서](https://docs.expo.dev/submit/introduction/)
- [App Store Connect 도움말](https://developer.apple.com/app-store-connect/)
- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer/)

---

**마지막 업데이트**: 2026-02-14
