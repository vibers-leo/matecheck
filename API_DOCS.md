# MateCheck API 문서

> **Base URL**: `https://matecheck.vibers.co.kr`
> **인증 방식**: `Authorization` 헤더에 사용자 이메일 전달
> **응답 형식**: JSON
> **Content-Type**: `application/json`

---

## 목차

1. [인증](#인증)
2. [사용자](#사용자)
3. [보금자리 (Nest)](#보금자리-nest)
4. [미션 (Mission)](#미션-mission)
5. [일정 (Calendar Event)](#일정-calendar-event)
6. [목표 (Goal)](#목표-goal)
7. [가계부 (Transaction)](#가계부-transaction)
8. [기념일 (Anniversary)](#기념일-anniversary)
9. [하우스룰 (House Rule)](#하우스룰-house-rule)
10. [더치페이 (Split Bill)](#더치페이-split-bill)
11. [위시리스트 (Wishlist Item)](#위시리스트-wishlist-item)
12. [당번 로테이션 (Chore Rotation)](#당번-로테이션-chore-rotation)
13. [고객지원 (Support Ticket)](#고객지원-support-ticket)
14. [공지사항 (Announcement)](#공지사항-announcement)
15. [생활정보 (Life Info)](#생활정보-life-info)
16. [헬스체크](#헬스체크)

---

## 공통 사항

### 인증 헤더

대부분의 API는 인증이 필요합니다. `Authorization` 헤더에 사용자 이메일을 전달하세요.

```
Authorization: user@example.com
```

### 에러 응답

```json
// 401 Unauthorized
{ "error": "인증이 필요합니다." }

// 403 Forbidden
{ "error": "이 보금자리에 접근 권한이 없습니다." }

// 404 Not Found
{ "error": "요청한 리소스를 찾을 수 없습니다." }

// 422 Unprocessable Entity
{ "errors": ["Email has already been taken"] }
```

### 페이지네이션

목록 API는 페이지네이션을 지원합니다.

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | integer | 1 | 페이지 번호 |
| per_page | integer | 20 | 페이지당 항목 수 |

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100
  }
}
```

---

## 인증

### 회원가입

```
POST /signup
```

**인증 필요**: 아니오

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| user[email] | string | O | 이메일 |
| user[password] | string | O | 비밀번호 (최소 6자) |
| user[nickname] | string | X | 닉네임 |
| user[avatar_id] | integer | X | 아바타 ID |

**요청 예시**:
```json
{
  "user": {
    "email": "newuser@example.com",
    "password": "password123",
    "nickname": "새사용자"
  }
}
```

**응답 (201 Created)**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "newuser@example.com",
    "nickname": "새사용자",
    "avatar_id": null,
    "nest_id": null
  }
}
```

**에러 (422)**:
```json
{
  "errors": ["Email has already been taken"]
}
```

---

### 로그인

```
POST /login
```

**인증 필요**: 아니오

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 이메일 |
| password | string | O | 비밀번호 |

**요청 예시**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (200 OK)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "사용자",
    "avatar_id": 1,
    "nest_id": 1
  },
  "nest": {
    "id": 1,
    "name": "우리집",
    "theme_id": 1,
    "invite_code": "ABC123",
    "members": [
      { "id": 1, "nickname": "사용자", "avatar_id": 1 }
    ]
  }
}
```

> nest 필드는 사용자가 보금자리에 소속된 경우에만 포함됩니다.

**에러 (401)**:
```json
{
  "error": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 사용자

### 프로필 수정

```
PATCH /profile
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 사용자 이메일 (식별용) |
| user[nickname] | string | X | 닉네임 |
| user[avatar_id] | integer | X | 아바타 ID |

**응답 (200 OK)**:
```json
{
  "message": "Profile updated",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "새닉네임"
  }
}
```

---

### 비밀번호 변경

```
PUT /users/password
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 사용자 이메일 |
| current_password | string | O | 현재 비밀번호 |
| new_password | string | O | 새 비밀번호 (최소 6자) |
| new_password_confirmation | string | O | 새 비밀번호 확인 |

**응답 (200 OK)**:
```json
{
  "message": "Password updated successfully"
}
```

**에러 (401)**:
```json
{
  "error": "Current password incorrect"
}
```

---

### 회원 탈퇴

```
DELETE /users
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 사용자 이메일 |
| password | string | O | 비밀번호 (재확인용) |

**응답 (200 OK)**:
```json
{
  "message": "Account deleted"
}
```

---

## 보금자리 (Nest)

### 보금자리 생성

```
POST /nests
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 사용자 이메일 |
| nest[name] | string | O | 보금자리 이름 |
| nest[theme_id] | integer | X | 테마 ID |
| nest[image_url] | string | X | 이미지 URL |
| user[nickname] | string | X | 사용자 닉네임 (업데이트) |

**응답 (201 Created)**:
```json
{
  "id": 1,
  "name": "우리집",
  "theme_id": 1,
  "image_url": null,
  "invite_code": "ABC123",
  "members": [
    { "id": 1, "nickname": "사용자", "avatar_id": 1, "member_type": null }
  ]
}
```

---

### 보금자리 조회

```
GET /nests/:id
```

**인증 필요**: 예 (소속된 보금자리만 접근 가능)

**응답 (200 OK)**:
```json
{
  "id": 1,
  "name": "우리집",
  "theme_id": 1,
  "image_url": null,
  "invite_code": "ABC123",
  "members": [
    { "id": 1, "nickname": "사용자", "avatar_id": 1, "member_type": null },
    { "id": 2, "nickname": "룸메이트", "avatar_id": 2, "member_type": null }
  ]
}
```

---

### 초대코드로 가입 요청

```
POST /nests/join
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 사용자 이메일 |
| invite_code | string | O | 초대 코드 (6자리) |

**응답 (200 OK)**:
```json
{
  "message": "Join request sent",
  "status": "pending"
}
```

**에러 (404)**:
```json
{
  "error": "Invalid invite code"
}
```

---

### 가입 요청 목록 조회

```
GET /nests/:id/requests
```

**인증 필요**: 예

**응답 (200 OK)**:
```json
[
  {
    "id": 3,
    "nickname": "대기자",
    "avatar_id": 1,
    "email": "pending@example.com"
  }
]
```

---

### 가입 요청 승인

```
PATCH /nests/:id/approve/:user_id
```

**인증 필요**: 예

**응답 (200 OK)**:
```json
{
  "message": "User approved",
  "members": [
    { "id": 1, "nickname": "기존멤버", "avatar_id": 1, "member_type": null },
    { "id": 3, "nickname": "새멤버", "avatar_id": 2, "member_type": null }
  ]
}
```

---

### 관리 멤버 추가 (반려동물, 아기 등)

```
POST /nests/:id/members
```

**인증 필요**: 예

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| nickname | string | O | 멤버 이름 |
| avatar_id | integer | X | 아바타 ID |
| member_type | string | O | 멤버 타입 (baby, pet, plant, ai) |

**응답 (201 Created)**:
```json
{
  "message": "Member added",
  "members": [
    { "id": 1, "nickname": "사용자", "avatar_id": 1, "member_type": null },
    { "id": 4, "nickname": "멍멍이", "avatar_id": 3, "member_type": "pet" }
  ]
}
```

---

## 미션 (Mission)

> 모든 미션 API는 보금자리 하위 리소스입니다.
> 인증 필요 + 해당 보금자리 소속 필수

### 미션 목록 조회

```
GET /nests/:nest_id/missions
```

**파라미터**: page, per_page (페이지네이션)

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "설거지하기",
      "is_completed": false,
      "repeat": "daily",
      "image_url": null,
      "nest_id": 1,
      "assignees": [
        { "id": 1, "nickname": "사용자", "email": "user@example.com" }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 1
  }
}
```

---

### 미션 생성

```
POST /nests/:nest_id/missions
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| mission[title] | string | O | 미션 제목 |
| mission[is_completed] | boolean | X | 완료 여부 (기본: false) |
| mission[repeat] | string | X | 반복 주기 (daily, weekly 등) |
| mission[image_url] | string | X | 이미지 URL |
| mission[assignee_ids] | array | X | 담당자 ID 배열 |

**응답 (201 Created)**:
```json
{
  "id": 2,
  "title": "분리수거",
  "is_completed": false,
  "repeat": "weekly",
  "assignees": [
    { "id": 1, "nickname": "사용자" }
  ]
}
```

---

### 미션 수정

```
PATCH /nests/:nest_id/missions/:id
PUT /nests/:nest_id/missions/:id
```

**파라미터**: 미션 생성과 동일

**응답 (200 OK)**: 수정된 미션 JSON

---

### 미션 삭제

```
DELETE /nests/:nest_id/missions/:id
```

**응답**: 204 No Content

---

## 일정 (Calendar Event)

> 인증 필요 + 해당 보금자리 소속 필수

### 일정 목록 조회

```
GET /nests/:nest_id/calendar_events
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "집들이",
      "date": "2026-04-01",
      "end_date": null,
      "time": "18:00",
      "event_type": "party",
      "image_url": null,
      "creator_id": 1
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 일정 생성

```
POST /nests/:nest_id/calendar_events
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| calendar_event[title] | string | O | 일정 제목 |
| calendar_event[date] | date | O | 시작 날짜 (YYYY-MM-DD) |
| calendar_event[end_date] | date | X | 종료 날짜 |
| calendar_event[time] | string | X | 시간 (HH:MM) |
| calendar_event[event_type] | string | X | 일정 유형 |
| calendar_event[image_url] | string | X | 이미지 URL |
| calendar_event[creator_id] | integer | X | 생성자 ID |

**응답 (201 Created)**: 생성된 일정 JSON

---

### 일정 삭제

```
DELETE /nests/:nest_id/calendar_events/:id
```

**응답**: 204 No Content

---

## 목표 (Goal)

> 인증 필요 + 해당 보금자리 소속 필수

### 목표 목록 조회

```
GET /nests/:nest_id/goals
```

**응답 (200 OK)**:
```json
[
  {
    "id": 1,
    "title": "저축 목표",
    "goal_type": "savings",
    "current": 50000,
    "target": 1000000,
    "unit": "원"
  }
]
```

---

### 목표 생성

```
POST /nests/:nest_id/goals
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| goal[title] | string | O | 목표 제목 |
| goal[goal_type] | string | X | 목표 유형 |
| goal[current] | integer | X | 현재 달성량 |
| goal[target] | integer | X | 목표치 |
| goal[unit] | string | X | 단위 |

**응답 (201 Created)**: 생성된 목표 JSON

---

### 목표 수정

```
PATCH /nests/:nest_id/goals/:id
PUT /nests/:nest_id/goals/:id
```

**응답 (200 OK)**: 수정된 목표 JSON

---

### 목표 삭제

```
DELETE /nests/:nest_id/goals/:id
```

**응답**: 204 No Content

---

## 가계부 (Transaction)

> 인증 필요 + 해당 보금자리 소속 필수

### 거래 목록 조회

```
GET /nests/:nest_id/transactions
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "마트 장보기",
      "amount": "35000.0",
      "category": "식비",
      "date": "2026-03-25",
      "payer_id": 1
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 거래 생성

```
POST /nests/:nest_id/transactions
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| transaction[title] | string | O | 거래 제목 |
| transaction[amount] | decimal | O | 금액 |
| transaction[category] | string | X | 카테고리 |
| transaction[date] | date | X | 거래 날짜 |
| transaction[payer_id] | integer | X | 결제자 ID |

**응답 (201 Created)**: 생성된 거래 JSON

---

## 기념일 (Anniversary)

> 인증 필요 + 해당 보금자리 소속 필수

### 기념일 목록 조회

```
GET /nests/:nest_id/anniversaries
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "입주 기념일",
      "anniversary_date": "2026-01-15",
      "is_recurring": true,
      "category": "house"
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 기념일 생성

```
POST /nests/:nest_id/anniversaries
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| anniversary[title] | string | O | 기념일 제목 |
| anniversary[anniversary_date] | date | O | 기념일 날짜 |
| anniversary[is_recurring] | boolean | X | 반복 여부 |
| anniversary[category] | string | X | 카테고리 |

**응답 (201 Created)**: 생성된 기념일 JSON

---

### 기념일 수정

```
PATCH /nests/:nest_id/anniversaries/:id
PUT /nests/:nest_id/anniversaries/:id
```

**응답 (200 OK)**: 수정된 기념일 JSON

---

### 기념일 삭제

```
DELETE /nests/:nest_id/anniversaries/:id
```

**응답**: 204 No Content

---

## 하우스룰 (House Rule)

> 인증 필요 + 해당 보금자리 소속 필수

### 하우스룰 목록 조회

```
GET /nests/:nest_id/house_rules
```

**파라미터**: page, per_page

> 활성화된 규칙만 반환 (is_active: true), 우선순위 오름차순 정렬

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "밤 11시 이후 소음 금지",
      "description": "공용 공간에서 큰 소리 금지",
      "rule_type": "noise",
      "priority": 1,
      "is_active": true
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 하우스룰 생성

```
POST /nests/:nest_id/house_rules
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| house_rule[title] | string | O | 규칙 제목 |
| house_rule[description] | string | X | 규칙 설명 |
| house_rule[rule_type] | string | X | 규칙 유형 |
| house_rule[priority] | integer | X | 우선순위 (낮을수록 높음) |

> is_active는 자동으로 true로 설정됩니다.

**응답 (201 Created)**: 생성된 하우스룰 JSON

---

### 하우스룰 수정

```
PATCH /nests/:nest_id/house_rules/:id
PUT /nests/:nest_id/house_rules/:id
```

**응답 (200 OK)**: 수정된 하우스룰 JSON

---

### 하우스룰 삭제

```
DELETE /nests/:nest_id/house_rules/:id
```

**응답**: 204 No Content

---

## 더치페이 (Split Bill)

> 인증 필요 + 해당 보금자리 소속 필수

### 더치페이 목록 조회

```
GET /nests/:nest_id/split_bills
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "전기세",
      "total_amount": "120000.0",
      "bill_type": "utility",
      "due_date": "2026-03-31",
      "is_paid": false,
      "split_method": "equal",
      "per_person": 60000.0,
      "member_count": 2
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 더치페이 생성

```
POST /nests/:nest_id/split_bills
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| split_bill[title] | string | O | 청구서 제목 |
| split_bill[total_amount] | decimal | O | 총 금액 |
| split_bill[bill_type] | string | X | 청구서 유형 |
| split_bill[due_date] | date | X | 납부 기한 |
| split_bill[split_method] | string | X | 분할 방식 (기본: equal) |

> is_paid는 자동으로 false로 설정됩니다.

**응답 (201 Created)**: 생성된 더치페이 JSON (per_person, member_count 포함)

---

### 더치페이 수정

```
PATCH /nests/:nest_id/split_bills/:id
PUT /nests/:nest_id/split_bills/:id
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| split_bill[is_paid] | boolean | X | 납부 완료 여부 |
| (기타 생성 파라미터와 동일) | | | |

**응답 (200 OK)**: 수정된 더치페이 JSON

---

### 더치페이 삭제

```
DELETE /nests/:nest_id/split_bills/:id
```

**응답**: 204 No Content

---

## 위시리스트 (Wishlist Item)

> 인증 필요 + 해당 보금자리 소속 필수

### 위시리스트 목록 조회

```
GET /nests/:nest_id/wishlist_items
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "공기청정기",
      "quantity": "1",
      "price": 350000,
      "status": "pending",
      "requester_id": 1
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 위시리스트 아이템 생성

```
POST /nests/:nest_id/wishlist_items
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| wishlist_item[title] | string | O | 아이템 이름 |
| wishlist_item[quantity] | string | X | 수량 |
| wishlist_item[price] | integer | X | 가격 |
| wishlist_item[requester_id] | integer | X | 요청자 ID |

> status는 자동으로 "pending"으로 설정됩니다.

**응답 (201 Created)**: 생성된 위시리스트 아이템 JSON

---

### 위시리스트 아이템 수정

```
PATCH /nests/:nest_id/wishlist_items/:id
PUT /nests/:nest_id/wishlist_items/:id
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| wishlist_item[status] | string | X | 상태 (pending, purchased 등) |
| (기타 생성 파라미터와 동일) | | | |

**응답 (200 OK)**: 수정된 아이템 JSON

---

### 위시리스트 아이템 삭제

```
DELETE /nests/:nest_id/wishlist_items/:id
```

**응답**: 204 No Content

---

## 당번 로테이션 (Chore Rotation)

> 인증 필요 + 해당 보금자리 소속 필수

### 당번 목록 조회

```
GET /nests/:nest_id/chore_rotations
```

**파라미터**: page, per_page

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "chore_name": "화장실 청소",
      "rotation_type": "weekly",
      "current_assignee_id": 1,
      "next_rotation_date": "2026-04-01",
      "current_assignee_name": "사용자",
      "current_assignee_avatar": 1
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 당번 생성

```
POST /nests/:nest_id/chore_rotations
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| chore_rotation[chore_name] | string | O | 집안일 이름 |
| chore_rotation[rotation_type] | string | O | 로테이션 주기 (daily, weekly, biweekly, monthly) |
| chore_rotation[current_assignee_id] | integer | X | 현재 담당자 ID (미지정 시 첫번째 멤버) |
| chore_rotation[next_rotation_date] | date | X | 다음 교대 날짜 (자동 계산) |

**응답 (201 Created)**: 생성된 당번 로테이션 JSON

---

### 당번 교대

```
POST /nests/:nest_id/chore_rotations/:id/rotate
```

**파라미터**: 없음

> 현재 담당자의 다음 멤버에게 자동 교대됩니다.

**응답 (200 OK)**: 교대 후 당번 로테이션 JSON

---

### 당번 삭제

```
DELETE /nests/:nest_id/chore_rotations/:id
```

**응답**: 204 No Content

---

## 고객지원 (Support Ticket)

### 문의 등록

```
POST /support_tickets
```

**인증 필요**: 아니오

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| support_ticket[category] | string | O | 문의 카테고리 |
| support_ticket[title] | string | O | 문의 제목 |
| support_ticket[content] | string | O | 문의 내용 |
| support_ticket[email] | string | X | 연락 이메일 |
| support_ticket[user_id] | integer | X | 사용자 ID (로그인 상태) |

**요청 예시**:
```json
{
  "support_ticket": {
    "category": "bug",
    "title": "앱이 멈춰요",
    "content": "로그인 후 메인 화면에서 앱이 멈추는 현상이 있습니다.",
    "email": "user@example.com"
  }
}
```

**응답 (201 Created)**:
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": 1,
    "category": "bug",
    "title": "앱이 멈춰요",
    "content": "로그인 후 메인 화면에서 앱이 멈추는 현상이 있습니다.",
    "completed": false,
    "email": "user@example.com"
  }
}
```

---

## 공지사항 (Announcement)

### 공지사항 목록 조회

```
GET /announcements
```

**인증 필요**: 아니오

**파라미터**: page, per_page

> 현재 시각 기준 published_at이 지난 공지사항만 반환됩니다.

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "서비스 업데이트 안내",
      "content": "새로운 기능이 추가되었습니다.",
      "published_at": "2026-03-24T00:00:00.000Z"
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 공지사항 상세 조회

```
GET /announcements/:id
```

**인증 필요**: 아니오

**응답 (200 OK)**:
```json
{
  "id": 1,
  "title": "서비스 업데이트 안내",
  "content": "새로운 기능이 추가되었습니다.",
  "published_at": "2026-03-24T00:00:00.000Z"
}
```

---

## 생활정보 (Life Info)

### 생활정보 목록 조회

```
GET /life_infos
```

**인증 필요**: 아니오

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| page | integer | X | 페이지 번호 |
| per_page | integer | X | 페이지당 항목 수 |
| category | string | X | 카테고리 필터 |
| region | string | X | 지역 필터 |
| age | integer | X | 나이 필터 |
| occupation | string | X | 직업 필터 |

**응답 (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "청년 전세자금 대출",
      "content": "만 19~34세 청년 대상...",
      "category": "housing",
      "region": "서울",
      "source_url": "https://...",
      "published_at": "2026-03-20T00:00:00.000Z"
    }
  ],
  "meta": { "current_page": 1, "total_pages": 1, "total_count": 1 }
}
```

---

### 생활정보 상세 조회

```
GET /life_infos/:id
```

**인증 필요**: 아니오

**응답 (200 OK)**: 단일 생활정보 JSON

---

### 생활정보 동기화 (크롤링)

```
POST /life_infos/sync
```

**인증 필요**: 아니오

> 정부 정책 RSS를 크롤링하여 새 항목을 가져옵니다.

**응답 (200 OK)**:
```json
{
  "message": "Synced 5 new items",
  "count": 5
}
```

---

### 맞춤형 생활정보 추천

```
GET /life_infos/personalized
```

**인증 필요**: 아니오

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| user_id | integer | X | 사용자 ID (개인화용) |

> 사용자의 지역, 나이, 직업, 성별에 맞는 정보를 추천합니다.
> user_id가 없으면 전체 목록을 반환합니다.

**응답 (200 OK)**: 추천 생활정보 JSON 배열 (최대 20개)

---

## 헬스체크

### 앱 상태 확인

```
GET /up
GET /health
```

**인증 필요**: 아니오

**응답 (200 OK)**: 앱이 정상 작동 중

**응답 (500)**: 앱에 문제가 있음

---

## 전체 엔드포인트 요약

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /signup | 회원가입 | X |
| POST | /login | 로그인 | X |
| PATCH | /profile | 프로필 수정 | O |
| PUT | /users/password | 비밀번호 변경 | O |
| DELETE | /users | 회원 탈퇴 | O |
| POST | /nests | 보금자리 생성 | O |
| GET | /nests/:id | 보금자리 조회 | O |
| POST | /nests/join | 초대코드 가입 | O |
| GET | /nests/:id/requests | 가입 요청 목록 | O |
| PATCH | /nests/:id/approve/:user_id | 가입 승인 | O |
| POST | /nests/:id/members | 관리 멤버 추가 | O |
| GET | /nests/:nest_id/missions | 미션 목록 | O |
| POST | /nests/:nest_id/missions | 미션 생성 | O |
| PATCH | /nests/:nest_id/missions/:id | 미션 수정 | O |
| DELETE | /nests/:nest_id/missions/:id | 미션 삭제 | O |
| GET | /nests/:nest_id/calendar_events | 일정 목록 | O |
| POST | /nests/:nest_id/calendar_events | 일정 생성 | O |
| DELETE | /nests/:nest_id/calendar_events/:id | 일정 삭제 | O |
| GET | /nests/:nest_id/goals | 목표 목록 | O |
| POST | /nests/:nest_id/goals | 목표 생성 | O |
| PATCH | /nests/:nest_id/goals/:id | 목표 수정 | O |
| DELETE | /nests/:nest_id/goals/:id | 목표 삭제 | O |
| GET | /nests/:nest_id/transactions | 거래 목록 | O |
| POST | /nests/:nest_id/transactions | 거래 생성 | O |
| GET | /nests/:nest_id/anniversaries | 기념일 목록 | O |
| POST | /nests/:nest_id/anniversaries | 기념일 생성 | O |
| PATCH | /nests/:nest_id/anniversaries/:id | 기념일 수정 | O |
| DELETE | /nests/:nest_id/anniversaries/:id | 기념일 삭제 | O |
| GET | /nests/:nest_id/house_rules | 하우스룰 목록 | O |
| POST | /nests/:nest_id/house_rules | 하우스룰 생성 | O |
| PATCH | /nests/:nest_id/house_rules/:id | 하우스룰 수정 | O |
| DELETE | /nests/:nest_id/house_rules/:id | 하우스룰 삭제 | O |
| GET | /nests/:nest_id/split_bills | 더치페이 목록 | O |
| POST | /nests/:nest_id/split_bills | 더치페이 생성 | O |
| PATCH | /nests/:nest_id/split_bills/:id | 더치페이 수정 | O |
| DELETE | /nests/:nest_id/split_bills/:id | 더치페이 삭제 | O |
| GET | /nests/:nest_id/wishlist_items | 위시리스트 목록 | O |
| POST | /nests/:nest_id/wishlist_items | 위시리스트 생성 | O |
| PATCH | /nests/:nest_id/wishlist_items/:id | 위시리스트 수정 | O |
| DELETE | /nests/:nest_id/wishlist_items/:id | 위시리스트 삭제 | O |
| GET | /nests/:nest_id/chore_rotations | 당번 목록 | O |
| POST | /nests/:nest_id/chore_rotations | 당번 생성 | O |
| POST | /nests/:nest_id/chore_rotations/:id/rotate | 당번 교대 | O |
| DELETE | /nests/:nest_id/chore_rotations/:id | 당번 삭제 | O |
| POST | /support_tickets | 문의 등록 | X |
| GET | /announcements | 공지사항 목록 | X |
| GET | /announcements/:id | 공지사항 상세 | X |
| GET | /life_infos | 생활정보 목록 | X |
| GET | /life_infos/:id | 생활정보 상세 | X |
| POST | /life_infos/sync | 생활정보 동기화 | X |
| GET | /life_infos/personalized | 맞춤형 생활정보 | X |
| GET | /up | 헬스체크 | X |
| GET | /health | 헬스체크 | X |
