# MateCheck Frontend

> React Native (Expo) 기반 크로스 플랫폼 모바일 앱

---

## 📋 목차

- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [개발 서버 실행](#개발-서버-실행)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기술 스택](#주요-기술-스택)

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값을 설정하세요:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_URL_PRODUCTION=http://matecheck.vibers.co.kr

# App Configuration
EXPO_PUBLIC_APP_ENV=development

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
```

### 3. 개발 서버 실행

```bash
npm start
```

또는

```bash
npx expo start
```

---

## 🔐 환경 변수 설정

### 환경 변수 목록

| 변수명 | 설명 | 기본값 | 필수 여부 |
|-------|------|--------|----------|
| `EXPO_PUBLIC_API_URL` | 개발 환경 API URL | `http://localhost:3000` | ✅ |
| `EXPO_PUBLIC_API_URL_PRODUCTION` | 프로덕션 API URL | `http://matecheck.vibers.co.kr` | ✅ |
| `EXPO_PUBLIC_APP_ENV` | 앱 환경 (development/preview/production) | `development` | ✅ |
| `EXPO_PUBLIC_ENABLE_ANALYTICS` | 분석 기능 활성화 | `false` | ❌ |
| `EXPO_PUBLIC_ENABLE_CRASH_REPORTING` | 크래시 리포팅 활성화 | `false` | ❌ |

### 환경별 설정

#### 개발 환경 (Development)

```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### 미리보기 환경 (Preview/Staging)

```bash
EXPO_PUBLIC_APP_ENV=preview
EXPO_PUBLIC_API_URL=http://matecheck.vibers.co.kr
```

#### 프로덕션 환경 (Production)

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL_PRODUCTION=http://matecheck.vibers.co.kr
```

### Android Expo Go 주의사항

Android Expo Go 앱에서 로컬 백엔드 서버에 접속하려면, `localhost` 대신 컴퓨터의 로컬 IP 주소를 사용해야 합니다:

```bash
# ❌ 작동하지 않음 (Android Expo Go)
EXPO_PUBLIC_API_URL=http://localhost:3000

# ✅ 작동함 (컴퓨터의 로컬 IP 주소 사용)
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

로컬 IP 주소 찾는 방법:

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

## 🖥️ 개발 서버 실행

### 기본 실행

```bash
npm start
```

### 플랫폼별 실행

```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

### 캐시 클리어 후 실행

```bash
npx expo start --clear
```

---

## 📁 프로젝트 구조

```
frontend/
├── app/                      # Expo Router 기반 화면
│   ├── (onboarding)/        # 온보딩 플로우
│   ├── (tabs)/              # 메인 탭 화면
│   ├── toss/                # Toss 앱 내 기능 (룸메체크)
│   └── _layout.tsx          # 루트 레이아웃
├── components/              # 재사용 가능한 컴포넌트
│   ├── Avatar.tsx
│   ├── FloatingActionMenu.tsx
│   └── TossNavBar.tsx
├── constants/               # 상수 및 설정
│   ├── Config.ts           # 환경 변수 관리
│   └── data.ts             # Mock 데이터
├── store/                   # Zustand 전역 상태 관리
│   └── userStore.ts
├── assets/                  # 이미지, 폰트 등
├── .env                     # 환경 변수 (Git 무시됨)
├── .env.example             # 환경 변수 템플릿
├── app.config.js            # Expo 설정 (환경 변수 포함)
├── package.json
└── tsconfig.json
```

---

## 🛠️ 주요 기술 스택

### 핵심 프레임워크

- **React Native**: 0.74.5
- **Expo**: ~51.0.38
- **Expo Router**: ~3.5.24 (파일 기반 라우팅)

### 상태 관리

- **Zustand**: ^5.0.0 (경량 전역 상태 관리)
- **AsyncStorage**: 1.23.1 (로컬 저장소)

### 스타일링

- **NativeWind**: ^4.2.1 (Tailwind CSS for React Native)
- **TailwindCSS**: ^3.4.11

### UI 라이브러리

- **Lucide React Native**: ^0.563.0 (아이콘)
- **React Native Calendars**: ^1.1313.0
- **React Native Chart Kit**: ^6.12.0

### 기타

- **React Native SVG**: 15.2.0
- **React Native Reanimated**: ~3.10.1 (애니메이션)

---

## 📱 빌드 및 배포

### 개발 빌드 (로컬)

```bash
# iOS (Mac만 가능)
npx expo run:ios

# Android
npx expo run:android
```

### 프로덕션 빌드 (EAS)

```bash
# EAS 로그인
npx eas-cli login

# Android APK (테스트용)
npx eas-cli build --platform android --profile preview

# 프로덕션 빌드 (AAB)
npx eas-cli build --platform android --profile production

# iOS 프로덕션 빌드
npx eas-cli build --platform ios --profile production
```

자세한 내용은 [DEPLOYMENT_GUIDE_V2.md](../DEPLOYMENT_GUIDE_V2.md) 참조

---

## 🐛 디버깅

### 로그 확인

```bash
# React Native 로그
npx react-native log-android  # Android
npx react-native log-ios       # iOS

# Metro Bundler 로그
# (npm start 실행 시 자동으로 표시됨)
```

### 문제 해결

#### "Unable to resolve module" 오류

```bash
# 캐시 클리어 및 재시작
rm -rf node_modules
npm install
npx expo start --clear
```

#### 환경 변수가 적용되지 않음

```bash
# Metro Bundler 재시작 필요
# Ctrl+C로 중단 후 다시 시작
npx expo start --clear
```

#### Android Expo Go에서 API 연결 안 됨

- `.env` 파일의 `EXPO_PUBLIC_API_URL`을 컴퓨터의 로컬 IP로 변경
- 예: `http://192.168.0.10:3000`

---

## 📚 참고 자료

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

---

## 📄 라이선스

This project is proprietary and confidential.

---

**마지막 업데이트**: 2026-02-14
