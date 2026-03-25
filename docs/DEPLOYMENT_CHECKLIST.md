# MateCheck 배포 최종 체크리스트

> 최종 업데이트: 2026-03-08

---

## ✅ 완료된 항목

### 프로젝트 설정
- [x] `app.config.js` 설정 완료 (bundleId: `com.matecheck.juuuno`)
- [x] EAS projectId 연결 (`5b232716-3c32-4694-92a6-54d5762b0098`)
- [x] 앱 이름/슬러그/스킴 설정
- [x] iOS/Android 권한 설정 (카메라, 사진 라이브러리)

### 문서 준비
- [x] `APP_STORE_METADATA.md` — 앱 이름, 설명, 키워드
- [x] `EAS_BUILD_SUBMIT_GUIDE.md` — 빌드/제출 가이드
- [x] `DEPLOYMENT_GUIDE_V2.md` — 배포 전체 가이드
- [x] `PRIVACY_POLICY.md` — 개인정보 처리방침 (마크다운)
- [x] `ASO_GUIDE.md` — ASO 최적화 가이드

### 비주얼 에셋
- [x] 앱 아이콘 (`icon.png`, 1024×1024) — Canva 제작
- [x] 어댑티브 아이콘 (`adaptive-icon.png`) — Canva 제작
- [x] 스플래시 아이콘 (`splash-icon.png`) — Canva 제작
- [x] Feature Graphic (`feature-graphic.png`, 1024×500) — Canva 제작 + 리사이즈
- [x] 스토어 스크린샷 4장 (1080×1920) — Canva 목업 제작
  - `screenshots/screenshot_01_hero.png` — 히어로 화면
  - `screenshots/screenshot_02_tasks.png` — 할 일 관리
  - `screenshots/screenshot_03_calendar.png` — 일정 관리
  - `screenshots/screenshot_04_budget.png` — 가계부

### 개인정보 처리방침
- [x] `docs/privacy.html` — 웹 호스팅용 HTML 페이지 작성

### 개발자 계정
- [x] Apple Developer Program 가입 및 결제
- [x] Google Play Console 가입 및 결제

---

## ⏳ 대기 중인 항목

### 개발자 계정 승인
- [ ] Apple Developer 계정 승인 대기 (최대 48시간)
- [ ] Google Play Console 계정 승인 대기

---

## 🔲 남은 작업 (Claude Code에서 진행)

### 개인정보 처리방침 호스팅
- [ ] GitHub Pages 활성화 (Settings → Pages → Source: main, /docs)
- [ ] `https://juuuno-coder.github.io/matecheck/privacy.html` 접근 확인
- [ ] `app.config.js`에 개인정보 처리방침 URL 추가 (필요시)

### AdMob 설정
- [ ] AdMob 콘솔에서 App ID 발급
- [ ] `app.config.js`의 플레이스홀더 ID 교체
  - iOS: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
  - Android: `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

### 빌드 및 제출
- [ ] `eas build --platform android --profile production` 실행
- [ ] `eas build --platform ios --profile production` 실행
- [ ] Android: Google Play Console에서 앱 만들기 → AAB 업로드
- [ ] iOS: App Store Connect에서 신규 앱 → `eas submit --platform ios`

### 스토어 등록 정보 입력
- [ ] iOS — App Store Connect:
  - [ ] 앱 이름, 부제목, 카테고리 입력
  - [ ] 설명, 키워드 입력 (`APP_STORE_METADATA.md` 참고)
  - [ ] 스크린샷 업로드 (6.7인치, 6.5인치, 5.5인치)
  - [ ] 개인정보 처리방침 URL 입력
  - [ ] 앱 심사 정보 입력 (데모 계정 등)
- [ ] Android — Google Play Console:
  - [ ] 앱 이름, 간단한 설명, 자세한 설명 입력
  - [ ] Feature Graphic 업로드
  - [ ] 스크린샷 업로드 (최소 2장, 권장 4장+)
  - [ ] 개인정보 처리방침 URL 입력
  - [ ] 콘텐츠 등급 설문 완료
  - [ ] 대상 연령 설정

### 심사 제출
- [ ] iOS 심사 제출 → 검토 대기 (1~3일)
- [ ] Android 심사 제출 → 검토 대기 (수 시간~3일)

---

## 📋 파일 위치 요약

| 에셋 | 경로 |
|------|------|
| 앱 아이콘 | `frontend/assets/icon.png` |
| 어댑티브 아이콘 | `frontend/assets/adaptive-icon.png` |
| 스플래시 | `frontend/assets/splash-icon.png` |
| Feature Graphic | `frontend/assets/feature-graphic.png` |
| 스크린샷 (4장) | `frontend/assets/screenshots/` |
| 개인정보 처리방침 HTML | `docs/privacy.html` |
| 앱 설정 | `frontend/app.config.js` |

---

## 🔗 Canva 원본 편집 링크

필요 시 Canva에서 수정 가능:
- 앱 아이콘: `DAHDXhUyVCc`
- Feature Graphic: `DAHDXj-GBbk`
- 스크린샷 1 (히어로): `DAHDXpX-x34`
- 스크린샷 2 (할 일): `DAHDXvIJJbA`
- 스크린샷 3 (일정): `DAHDXlDKu0g`
- 스크린샷 4 (가계부): `DAHDXtd7x1E`
