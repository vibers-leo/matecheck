# 데이터베이스 선택: Rails+PostgreSQL vs Firebase

> **현재 상황**: Rails API + PostgreSQL로 이미 구성되어 있음

---

## 📊 현재 DB 스키마 분석

### 핵심 엔티티 (14개 테이블)

| 테이블 | 설명 | 중요도 |
|--------|------|--------|
| **users** | 사용자 정보 (이메일, 비밀번호, 닉네임) | ⭐⭐⭐ |
| **nests** | 보금자리/하우스 (초대 코드) | ⭐⭐⭐ |
| **missions** | 할 일 (반복, 담당자) | ⭐⭐⭐ |
| **calendar_events** | 일정 (시작일, 종료일) | ⭐⭐⭐ |
| **transactions** | 거래 내역 (지출, 카테고리) | ⭐⭐⭐ |
| **split_bills** | 더치페이 (총액, 분할 방식) | ⭐⭐ |
| **chore_rotations** | 집안일 순서 (주간/월간 로테이션) | ⭐⭐ |
| **wishlist_items** | 위시리스트 (요청자, 가격) | ⭐⭐ |
| **goals** | 목표 (현재 진행률, 목표치) | ⭐ |
| **house_rules** | 하우스 룰 (우선순위) | ⭐ |
| **anniversaries** | 기념일 (반복 여부) | ⭐ |
| **life_infos** | 생활정보 (맞춤형 추천) | ⭐ |
| **announcements** | 공지사항 (관리자) | ⭐ |
| **support_tickets** | 고객지원 (문의) | ⭐ |

### 주요 관계 (Foreign Keys)
```
users → nests (1:N)
nests → missions (1:N)
nests → calendar_events (1:N)
nests → transactions (1:N)
missions → mission_assignments → users (N:N)
```

---

## 🔥 Firebase vs Rails+PostgreSQL 비교

### 1️⃣ Firebase (Firestore + Authentication)

#### ✅ 장점
1. **빠른 개발**
   - 백엔드 코드 불필요 (BaaS)
   - 실시간 동기화 내장
   - 인증 시스템 즉시 사용

2. **확장성**
   - 자동 스케일링
   - 서버 관리 불필요
   - 글로벌 CDN

3. **비용 (초기)**
   - 무료 플랜 넉넉함 (Spark)
   - 사용량 기반 과금

4. **생태계**
   - Crashlytics, Analytics 통합
   - Push Notification 쉬움
   - Cloud Functions로 서버 로직 가능

#### ❌ 단점
1. **쿼리 제약**
   - 복잡한 JOIN 불가
   - 집계 쿼리 어려움
   - 인덱스 수동 생성 필요

2. **비용 (성장 시)**
   - 읽기/쓰기 횟수 기반 과금
   - 대량 데이터 시 비쌈
   - 월 $100+ 빠르게 도달

3. **벤더 락인**
   - Firebase에 종속
   - 마이그레이션 어려움

4. **MateCheck 적합성**
   - **더치페이 계산**: 복잡한 집계 쿼리 필요 (부적합 ⚠️)
   - **거래 내역 분석**: JOIN 쿼리 필요 (부적합 ⚠️)
   - **집안일 로테이션**: 복잡한 비즈니스 로직 (부적합 ⚠️)

---

### 2️⃣ Rails API + PostgreSQL (현재 구성)

#### ✅ 장점
1. **강력한 쿼리**
   - 복잡한 JOIN, 집계 가능
   - SQL 모든 기능 사용
   - 트랜잭션 보장

2. **비즈니스 로직**
   - Rails 서버에서 로직 처리
   - 복잡한 계산 (더치페이) 가능
   - 백그라운드 작업 (Sidekiq)

3. **비용 예측 가능**
   - Fly.io: $5~$10/월 고정
   - PostgreSQL: Fly.io 포함 or Supabase 무료

4. **유연성**
   - 다른 서비스로 마이그레이션 쉬움
   - 데이터 백업/복원 간단

5. **MateCheck 적합성**
   - ✅ 더치페이 계산 (집계 쿼리)
   - ✅ 거래 분석 (JOIN)
   - ✅ 복잡한 비즈니스 로직

#### ❌ 단점
1. **서버 관리**
   - Fly.io 배포 필요
   - 서버 모니터링 필요

