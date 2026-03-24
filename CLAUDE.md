# MateCheck (메이트체크) — 프로젝트 개발 가이드

## 프로젝트 개요
공유 가구/룸메이트를 위한 공동 생활 관리 플랫폼. 미션, 가계부, 일정, 규칙 등을 관리하는 JSON API 서버.
- **도메인**: matecheck.vibers.co.kr
- **운영**: 계발자들 (Vibers) — vibers.co.kr

## 상위 브랜드
계발자들 (Vibers) — vibers.co.kr / server.vibers.co.kr

## 기술 스택
| 항목 | 기술 |
|------|------|
| Framework | Ruby on Rails 8.1.1 (API-only) |
| Language | Ruby 3.4.7 |
| Database | SQLite (dev) / PostgreSQL 16 (prod) |
| Auth | bcrypt + has_secure_password |
| Server | Puma |
| Container | Docker (multi-stage build) |
| CORS | rack-cors |
| Crawler | Nokogiri + HTTParty (정책 RSS) |
| Cache | Solid Cache |
| Queue | Solid Queue |
| CI | Brakeman, RuboCop, Rails Test |

## 프로젝트 구조
```
matecheck/
├── backend/                  ← Rails API 서버
│   ├── app/
│   │   ├── controllers/      ← 16개 API 컨트롤러
│   │   ├── models/           ← 16개 모델
│   │   ├── services/         ← PolicyCrawlerService
│   │   ├── mailers/          ← SupportMailer
│   │   └── views/            ← 메일러 뷰
│   ├── config/
│   │   ├── routes.rb         ← API 라우팅
│   │   ├── database.yml      ← DB 설정
│   │   └── initializers/
│   │       └── cors.rb       ← CORS 설정
│   ├── db/migrate/           ← 22개 마이그레이션
│   ├── Dockerfile            ← 멀티스테이지 빌드
│   ├── docker-compose.yml    ← PostgreSQL + API
│   └── .github/workflows/
│       ├── ci.yml            ← CI 파이프라인
│       └── fly-deploy.yml    ← (레거시)
├── frontend/                 ← React Native (Expo)
├── CLAUDE.md                 ← 이 파일
├── OKR.md                    ← 분기 목표
└── docs/                     ← 문서
```

## 핵심 파일
| 파일 | 설명 |
|------|------|
| backend/config/routes.rb | API 엔드포인트 정의 (Nest 중심 리소스) |
| backend/app/models/nest.rb | 핵심 모델 — 보금자리(가구) |
| backend/app/models/user.rb | 사용자 모델 (has_secure_password) |
| backend/app/controllers/nests_controller.rb | Nest CRUD + 초대/가입/승인 |
| backend/app/services/policy_crawler_service.rb | 정부 정책 RSS 크롤러 |
| backend/config/initializers/cors.rb | CORS 설정 (Vercel 도메인) |
| backend/docker-compose.yml | 프로덕션 Docker 구성 |

## 디자인 특징
순수 JSON API 서버로 프론트엔드 디자인 없음. 프론트엔드는 React Native (Expo)로 별도 관리.
→ 상세 내용은 DESIGN_GUIDE.md 참조

## 개발 규칙
### 코드 스타일
- API-only 모드 (ActionController::API)
- Strong Parameters 필수
- N+1 쿼리 방지 (includes 사용)
- 한글 우선 (에러 메시지, 주석)

### Git 규칙
- 한글 커밋 (feat:, fix:, refactor:, chore: 접두사)
- 에이전트 태그 필수: [AG], [CC], [TCC], [APP]
- `git add .` 사용 금지 → 항상 `git add <특정 파일>`
- 커밋 전 `git pull origin main` 실행

### 배포
- GitHub Actions → SSH → NCP Docker 자동 재빌드
- `git push origin main` 트리거

## 멀티 에이전트 협업 체계

| 태그 | 환경 | 역할 |
|------|------|------|
| [AG] | AntiGravity (VS Code 익스텐션) | 코딩 메인. LEO가 직접 지시 |
| [CC] | Claude Code (VS Code) | 단일 앱 작업 |
| [TCC] | Claude Code (터미널 / iTerm2) | 병렬 작업 |
| [APP] | Claude Code (앱, 클라우드) | 보조 작업 |
| [CW] | Claude Cowork (데스크톱) | 비코딩 (서버 관리, 문서) |

