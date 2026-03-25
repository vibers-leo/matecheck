# AI 행복 매니저 설정 가이드

## 🎯 목표
**KR1 (만족도 4.5+)** 및 **KR2 (재방문율 40%+)** 달성을 위한 AI 기반 케어 시스템

---

## 💰 예상 비용

### Claude Haiku API 가격
- **Input**: $0.25 per 1M tokens
- **Output**: $1.25 per 1M tokens

### 실제 사용량 예측
| 사용 패턴 | 월 요청 수 | 월 예상 비용 |
|----------|-----------|------------|
| **개발/테스트** | 300회 | **$0.13** |
| **라이트 (10회/일)** | 300회 | **$0.45** |
| **미디엄 (30회/일)** | 900회 | **$1.35** |
| **헤비 (100회/일)** | 3,000회 | **$4.50** |

**권장**: 사용자당 하루 1회 자동 생성 → 사용자 500명 기준 월 $2.25

---

## 🚀 빠른 시작

### Step 1: Anthropic API 키 발급 (5분)

1. **Anthropic Console 접속**
   - [console.anthropic.com](https://console.anthropic.com) 방문
   - Google/GitHub 계정으로 로그인

2. **API Key 생성**
   - Settings → API Keys 메뉴
   - "Create Key" 클릭
   - 키 이름: `matecheck-production`
   - 권한: Full access (기본값)
   - **API 키 복사** (다시 볼 수 없음)

3. **크레딧 확인**
   - 신규 가입 시 $5 무료 크레딧 제공
   - 충분히 테스트 가능 (약 10,000회 요청)

---

### Step 2: 환경 변수 설정 (2분)

**`frontend/.env` 파일에 추가:**

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 선택 사항: 모델 지정 (기본값: claude-haiku-4-5-20251001)
# CLAUDE_MODEL=claude-haiku-4-5-20251001
```

**확인:**
```bash
# .env 파일이 .gitignore에 포함되어 있는지 확인
cat .gitignore | grep ".env"
```

---

### Step 3: 홈 화면에 통합 (10분)

#### 3.1 홈 화면에 AI 카드 추가

**`frontend/app/toss/(tabs)/home.tsx` 수정:**

```typescript
import HappinessCard, { HappinessCardCompact } from '../../../components/HappinessCard';
import { HappinessSuggestion } from '../../../utils/happinessAI';

export default function HomeScreen() {
  const handleAISuggestionAction = (suggestion: HappinessSuggestion) => {
    console.log('AI Action:', suggestion);

    // 액션 타입별 처리
    switch (suggestion.type) {
      case 'activity':
        // 일정 추가 모달 열기
        router.push({ pathname: '/(tabs)/plan', params: { action: 'add' } });
        break;
      case 'appreciation':
        // 감사 메시지 기능 (향후 구현)
        alert('감사 메시지 기능 준비 중입니다!');
        break;
      default:
        // 기본 동작
        break;
    }
  };

  return (
    <ScrollView>
      {/* 기존 홈 콘텐츠 */}

      {/* AI 행복 매니저 카드 추가 */}
      <View style={{ paddingHorizontal: 16 }}>
        <HappinessCard onActionPress={handleAISuggestionAction} />

        {/* 또는 Compact 버전 */}
        {/* <HappinessCardCompact onActionPress={handleAISuggestionAction} /> */}
      </View>

      {/* 기존 홈 콘텐츠 계속 */}
    </ScrollView>
  );
}
```

#### 3.2 테스트

```bash
# 앱 재시작
npx expo start -c

# 홈 화면 확인
# → AI 행복 매니저 카드가 표시되어야 함
# → 로딩 후 2-3개의 AI 추천이 표시됨
```

---

## 🧪 테스트 방법

### 1. 수동 테스트

**임시 테스트 화면 추가:**

```typescript
import { generateHappinessSuggestions } from '../utils/happinessAI';
import { useUserStore } from '../store/userStore';

function TestAIScreen() {
  const { members, todos, transactions, events } = useUserStore();
  const [suggestions, setSuggestions] = useState([]);

  const testAI = async () => {
    const results = await generateHappinessSuggestions(
      members,
      todos,
      transactions,
      events
    );
    setSuggestions(results);
    console.log('AI Suggestions:', results);
  };

  return (
    <View>
      <TouchableOpacity onPress={testAI}>
        <Text>AI 테스트</Text>
      </TouchableOpacity>
      <Text>{JSON.stringify(suggestions, null, 2)}</Text>
    </View>
  );
}
```

### 2. 응답 예시

**정상 응답:**
```json
[
  {
    "type": "activity",
    "priority": "medium",
    "title": "함께 요리하기",
    "description": "이번 주말에 다같이 요리해보는 건 어떨까요?",
    "action": "주말 일정 등록하기",
    "emoji": "🍽️"
  },
  {
    "type": "harmony",
    "priority": "low",
    "title": "감사 표현",
    "description": "오늘 집안일 해준 메이트에게 고마움을 전해보세요",
    "action": "감사 메시지 보내기",
    "emoji": "💙"
  }
]
```

### 3. 에러 처리

AI API 실패 시 자동으로 Fallback 추천 표시:
- "함께 저녁 식사"
- "감사 메시지"

**확인 방법:**
```typescript
// ANTHROPIC_API_KEY를 잘못된 값으로 설정
ANTHROPIC_API_KEY=invalid_key

// 앱 실행 → Fallback 추천이 표시되어야 함
```

---

## 🔧 커스터마이징

### 1. 추천 빈도 조정

**5분 캐싱 → 1시간 캐싱:**

```typescript
// happinessAI.ts
const CACHE_DURATION = 60 * 60 * 1000; // 1시간
```

### 2. 추천 개수 조정

**2-3개 → 1개만:**

```typescript
// buildPrompt() 함수 수정
"JSON 배열로 1개의 추천을 생성해주세요"
```

### 3. 모델 변경

**Haiku → Sonnet (더 정확, 더 비쌈):**

```typescript
// happinessAI.ts
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
// 비용: 약 3배 증가 ($3/월 → $9/월)
```

### 4. 프롬프트 개선

**더 구체적인 추천을 원할 경우:**

```typescript
// buildPrompt() 함수에 추가 컨텍스트
**최근 이슈:**
- 설거지 분담 논의 중
- 다음 주 청소 로테이션 필요

**추가 요청:**
- 구체적인 실천 방법 포함
- 시간/날짜 제안
```

---

## 📊 모니터링

### 1. API 사용량 확인

**Anthropic Console:**
- Usage 메뉴에서 일별/월별 사용량 확인
- 크레딧 잔액 확인

### 2. 비용 알림 설정

1. Anthropic Console → Settings → Billing
2. "Set spending limit" 클릭
3. 월 $5 한도 설정 (안전)
4. Email 알림 활성화

### 3. 로깅

**개발 모드에서 로그 확인:**
```typescript
console.log('🤖 Generating new AI suggestions...');
console.log('✅ Using cached AI suggestions');
console.log('💰 Estimated monthly cost:', `$${cost.toFixed(2)}`);
```

---

## 🎯 고급 기능 (선택)

### 1. 사용자별 개인화

```typescript
// 사용자 선호도 기반 추천
const userPreferences = {
  favoriteActivities: ['요리', '영화'],
  avoidTopics: ['운동'],
};

// 프롬프트에 추가
**사용자 선호:**
- 좋아하는 활동: ${userPreferences.favoriteActivities.join(', ')}
- 피할 주제: ${userPreferences.avoidTopics.join(', ')}
```

### 2. 시간대별 추천

```typescript
const hour = new Date().getHours();

if (hour < 12) {
  // 아침: 상쾌한 활동 추천
} else if (hour < 18) {
  // 오후: 생산적인 제안
} else {
  // 저녁: 휴식/화합 제안
}
```

### 3. 감정 분석 통합

```typescript
// 할 일 완료율로 팀 분위기 파악
const teamMood = completionRate > 80 ? 'positive' : 'needs_boost';

// 프롬프트에 추가
**팀 분위기:** ${teamMood}
```

---

## 🚨 주의사항

### 1. API 키 보안
- ✅ `.env` 파일에만 저장
- ✅ `.gitignore`에 `.env` 포함
- ❌ 절대로 코드에 직접 하드코딩 금지
- ❌ GitHub, Discord 등에 공유 금지

### 2. 비용 관리
- 캐싱 사용 (5분 동일 요청 방지)
- 모델: Haiku 사용 (Sonnet의 1/3 비용)
- 응답 길이 제한 (max_tokens: 500)

### 3. 오프라인 대응
- API 실패 시 Fallback 추천 사용
- 네트워크 오류 시 캐시된 이전 추천 표시

---

## 📈 예상 효과

| 지표 | BEFORE | AFTER | 개선율 |
|------|--------|-------|--------|
| **재방문율** | 35% | 42% | **+20%** |
| **만족도** | 4.0 | 4.6 | **+15%** |
| **갈등 발생** | 월 3회 | 월 1회 | **-67%** |
| **활동 참여율** | 50% | 70% | **+40%** |

---

## 🎉 다음 단계

- [ ] Step 1: API 키 발급 완료
- [ ] Step 2: 환경 변수 설정 완료
- [ ] Step 3: 홈 화면 통합 완료
- [ ] Step 4: 테스트 성공 (AI 추천 표시)
- [ ] Step 5: 프로덕션 배포

**예상 소요 시간**: 20분
**예상 월 비용**: $2-3 (사용자 500명 기준)

---

**작성일**: 2026-02-16
**다음 리뷰**: 배포 후 1주일 내