2. **실시간 동기화**
   - Action Cable 필요
   - 구현 복잡도 높음

3. **인증**
   - JWT 직접 구현 필요
   - Firebase보다 복잡

---

## 🎯 결론: MateCheck에 적합한 선택은?

### ✅ **Rails API + PostgreSQL 유지 추천**

**이유:**

1. **이미 구성되어 있음**
   - 14개 테이블 완성
   - 모델, 컨트롤러 존재
   - 마이그레이션 불필요

2. **복잡한 쿼리 필요**
   - **더치페이**: `SUM(amount) GROUP BY user_id`
   - **거래 분석**: `JOIN transactions, users, nests`
   - **집안일 로테이션**: 날짜 계산, 순서 로직

3. **비용 효율**
   - Fly.io: 월 $5~$10 (고정)
   - Firebase: 사용자 500명 기준 월 $50+ 예상

4. **확장성**
   - PostgreSQL은 수백만 레코드도 문제없음
   - 나중에 Supabase로 이전 가능

---

## 🔄 Hybrid 접근 (추천)

**Rails API + PostgreSQL + Firebase (인증/분석)**

```
┌─────────────────────────────────────────┐
│         React Native App                │
└─────────────────────────────────────────┘
           │              │
           │              └──────────────┐
           │                             │
    ┌──────▼──────┐            ┌────────▼─────────┐
    │ Rails API   │            │ Firebase         │
    │ PostgreSQL  │            │ (Authentication) │
    │             │            │ (Crashlytics)    │
    │ - Missions  │            │ (Analytics)      │
    │ - Nests     │            │ (Push Notif)     │
    │ - Bills     │            │                  │
    └─────────────┘            └──────────────────┘
```

### 역할 분담

| 서비스 | 담당 기능 | 이유 |
|--------|----------|------|
| **Rails API** | 비즈니스 로직, 데이터 관리 | 복잡한 쿼리, 계산 |
| **PostgreSQL** | 데이터베이스 | 관계형 데이터 |
| **Firebase Auth** | 사용자 인증 (선택) | 간편한 OAuth, 이메일 인증 |
| **Firebase Crashlytics** | 크래시 모니터링 | 이미 설정 완료 |
| **Firebase Analytics** | 사용자 행동 분석 | 무료, 강력함 |
| **Firebase Cloud Messaging** | 푸시 알림 (선택) | 쉬운 구현 |

---

## 📋 다음 단계

### 현재 백엔드 상태 확인

```bash
# 1. 백엔드 서버 실행 중인지 확인
curl http://matecheck.vibers.co.kr/health

# 2. 로컬 백엔드 실행
cd /Users/admin/Desktop/matecheck/backend
bundle install
rails db:migrate
rails server

# 3. API 테스트
curl http://localhost:3000/api/nests
```

### 데이터베이스 초기화 (필요시)

```bash
# 개발 DB 초기화
rails db:drop db:create db:migrate db:seed

# 프로덕션 DB 마이그레이션
fly postgres connect -a matecheck-db
\d users
```

---

## 💰 비용 비교 (월간, 사용자 500명 기준)

| 항목 | Rails + PostgreSQL | Firebase Only |
|------|-------------------|---------------|
| **서버** | Fly.io: $5-10 | - |
| **DB** | PostgreSQL (Fly.io 포함) | - |
| **인증** | JWT (무료) | Firebase Auth (무료) |
| **스토리지** | S3: $1-5 | Cloud Storage: $5-10 |
| **읽기/쓰기** | 무제한 | Firestore: $30-50 |
| **크래시 모니터링** | 별도 도구 필요 | Crashlytics (무료) |
| **총 비용** | **$6-15** | **$35-60** |

---

## 🚀 최종 추천

✅ **Rails API + PostgreSQL 유지**
✅ Firebase는 Crashlytics, Analytics만 사용 (이미 설정 완료)
✅ 필요시 나중에 Firebase Auth 추가 (현재 JWT로 충분)

**이유**:
- 이미 구성되어 있음 (추가 개발 불필요)
- 복잡한 비즈니스 로직 처리 가능
- 비용 효율적
- 확장 가능

---

**마지막 업데이트**: 2026-02-15