## NCP 서버 정보
- **IP**: 49.50.138.93
- **SSH**: ssh root@49.50.138.93
- **프로젝트 경로**: /root/projects/matecheck/
- **Docker 네트워크**: npm_default

## 포트맵
| 포트 | 컨테이너명 | 도메인 |
|------|-----------|--------|
| 4010 | matecheck-api | matecheck.vibers.co.kr |

## Docker Compose 규칙
- 컨테이너명: matecheck-api, matecheck-db
- DB: postgres:16-alpine
- 네트워크: npm_default (external: true) + internal
- restart: unless-stopped
- 환경변수: .env 파일로 관리

## 배포 방식
- `.github/workflows/deploy.yml` (GitHub Actions)
- `git push origin main` → SSH → NCP Docker 재빌드
- GitHub Secrets: NCP_HOST, NCP_USER, NCP_SSH_KEY

## SSL 절대 규칙
- Cloudflare Full Mode (주황구름 ON)
- NPM에서 Let's Encrypt 발급하지 마!
- NPM에서는 HTTP 프록시만 설정
- server, *.server 만 DNS Only (회색구름)

## 주요 명령어
```bash
# 개발 서버
cd backend && bin/rails server

# DB 마이그레이션
bin/rails db:migrate

# 콘솔
bin/rails console

# 테스트
bin/rails test

# Docker (프로덕션)
docker compose up -d --build
```

---

## OKR 준수 원칙

### **핵심 원칙: 모든 작업은 OKR과 정렬되어야 함**

이 프로젝트의 **Objective (목표)**는:
> **"모든 보금자리 구성원들이 스트레스 없이, 즐겁게 함께 살아가는 일상을 경험하게 한다"**

모든 코드 작성, 기능 개발, 버그 수정은 이 목표를 향해야 합니다.

---

## OKR 기반 작업 프로세스

### 1. **작업 시작 전 OKR 확인**

새로운 작업을 시작하기 전, 다음을 자문하세요:

```
Q1. 이 작업이 어떤 Key Result(KR)에 기여하는가?
Q2. 이 작업이 사용자에게 실질적인 가치를 주는가? (Output vs Outcome)
Q3. 이 작업의 우선순위는? (OKR Initiatives와 일치하는가?)
```

**예시:**
- ❌ **Bad**: "로그인 UI를 예쁘게 만들자" (Output 중심, OKR과 무관)
- ✅ **Good**: "로그인 실패 시 명확한 에러 메시지를 표시하여 사용자 이탈률을 줄이자" (Outcome 중심, KR2 재방문율에 기여)

### 2. **작업 중 OKR 지표 염두**

코드를 작성할 때 다음 지표를 항상 고려하세요:

| **KR** | **지표** | **코드 작성 시 고려사항** |
|--------|---------|-------------------------|
| KR1: 사용자 만족도 | 앱스토어 평점 4.5+ | 버그 없는 코드, 직관적인 UX, 명확한 에러 메시지 |
| KR2: 재방문율 | DAU/MAU 40%+ | 빠른 로딩, 매끄러운 애니메이션, 유용한 기능 |
| KR3: 안정성 | 크래시율 0.5% 이하 | 에러 핸들링, Try-Catch, Null 체크, 타입 안정성 |
| KR4: 초기 성장 | 500명 가입, 100개 Nest | 쉬운 온보딩, 초대 기능 최적화 |

### 3. **작업 완료 후 OKR 기여도 평가**

Pull Request나 커밋 메시지에 OKR 기여도를 명시하세요:

```
feat: API 에러 핸들링 개선 및 사용자 피드백 추가

- KR1 (만족도)에 기여: 에러 발생 시 명확한 Toast 메시지로 사용자 혼란 감소
- KR3 (안정성)에 기여: 네트워크 오류 시 자동 재시도로 크래시 방지

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 코드 작성 원칙

### **원칙 1: Output이 아닌 Outcome에 집중**

- ❌ "기능을 구현했다"에서 멈추지 말고
- ✅ "이 기능이 사용자에게 어떤 가치를 주는가?"까지 생각

**예시:**
```typescript
// ❌ Bad: 단순히 로딩 인디케이터 추가 (Output)
<ActivityIndicator />

// ✅ Good: 사용자 경험 개선을 위한 로딩 인디케이터 + 텍스트 (Outcome)
<View>
  <ActivityIndicator size="large" color="#0066FF" />
  <Text style={styles.loadingText}>보금자리 정보를 불러오는 중...</Text>
