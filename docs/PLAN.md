# MateCheck - 개발 계획 (Development Plan)

## 1. 개발 환경 및 기술 스택
- **Framework:** React Native (Expo SDK 50+)
- **Language:** TypeScript
- **Styling:** NativeWind (TailwindCSS for RN) or Styled-Components (User prefer "Vanilla CSS logic", but for RN utils are better. Will stick to standard RN StyleSheet or specific requested library if any. *Note: User mentioned "Vanilla CSS" in system prompt, but for RN/Expo, standard practices apply. I will use standard StyleSheet with a design token system for consistency.*)
- **Navigation:** Expo Router (File-based routing)
- **State Management:** Zustand or React Context (for simplicity & speed)
- **Backend (Mock/MVP):** Supabase or Firebase (Auth, DB) - *Initial phase might perform local state or rapid prototyping.*

## 2. 단계별 개발 일정 (Roadmap)

### Phase 1: 프로젝트 기초 설정 (Day 1-2)
- [ ] Expo 프로젝트 초기화 (`npx create-expo-app`)
- [ ] 디렉토리 구조 설계 (`src/components`, `src/screens`, `src/hooks`, `src/constants`)
- [ ] 디자인 시스템 토큰 정의 (Color, Typography, Spacing) - `DesignSystem.ts`
- [ ] 기본 네비게이션 구조 세팅 (Stack/Tab)

### Phase 2: 온보딩 및 홈 화면 (보금자리) (Day 3-5)
- [ ] **인트로/로그인 화면:** 소셜 로그인 UI (Mock), 닉네임 입력.
- [ ] **아바타 선택 UI:** 그리드 형태의 아바타 선택기.
- [ ] **보금자리 생성 Flow:** 보금자리 이름 입력 -> 배경 선택 -> 완료.
- [ ] **Home Screen (Nest):** 
  - 배경 이미지 렌더링.
  - 유저 및 멤버(펫/봇) 아바타 배치 (Absolute positioning or Flex wrap).
  - 상단 "가훈" 표시 영역 구현.

### Phase 3: 투두리스트 (Day 6-8)
- [ ] **Todo List Item 컴포넌트:** 체크박스, 텍스트, 담당자 아이콘.
- [ ] **Todo 작성 모달:** 할 일 이름, 반복 주기 설정 UI.
- [ ] **완료 로직:** 터치 시 애니메이션과 함께 완료 처리, "누가 했는지" 아바타 표시.

### Phase 4: 캘린더 & 투표 (Day 9-12)
- [ ] **캘린더 뷰:** `react-native-calendars` 커스터마이징 또는 자체 구현.
- [ ] **일정 추가:** 날짜 선택 -> 내용 입력.
- [ ] **투표 기능:** 투표 주제 생성 -> 멤버별 날짜 선택 로직 구현.

### Phase 5: 설정 및 프리미엄 (Day 13-14)
- [ ] **구성원 관리:** 초대(Share API), 멤버 추가(펫/식물 등) 수동 입력 폼.
- [ ] **구독 페이지(UI Only):** 가계부 기능, 프리미엄 테마 잠금 표시.

### Phase 6: 폴리싱 및 튜토리얼 (Day 15+)
- [ ] **튜토리얼 오버레이:** 앱 최초 실행 시 가이드 표시 (Tooltip or Walkthrough).
- [ ] **애니메이션 강화:** 화면 전환, 버튼 인터랙션, 축하 효과(Confetti).

## 3. 컨벤션 및 워크플로우
- **Commits:** 기능 단위 커밋 (`feat:`, `fix:`, `style:`, `docs:`)
- **Review:** 각 단계 완료 시 유저(PM)에게 중간 결과물 스크린샷/비디오 보고.
- **Documentation:** 변경 사항은 `SESSION_LOG.md`에 실시간 기록.

## 4. 우선순위 (MVP)
1. 보금자리(홈)의 시각적 완성도 (Wow Factor)
2. 투두리스트의 "공유 & 체크" 경험
3. 기본적인 일정 추가/보기
*가계부 등 결제 연동 기능은 UI 목업 형태로 우선 구현.*
