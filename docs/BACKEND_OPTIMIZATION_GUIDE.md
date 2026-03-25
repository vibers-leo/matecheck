# 백엔드 최적화 가이드

> **목표**: KR3 (안정성 99.5%+) 및 성능 최적화

---

## 📋 목차

1. [데이터베이스 인덱스 최적화](#1-데이터베이스-인덱스-최적화)
2. [N+1 쿼리 문제 해결](#2-n1-쿼리-문제-해결)
3. [인증 및 보안 강화](#3-인증-및-보안-강화)
4. [API 성능 최적화](#4-api-성능-최적화)
5. [캐싱 전략](#5-캐싱-전략)
6. [에러 핸들링](#6-에러-핸들링)
7. [모니터링 및 로깅](#7-모니터링-및-로깅)

---

## 1. 데이터베이스 인덱스 최적화

### 🎯 목표
- 쿼리 속도 10배 향상
- DB 부하 80% 감소

### 현재 문제점

```sql
-- ❌ Bad: 인덱스 없는 쿼리 (Full Table Scan)
SELECT * FROM missions WHERE nest_id = '123';
-- 실행 시간: 450ms (데이터 10,000건 기준)
```

### 해결 방법

#### Step 1: 주요 테이블 인덱스 추가

```sql
-- nests 테이블
CREATE INDEX idx_nests_master_user_id ON nests(master_user_id);
CREATE INDEX idx_nests_created_at ON nests(created_at DESC);

-- missions (할 일) 테이블
CREATE INDEX idx_missions_nest_id ON missions(nest_id);
CREATE INDEX idx_missions_nest_id_created_at ON missions(nest_id, created_at DESC);
CREATE INDEX idx_missions_is_completed ON missions(is_completed);
CREATE INDEX idx_missions_repeat ON missions(repeat);

-- Composite Index (복합 인덱스)
CREATE INDEX idx_missions_nest_active ON missions(nest_id, is_completed, created_at DESC);
-- 용도: 특정 Nest의 완료되지 않은 할 일을 최신순으로 조회

-- events (일정) 테이블
CREATE INDEX idx_events_nest_id ON events(nest_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_nest_id_date ON events(nest_id, date);

-- transactions (예산 내역) 테이블
CREATE INDEX idx_transactions_nest_id ON transactions(nest_id);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_nest_id_date ON transactions(nest_id, date DESC);

-- nest_members (구성원) 테이블
CREATE INDEX idx_nest_members_nest_id ON nest_members(nest_id);
CREATE INDEX idx_nest_members_user_id ON nest_members(user_id);
CREATE INDEX idx_nest_members_status ON nest_members(status);

-- join_requests (가입 요청) 테이블
CREATE INDEX idx_join_requests_nest_id ON join_requests(nest_id);
CREATE INDEX idx_join_requests_user_id ON join_requests(user_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
```

#### Step 2: 인덱스 효과 측정

```sql
-- Before Index
EXPLAIN ANALYZE
SELECT * FROM missions WHERE nest_id = '123' AND is_completed = false;
-- Seq Scan: 450ms

-- After Index
EXPLAIN ANALYZE
SELECT * FROM missions WHERE nest_id = '123' AND is_completed = false;
-- Index Scan: 12ms (37배 향상 ✅)
```

#### Step 3: 불필요한 인덱스 제거

```sql
-- 사용되지 않는 인덱스 확인 (PostgreSQL)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg%';

-- 사용 안 되는 인덱스 삭제
DROP INDEX idx_unused_index;
```

### 인덱스 사용 가이드라인

✅ **인덱스를 추가해야 하는 경우:**
- WHERE 절에 자주 사용되는 컬럼
- JOIN에 사용되는 외래키
- ORDER BY에 사용되는 컬럼
- GROUP BY에 사용되는 컬럼

❌ **인덱스를 추가하지 말아야 하는 경우:**
- 테이블이 작을 때 (1,000건 이하)
- 컬럼 값의 중복도가 높을 때 (예: boolean)
- INSERT/UPDATE가 매우 빈번한 테이블

---

## 2. N+1 쿼리 문제 해결

### 🎯 목표
- API 응답 속도 5배 향상
- DB 쿼리 횟수 95% 감소

### 현재 문제점

```python
# ❌ Bad: N+1 쿼리 발생
@app.get("/nests/{nest_id}/missions")
def get_missions(nest_id: str):
    missions = Mission.query.filter_by(nest_id=nest_id).all()

    result = []
    for mission in missions:
        # 각 mission마다 쿼리 실행 (N+1 문제!)
        assignees = User.query.filter(
            User.id.in_(mission.assignee_ids)
        ).all()

        result.append({
            "id": mission.id,
            "title": mission.title,
            "assignees": [{"id": u.id, "nickname": u.nickname} for u in assignees]
        })

    return result

# 쿼리 횟수:
# - 1회: missions 조회
# - N회: 각 mission의 assignees 조회
# 총: 1 + N번 (N=50이면 51번 쿼리!) ❌
```

### 해결 방법 1: JOIN 사용

```python
# ✅ Good: JOIN으로 한 번에 가져오기
@app.get("/nests/{nest_id}/missions")
def get_missions(nest_id: str):
    missions = db.session.query(Mission).options(
        # Eager Loading: assignees를 미리 로드
        joinedload(Mission.assignees)
    ).filter_by(nest_id=nest_id).all()

    result = []
    for mission in missions:
        # 이미 로드되어 있어서 추가 쿼리 없음 ✅
        result.append({
            "id": mission.id,
            "title": mission.title,
            "assignees": [{"id": u.id, "nickname": u.nickname} for u in mission.assignees]
        })

    return result

# 쿼리 횟수: 1회 (JOIN 사용) ✅
```

### 해결 방법 2: Subquery 사용

```python
# ✅ Good: Subquery로 한 번에 가져오기
@app.get("/nests/{nest_id}/missions")
def get_missions(nest_id: str):
    missions = Mission.query.filter_by(nest_id=nest_id).all()

    # 모든 assignee_ids 수집
    all_assignee_ids = set()
    for mission in missions:
        all_assignee_ids.update(mission.assignee_ids or [])

    # 한 번의 쿼리로 모든 assignees 가져오기
    assignees_dict = {
        user.id: {"id": user.id, "nickname": user.nickname}
        for user in User.query.filter(User.id.in_(all_assignee_ids)).all()
    }

    result = []
    for mission in missions:
        result.append({
            "id": mission.id,
            "title": mission.title,
            "assignees": [
                assignees_dict[aid]
                for aid in (mission.assignee_ids or [])
                if aid in assignees_dict
            ]
        })

    return result

# 쿼리 횟수: 2회 (missions + users) ✅
```

### 해결 방법 3: DataLoader 패턴 (GraphQL)

```python
# ✅ Good: DataLoader로 자동 배치 처리
from aiodataloader import DataLoader

class UserLoader(DataLoader):
    async def batch_load_fn(self, user_ids):
        users = await User.query.filter(User.id.in_(user_ids)).all()
        user_map = {user.id: user for user in users}
        return [user_map.get(uid) for uid in user_ids]

user_loader = UserLoader()

@app.get("/nests/{nest_id}/missions")
async def get_missions(nest_id: str):
    missions = await Mission.query.filter_by(nest_id=nest_id).all()

    result = []
    for mission in missions:
        # DataLoader가 자동으로 배치 처리 ✅
        assignees = await user_loader.load_many(mission.assignee_ids)
        result.append({
            "id": mission.id,
            "title": mission.title,
            "assignees": [{"id": u.id, "nickname": u.nickname} for u in assignees if u]
        })

    return result

# 쿼리 횟수: 2회 (missions + batched users) ✅
```

### N+1 감지 도구

```python
# SQLAlchemy 쿼리 로깅 활성화
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# 쿼리 횟수 카운터
import sqlalchemy.event as sa_event

query_count = 0

@sa_event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    global query_count
    query_count += 1
    print(f"Query #{query_count}: {statement[:100]}...")
```

---

## 3. 인증 및 보안 강화

### 🎯 목표
- JWT 기반 인증 구현
- 비밀번호 보안 강화
- CSRF/XSS 방어

### 현재 문제점

```python
# ❌ Bad: 평문 비밀번호 저장
@app.post("/register")
def register(email: str, password: str):
    user = User(email=email, password=password)  # ❌ 평문 저장!
    db.session.add(user)
    db.session.commit()
```

### 해결 방법

#### Step 1: 비밀번호 해싱

```python
from passlib.context import CryptContext

# bcrypt 사용 (권장)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Good: 해싱된 비밀번호 저장
@app.post("/register")
def register(email: str, password: str):
    # 비밀번호 강도 검증
    if len(password) < 8:
        raise HTTPException(400, "비밀번호는 8자 이상이어야 합니다")

    # 해싱
    hashed_password = pwd_context.hash(password)

    user = User(email=email, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()

    return {"message": "가입 완료"}

# 로그인 검증
@app.post("/login")
def login(email: str, password: str):
    user = User.query.filter_by(email=email).first()

    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(401, "이메일 또는 비밀번호가 잘못되었습니다")

    # JWT 토큰 생성
    access_token = create_access_token({"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
```

#### Step 2: JWT 인증 구현

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # 환경 변수에서 가져오기
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7일

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(401, "Invalid token")

# Dependency: 인증 필요한 엔드포인트에 사용
from fastapi import Depends, Header

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "인증이 필요합니다")

    token = authorization.replace("Bearer ", "")
    user_id = verify_token(token)

    user = User.query.get(user_id)
    if not user:
        raise HTTPException(401, "사용자를 찾을 수 없습니다")

    return user

# 사용 예시
@app.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nickname": current_user.nickname
    }
```

#### Step 3: CORS 설정

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "exp://192.168.0.0:8081",  # Expo 개발 서버
        "https://yourdomain.com",  # 프로덕션 도메인
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Step 4: Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# 사용 예시
@app.post("/login")
@limiter.limit("5/minute")  # 1분에 5번만 허용
def login(request: Request, email: str, password: str):
    # ...로그인 로직
    pass
```

---

## 4. API 성능 최적화

### 페이지네이션

```python
# ✅ Good: Cursor-based Pagination
@app.get("/missions")
def get_missions(
    nest_id: str,
    cursor: Optional[str] = None,
    limit: int = 20
):
    query = Mission.query.filter_by(nest_id=nest_id)

    if cursor:
        # cursor 이후 데이터만 가져오기
        query = query.filter(Mission.id > cursor)

    missions = query.order_by(Mission.created_at.desc()).limit(limit + 1).all()

    has_more = len(missions) > limit
    if has_more:
        missions = missions[:limit]

    next_cursor = missions[-1].id if has_more else None

    return {
        "data": missions,
        "next_cursor": next_cursor,
        "has_more": has_more
    }
```

### 필드 선택 (Sparse Fieldsets)

```python
# ✅ Good: 필요한 필드만 반환
@app.get("/missions")
def get_missions(nest_id: str, fields: Optional[str] = None):
    query = Mission.query.filter_by(nest_id=nest_id)

    if fields:
        # 요청된 필드만 SELECT
        field_list = fields.split(",")
        query = query.with_entities(*[getattr(Mission, f) for f in field_list])

    missions = query.all()
    return {"data": missions}

# 사용: GET /missions?fields=id,title,is_completed
```

### 캐싱

```python
from functools import lru_cache
from cachetools import TTLCache

# 메모리 캐시 (TTL: 5분)
cache = TTLCache(maxsize=1000, ttl=300)

@app.get("/nests/{nest_id}")
def get_nest(nest_id: str):
    # 캐시 확인
    if nest_id in cache:
        return cache[nest_id]

    # DB 조회
    nest = Nest.query.get(nest_id)
    if not nest:
        raise HTTPException(404, "Nest not found")

    result = {
        "id": nest.id,
        "name": nest.name,
        "members": len(nest.members)
    }

    # 캐시 저장
    cache[nest_id] = result

    return result
```

---

## 5. 캐싱 전략

### Redis 캐싱

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_cached_missions(nest_id: str):
    # 캐시 키
    cache_key = f"missions:{nest_id}"

    # 캐시 확인
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # DB 조회
    missions = Mission.query.filter_by(nest_id=nest_id).all()
    result = [mission.to_dict() for mission in missions]

    # 캐시 저장 (TTL: 5분)
    redis_client.setex(cache_key, 300, json.dumps(result))

    return result

# 캐시 무효화
def invalidate_missions_cache(nest_id: str):
    cache_key = f"missions:{nest_id}"
    redis_client.delete(cache_key)

@app.post("/missions")
def create_mission(nest_id: str, title: str):
    mission = Mission(nest_id=nest_id, title=title)
    db.session.add(mission)
    db.session.commit()

    # 캐시 무효화
    invalidate_missions_cache(nest_id)

    return {"id": mission.id}
```

---

## 6. 에러 핸들링

```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

# 커스텀 예외
class NestNotFoundException(Exception):
    pass

class UnauthorizedException(Exception):
    pass

# 예외 핸들러
@app.exception_handler(NestNotFoundException)
def nest_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Nest not found", "message": str(exc)}
    )

@app.exception_handler(UnauthorizedException)
def unauthorized_handler(request, exc):
    return JSONResponse(
        status_code=401,
        content={"error": "Unauthorized", "message": str(exc)}
    )

# 전역 예외 핸들러
@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    # Sentry 로깅
    # sentry_sdk.capture_exception(exc)

    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "서버 오류가 발생했습니다"}
    )
```

---

## 7. 모니터링 및 로깅

```python
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# 미들웨어: 요청 로깅
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()

    # 요청 로깅
    logger.info(f"Request: {request.method} {request.url}")

    # 요청 처리
    response = await call_next(request)

    # 응답 시간 계산
    duration = (datetime.now() - start_time).total_seconds()

    # 응답 로깅
    logger.info(f"Response: {response.status_code} ({duration:.3f}s)")

    # 느린 쿼리 감지
    if duration > 1.0:
        logger.warning(f"Slow request detected: {request.url} took {duration:.3f}s")

    return response
```

---

## 📊 예상 개선 효과

| 항목 | BEFORE | AFTER | 개선율 |
|------|--------|-------|--------|
| **평균 API 응답 속도** | 450ms | 45ms | **90% 개선** |
| **DB 쿼리 횟수** | 평균 50회 | 평균 3회 | **94% 감소** |
| **서버 부하** | CPU 80% | CPU 15% | **81% 감소** |
| **동시 처리 가능 사용자** | 100명 | 1,000명 | **10배 증가** |

---

## 🎯 체크리스트

배포 전 확인:

- [ ] 주요 테이블에 인덱스 추가
- [ ] N+1 쿼리 해결 (JOIN/subquery 사용)
- [ ] JWT 인증 구현
- [ ] 비밀번호 bcrypt 해싱
- [ ] Rate Limiting 설정
- [ ] 에러 핸들링 통합
- [ ] 로깅 설정
- [ ] Sentry 연동

---

**작성일**: 2026-02-16
**다음 리뷰**: 배포 후 1주일