</View>
```

### **원칙 2: KR3 (안정성) 항상 준수**

모든 코드는 다음을 포함해야 합니다:

```typescript
// 1. Try-Catch로 에러 핸들링
try {
  const response = await fetch(API_URL);
  // ...
} catch (error) {
  console.error('API 호출 실패:', error);
  showErrorToast('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
}

// 2. Null 체크
const user = useUserStore((state) => state.userId);
if (!user) {
  return <LoginPrompt />;
}

// 3. 타입 안정성 (TypeScript)
interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}
```

### **원칙 3: 성능 최적화 (KR2 재방문율 기여)**

- 불필요한 리렌더링 방지 (`React.memo`, `useMemo`, `useCallback`)
- 이미지 최적화 (`react-native-fast-image`)
- 긴 리스트 가상화 (`FlashList`)

```typescript
// ✅ Good: useMemo로 불필요한 계산 방지
const totalExpense = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);
```

### **원칙 4: 사용자 피드백 제공 (KR1 만족도 기여)**

모든 사용자 액션에 명확한 피드백을 제공하세요:

```typescript
// ✅ 성공 시 Toast
await addTodo(title);
showSuccessToast('할 일이 추가되었습니다!');

// ✅ 실패 시 Toast
catch (error) {
  showErrorToast('할 일 추가에 실패했습니다. 다시 시도해주세요.');
}

// ✅ 로딩 상태 표시
const [isLoading, setIsLoading] = useState(false);
if (isLoading) return <LoadingSpinner />;
```

---

## OKR 지표 모니터링

### **작업 전 체크리스트**

- [ ] 이 작업이 OKR Initiatives에 포함되어 있는가?
- [ ] 이 작업이 최소 1개 이상의 KR에 긍정적 영향을 주는가?
- [ ] 이 작업의 우선순위가 높은가? (Phase 1 > Phase 2 > Phase 3)

### **작업 중 지속 확인**

- [ ] 코드가 KR3 (안정성) 기준을 충족하는가? (에러 핸들링, Null 체크)
- [ ] 코드가 KR2 (재방문율)에 기여하는가? (성능 최적화, UX 개선)
- [ ] 코드가 KR1 (만족도)에 기여하는가? (버그 없음, 직관적 UI)

### **작업 완료 후 검증**

- [ ] 변경사항이 기존 기능을 망가뜨리지 않았는가? (회귀 테스트)
- [ ] 사용자 시나리오를 테스트했는가? (E2E 시나리오)
- [ ] 커밋 메시지에 OKR 기여도를 명시했는가?

---

## OKR 위배 사례 (하지 말아야 할 것)

### ❌ **사례 1: Output만 추구하는 작업**

```typescript
// ❌ Bad: 그냥 기능만 만듦
function addTodo(title: string) {
  todos.push({ id: uuid(), title, isCompleted: false });
}
```

```typescript
// ✅ Good: 사용자 가치를 고려한 기능
async function addTodo(title: string) {
  if (!title.trim()) {
    showErrorToast('할 일 제목을 입력해주세요.');
    return;
  }

  try {
    const newTodo = await api.post('/todos', { title });
    set((state) => ({ todos: [newTodo, ...state.todos] }));
    showSuccessToast('할 일이 추가되었습니다!');
    trackEvent('todo_added'); // KR4: 사용자 행동 추적
  } catch (error) {
    showErrorToast('할 일 추가에 실패했습니다.');
    logError(error); // KR3: 크래시 모니터링
  }
}
```

### ❌ **사례 2: OKR과 무관한 작업**

- "코드를 리팩토링하고 싶어서 리팩토링" (사용자 가치 없음)
- "새로운 라이브러리를 써보고 싶어서 도입" (OKR에 기여 안 함)

→ **모든 작업은 OKR Initiatives에 명시되어 있거나, 최소한 KR에 긍정적 영향을 주어야 함**

### ❌ **사례 3: 품질 무시한 빠른 구현**

```typescript
// ❌ Bad: 에러 핸들링 없음 (KR3 위배)
const data = await fetch(API_URL).then(r => r.json());
setData(data);

