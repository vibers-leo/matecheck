# MateCheck — 디자인 가이드

> 상위 브랜드: 계발자들 (Vibers)
> 디자인 아이덴티티: 따뜻한, 가정적인, 신뢰

## API 응답 규칙

### 성공 응답 형식
```json
{
  "message": "성공 메시지",
  "user": { ... },
  "nest": { ... }
}
```

### 에러 응답 형식
```json
{
  "error": "에러 메시지",
  "errors": ["상세 에러 1", "상세 에러 2"]
}
```

### HTTP 상태 코드
| 코드 | 용도 |
|------|------|
| 200 | 조회/수정 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (No Content) |
| 401 | 인증 실패 |
| 404 | 리소스 없음 |
| 422 | 유효성 검사 실패 |

## 프론트엔드 디자인 (React Native)

### 컬러 시스템
| 역할 | 값 | 설명 |
|------|-----|------|
| Primary | #0066FF | 메인 컬러 (CTA, 강조) |
| Background | #F5F5F5 | 앱 배경 |
| Card | #FFFFFF | 카드/모달 배경 |
| Text Primary | #1A1A1A | 본문 텍스트 |
| Text Secondary | #666666 | 보조 텍스트 |
| Success | #34C759 | 성공 상태 |
| Warning | #FF9500 | 경고 상태 |
| Error | #FF3B30 | 에러 상태 |

### 타이포그래피
- 한글: 시스템 기본 (Apple SD Gothic Neo / Noto Sans KR)
- 영문: 시스템 기본 (SF Pro / Roboto)
- 제목: 20-24px Bold
- 본문: 14-16px Regular
- 보조: 12px Regular

### 레이아웃
- 반응형: React Native Dimensions API
- 카드 간격: 16px
- 섹션 간격: 24px
- 버튼 높이: 48px (최소 터치 영역)

### 컴포넌트 패턴
- 카드: 둥근 모서리 (16px), 그림자
- 버튼: Primary(파란색), Secondary(회색 아웃라인), Danger(빨간색)
- 토스트: 상단에서 슬라이드 (성공=초록, 에러=빨강)
- 로딩: ActivityIndicator + 설명 텍스트
- 빈 상태: 아이콘 + 안내 문구

### 접근성
- 최소 터치 영역 44x44pt
- 색맹 대비 (명도 대비 4.5:1 이상)
- 다크모드: 지원 예정

## Nest 테마 시스템
MateCheck은 Nest(보금자리)별 테마를 지원:
- theme_id로 관리
- 프론트엔드에서 테마별 색상/아이콘 매핑

---

**마지막 업데이트**: 2026-03-24
