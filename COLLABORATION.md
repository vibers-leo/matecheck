# MateCheck — 에이전트 협업 프로토콜

AI 간 협업을 위한 공유 메시지 보드. 모든 에이전트는 작업 전/후에 이 문서를 확인하고 업데이트.

## 에이전트 구성
| 에이전트 | 담당 | 주요 파일 | 태그 |
|---------|------|---------|------|
| AntiGravity | 코딩 메인 | backend/app/ 전체 | [AG] |
| Claude Code (VS Code) | 단일 작업 | backend/app/controllers/, models/ | [CC] |
| Claude Code (터미널) | 병렬 작업 | 전체 | [TCC] |
| Claude Code (App) | 보조 | config/, db/ | [APP] |
| Claude Cowork | 비코딩 | 문서, 서버 관리 | [CW] |

## 협업 규칙

### Git 작업 규칙
- `git add .` 사용 금지 → 항상 `git add <파일명>`
- 커밋 전 반드시 `git pull origin main`
- 커밋 메시지 앞에 에이전트 태그: `[AG]`, `[CC]`, `[TCC]`, `[APP]`
- 커밋 전 `git diff --name-only`로 내 영역만 수정했는지 확인

### 공유 파일 수정 프로토콜
- Gemfile, config/routes.rb, config/database.yml 등 공유 파일은:
  1. 알림 섹션에 "🔒 [{태그}] {파일} 수정 예정" 작성
  2. 수정 완료 후 "✅ 수정 완료" 업데이트
  3. 🔒 표시 중에는 다른 에이전트 수정 자제

## 작업 영역 분리

### Backend API (backend/)
| 영역 | 주요 파일 | 담당 |
|------|---------|------|
| 인증/사용자 | users_controller, sessions_controller, user.rb | [AG] 우선 |
| Nest 관리 | nests_controller, nest.rb | [AG] 우선 |
| 미션/일정 | missions_controller, calendar_events_controller | [CC] |
| 가계부 | transactions_controller, split_bills_controller | [CC] |
| 집 규칙/가사 | house_rules_controller, chore_rotations_controller | [TCC] |
| 생활정보 | life_infos_controller, policy_crawler_service.rb | [TCC] |
| 공지/지원 | announcements_controller, support_tickets_controller | [APP] |
| 인프라/배포 | Dockerfile, docker-compose.yml, .github/ | [CW] |

### Frontend (frontend/)
| 영역 | 담당 |
|------|------|
| 코어 UI/네비게이션 | [AG] |
| 기능 화면 개발 | [CC], [TCC] |

## 메시지 로그

### 2026-03-24
- [CW] 프로젝트 공통 지침 파일 세팅 완료 (CLAUDE.md 보강, DESIGN_GUIDE.md, COLLABORATION.md 생성)

## 알림
- (없음)

## 커밋 전 체크리스트
- [ ] `git pull origin main` 실행
- [ ] `git diff --name-only`로 내 영역만 수정 확인
- [ ] `git add <특정 파일>` (git add . 금지)
- [ ] 커밋 메시지에 `[AG]`/`[CC]`/`[TCC]`/`[APP]` 태그
- [ ] COLLABORATION.md 메시지 로그 기록
