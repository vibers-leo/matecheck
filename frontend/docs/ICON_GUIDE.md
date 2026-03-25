# 앱 아이콘 및 스플래시 스크린 가이드

> 고품질 아이콘으로 첫인상 개선 (KR1: 사용자 만족도)

---

## 🎨 필요한 이미지

### 1. 앱 아이콘 (`assets/icon.png`)

- **크기**: 1024 × 1024px
- **형식**: PNG (24-bit, 투명 배경 가능)
- **용도**: iOS App Store, Google Play Store
- **디자인 가이드**:
  - 심플하고 인식하기 쉬운 디자인
  - 브랜드 컬러 사용 (#FF7F50 오렌지)
  - 텍스트는 최소화 (아이콘만으로 의미 전달)

### 2. 적응형 아이콘 (`assets/adaptive-icon.png`)

- **크기**: 1024 × 1024px
- **안전 영역**: 중앙 66% (684 × 684px)
- **용도**: Android (다양한 모양으로 표시)
- **주의사항**:
  - 중요한 요소는 안전 영역 내에 배치
  - 배경 투명 또는 단색

### 3. 스플래시 스크린 (`assets/splash-icon.png`)

- **크기**: 1284 × 2778px (iPhone 14 Pro Max 기준)
- **형식**: PNG
- **배경색**: #FF7F50 (app.json에 설정됨)
- **디자인**:
  - 중앙에 로고 배치
  - 간결한 디자인 (빠른 로딩 느낌)

### 4. Favicon (`assets/favicon.png`)

- **크기**: 512 × 512px
- **용도**: 웹 버전
- **형식**: PNG

---

## 🛠️ 제작 도구

### 온라인 도구

1. **Figma** (추천)
   - https://figma.com
   - 무료, 협업 가능
   - 템플릿: "App Icon Template"

2. **Canva**
   - https://canva.com
   - 간단한 디자인
   - 템플릿 다양

3. **Icon Kitchen**
   - https://icon.kitchen
   - Android Adaptive Icon 자동 생성
   - 빠른 프로토타입

### 디자인 소프트웨어

- Adobe Illustrator (벡터)
- Adobe Photoshop (래스터)
- Sketch (Mac 전용)

---

## 🎯 디자인 컨셉 제안

### Option 1: 집 아이콘 + 체크마크

```
🏠✓
```

- **의미**: 보금자리(Nest) + 체크(Check)
- **컬러**: 오렌지 배경 + 흰색 아이콘

### Option 2: 하트 + 집

```
❤️🏡
```

- **의미**: 사랑하는 사람들과의 보금자리
- **컬러**: 그라데이션 (오렌지 → 핑크)

### Option 3: 미니멀 텍스트

```
MC
```

- **의미**: MateCheck 이니셜
- **컬러**: 흰색 텍스트 + 오렌지 배경
- **폰트**: 굵고 모던한 산세리프

---

## 📏 체크리스트

### 제작 전

- [ ] 브랜드 컬러 확인 (#FF7F50)
- [ ] 경쟁 앱 아이콘 분석
- [ ] 3가지 컨셉 스케치

### 제작 중

- [ ] 1024×1024px로 제작
- [ ] 여백 적절히 유지 (양쪽 10% 여백)
- [ ] 작은 크기에서도 인식 가능한지 확인
- [ ] 투명 배경 제거 (iOS는 자동 제거됨)

### 제작 후

- [ ] PNG 포맷으로 export
- [ ] 파일 크기 확인 (< 1MB)
- [ ] 다양한 배경에서 테스트 (흰색, 검은색, 회색)
- [ ] 실제 기기에서 확인

---

## 🔄 적용 방법

### 1. 파일 교체

```bash
# 기존 파일 백업
mv assets/icon.png assets/icon_old.png
mv assets/adaptive-icon.png assets/adaptive-icon_old.png
mv assets/splash-icon.png assets/splash-icon_old.png

# 새 파일 복사
cp /path/to/new-icon.png assets/icon.png
cp /path/to/new-adaptive-icon.png assets/adaptive-icon.png
cp /path/to/new-splash.png assets/splash-icon.png
```

### 2. 캐시 클리어 및 재빌드

```bash
# Expo 캐시 클리어
npx expo start --clear

# 네이티브 프로젝트 재생성 (필요 시)
npx expo prebuild --clean
```

### 3. 확인

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## 🎨 현재 아이콘 분석

### 기존 아이콘

- **위치**: `assets/icon.png`
- **크기**: (확인 필요)
- **상태**: 플레이스홀더 또는 초기 버전

### 개선 방향

1. **브랜드 아이덴티티 강화**
   - MateCheck의 핵심 가치 반영
   - "보금자리 공유" 컨셉 시각화

2. **경쟁력 확보**
   - 앱스토어에서 눈에 띄는 디자인
   - 타 가계부/할일 앱과 차별화

3. **전문성 표현**
   - 고품질 아이콘으로 신뢰도 향상
   - 세련된 디자인

---

## 🌟 Best Practices

### DO ✅

- 심플하고 명확한 디자인
- 브랜드 컬러 일관성 유지
- 다양한 크기에서 테스트
- 벡터 형식으로 먼저 작업 (나중에 PNG로 export)

### DON'T ❌

- 텍스트 과다 사용 (작은 크기에서 안 보임)
- 너무 복잡한 디테일
- 저작권 있는 이미지 사용
- 흐릿하거나 픽셀화된 이미지

---

## 📊 KR1 기여도

**앱스토어 평점 4.5점 이상 달성**

- **첫인상**: 아이콘은 사용자가 처음 보는 요소
- **다운로드율**: 매력적인 아이콘 → 설치율 향상
- **브랜드 인지도**: 일관된 디자인 → 재방문율 증가

---

## 📱 참고 이미지

### 우수 앱 아이콘 예시

- **Toss**: 파란색 배경 + 흰색 심볼
- **Notion**: 흰색 배경 + 검은색 심볼
- **Todoist**: 빨간색 체크마크

### 피해야 할 디자인

- 그라데이션 과다 (가독성 저하)
- 작은 텍스트 (14pt 이하)
- 저해상도 이미지

---

**마지막 업데이트**: 2026-02-14