// ✅ Good: 안정성 고려
try {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('API 오류');
  const data = await response.json();
  setData(data);
} catch (error) {
  logError(error);
  showErrorToast('데이터를 불러오지 못했습니다.');
}
```

---

## OKR 달성을 위한 우선순위

### **Phase 1: 배포 준비 (최우선)**

현재 단계에서는 다음 작업이 최우선입니다:

1. **에러 핸들링 강화** (KR3 안정성)
2. **성능 최적화** (KR2 재방문율)
3. **환경 변수 관리** (KR3 안정성)
4. **인증 보안 강화** (KR1 만족도, KR3 안정성)
5. **API 클라이언트 추상화** (코드 품질, 유지보수성)

### **Phase 2: 품질 보증 (차순위)**

6. **테스트 코드 작성** (KR3 안정성)
7. **크래시 모니터링 연동** (KR3 안정성)
8. **베타 테스트** (KR1 만족도)

### **Phase 3: 런칭 준비 (배포 직전)**

9. **ASO 최적화** (KR4 초기 성장)
10. **개인정보 처리방침** (법적 요구사항)
11. **스토어 배포** (KR4 초기 성장)

---

## OKR 주간 체크인 (매주 월요일)

매주 월요일, 다음을 점검하세요:

```markdown
## [YYYY-MM-DD] OKR 주간 체크인

### 이번 주 완료한 Initiatives
- [ ] Initiative 1: ...
- [ ] Initiative 2: ...

### KR 진행 상황
- **KR1 (만족도)**: (아직 출시 전이므로 N/A, 단 베타 테스트 피드백 있으면 기록)
- **KR2 (재방문율)**: (아직 출시 전이므로 N/A)
- **KR3 (안정성)**:
  - 크래시 발생 건수: X건 (목표: 0건)
  - API 평균 응답 속도: Xms (목표: 200ms 이하)
- **KR4 (성장)**: (아직 출시 전이므로 N/A)

### 다음 주 계획
- [ ] Initiative 3: ...
- [ ] Initiative 4: ...

### 이슈 및 장애물
- (있으면 기록)
```

---

## OKR 업데이트 정책

### **OKR은 분기별로 수립하되, 유연하게 조정**

- **월간 리뷰**: 매월 마지막 주, OKR 달성률 평가
- **분기별 갱신**: 3개월마다 새로운 OKR 수립
- **긴급 조정**: 시장 상황 변화 시 Objective는 유지하되, KR/Initiatives 조정 가능

**예시:**
```
만약 출시 후 "크래시율이 예상보다 높다"면?
→ KR3의 목표를 0.5% → 0.3%로 더 엄격하게 조정
→ Initiatives에 "크래시 원인 분석 및 긴급 패치" 추가
```

---

## OKR 운영 Best Practices

### **1. 투명성 (Transparency)**
- 모든 팀원(Claude Code 포함)이 OKR을 보고 이해해야 함
- OKR은 항상 `/OKR.md`에 최신 상태로 유지

### **2. 자율성 (Autonomy)**
- Top-down이 아닌, 스스로 Initiatives를 제안하고 실행
- "이 작업을 하면 KR이 개선될 것 같다"는 확신이 들면 제안

### **3. 도전성 (Ambitious)**
- 100% 달성이 쉬운 목표는 좋은 OKR이 아님
- 70% 달성 = 성공

### **4. 측정 가능 (Measurable)**
- "열심히 했다"가 아니라 "숫자로 증명"
- 모든 KR은 정량적 지표여야 함

### **5. 정렬 (Alignment)**
- 모든 작업이 Objective를 향해야 함
- OKR과 무관한 작업은 하지 않음

---

## 참고 자료

- **OKR 문서**: [OKR.md](OKR.md)
- **프로젝트 기획**: [docs/PRD.md](docs/PRD.md)
- **배포 가이드**: [DEPLOYMENT_GUIDE_V2.md](DEPLOYMENT_GUIDE_V2.md)
- **Toss 통합**: [docs/TOSS_INTEGRATION.md](docs/TOSS_INTEGRATION.md)

---

## Claude Code의 역할

Claude Code는 이 프로젝트에서:

1. **OKR 수호자**: 모든 작업이 OKR과 정렬되도록 검토
2. **품질 관리자**: KR3 (안정성) 기준을 항상 준수
3. **사용자 옹호자**: 사용자 가치를 최우선으로 고려
4. **데이터 분석가**: KR 지표를 추적하고 개선 방안 제안

---

**마지막 업데이트**: 2026-03-24
**다음 리뷰**: 2026-03-31 (1주 후)

---

> **"모든 코드는 사용자의 삶을 더 나아지게 만들어야 한다"**

이 원칙을 잊지 말고, OKR을 나침반 삼아 프로젝트를 완성해나가세요!
