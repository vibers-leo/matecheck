# 🏦 RoommateCheck (룸메체크) - Toss Mini-App Guideline

이 문서는 **메이트체크(MateCheck)**의 토스 미니앱 버전인 **룸메체크(RoommateCheck)**의 UI/UX 및 기능 연동 가이드라인을 정의합니다. 모든 개발은 토스 앱 내부에서 실행되는 '미니앱'으로서의 사용자 경험을 극대화하는 데 초점을 맞춥니다.

## 1. UI/UX: Toss Design System (TDS) 지향
토스 사용자에게 이질감 없는 경험을 주기 위해 아래 원칙을 준수합니다.

### 🎨 Color & Typography
- **Primary Color:** `text-toss-blue` (#3182f6) - 버튼 및 핵심 강조.
- **Background:** `bg-[#f2f4f6]` (기본 배경) 및 `bg-white` (카드/시트).
- **Text:** `text-toss-gray-dark` (#191f28, 본분) 및 `text-toss-gray` (#4e5968, 부가설명).
- **Heading:** 매우 굵은 폰트(Bold/Black)와 큰 자수(32px+)를 사용하여 숫자를 강조 (예: 정산 금액).

### 📐 Layout & Interaction
- **Whitespace:** 일반 앱보다 더 넓은 여백을 사용하여 깔끔한 인상 유지.
- **Flat Design:** 과도한 그림자나 입체 효과보다는 면(Background Color)의 대비를 이용해 구분.
- **Bottom Sheets:** 토스 특유의 부드러운 바텀 시트 연동을 통해 모달 경험 제공.

## 2. 핵심 기능 연동 (Toss Synergy)
토스 미니앱만의 강점을 활용하여 "극한의 편의성"을 구현합니다.

### 💰 결제 및 송금 (Toss Pay)
- **Direct Pay:** 정산 완료 시 외부 앱 이동 없이 토스 비밀번호 입력창 호출.
- **Automatic Split:** 공동 결제 내역을 토스 내역에서 바로 불러와서 1/N 제안.

### 👥 소셜 연동 (Toss Friends)
- **Friend Pick:** 휴대폰 번호 입력 대신 토스 친구 목록에서 메이트 즉시 선택 및 초대.
- **Shared Calendar:** 토스 앱 내 캘린더와 일정 동기화.

### 🔔 알림 (Toss Notification)
- **Official Channel:** 앱 내 자체 알림 대신 토스 공식 알림 채널을 이용해 높은 도달률 확보.

## 3. 메이트체크 vs 룸메체크 전략
- **메이트체크 (Normal App):** "공동생활의 따뜻함" (Coral 테마, 감성적 UI).
- **룸메체크 (Toss App):** "압도적인 금융 편의성" (TDS Blue 테마, 효율성 중심 UX).

---
*이 가이드라인은 프로젝트가 100% 완성되어 정식 분리될 때까지 RoommateCheck 개발의 기준점이 됩니다.*
