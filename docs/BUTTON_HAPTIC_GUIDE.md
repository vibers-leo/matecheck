# 버튼 컴포넌트 & Haptic 피드백 가이드

## 🎯 목표
**KR1 (만족도 4.5+)** 달성을 위한 프리미엄 인터랙션 경험

---

## 📦 포함 내용

1. **Button 컴포넌트** - 5가지 variant, Haptic 통합
2. **IconButton** - 아이콘 전용 버튼
3. **ButtonGroup** - 버튼 그룹 레이아웃
4. **Haptic 유틸리티** - 앱 전체에서 사용 가능

---

## 🚀 빠른 시작

### 기본 사용

```typescript
import Button from '../components/Button';

// 기본 Primary 버튼
<Button onPress={handleSubmit}>
  저장하기
</Button>

// Variant 지정
<Button onPress={handleCancel} variant="secondary">
  취소
</Button>

// 아이콘 포함
<Button
  onPress={handleSave}
  variant="primary"
  leftIcon="save"
  haptic="medium"
>
  저장하기
</Button>

// 로딩 상태
<Button
  onPress={handleSubmit}
  loading={isSubmitting}
  disabled={isSubmitting}
>
  제출하기
</Button>
```

---

## 🎨 Button Variants

### 1. Primary (기본)
**용도**: 주요 액션 (저장, 제출, 확인)

```typescript
<Button variant="primary" onPress={handleSave}>
  저장하기
</Button>
```

**스타일**:
- 배경: Toss Blue (#3182F6)
- 텍스트: White
- Shadow: 있음
- Haptic: Medium (권장)

---

### 2. Secondary
**용도**: 부가 액션 (취소, 닫기)

```typescript
<Button variant="secondary" onPress={handleCancel}>
  취소
</Button>
```

**스타일**:
- 배경: Grey100
- 텍스트: Grey900
- Shadow: 없음
- Haptic: Light (권장)

---

### 3. Outline
**용도**: 강조 필요하지만 Primary만큼은 아닌 경우

```typescript
<Button variant="outline" onPress={handleEdit}>
  수정하기
</Button>
```

**스타일**:
- 배경: White
- 텍스트: Blue
- Border: Blue 2px
- Haptic: Light (권장)

---

### 4. Ghost
**용도**: 미니멀한 액션 (더보기, 접기)

```typescript
<Button variant="ghost" onPress={handleExpand}>
  더보기
</Button>
```

**스타일**:
- 배경: Transparent
- 텍스트: Grey700
- Border: 없음
- Haptic: Soft (권장)

---

### 5. Danger
**용도**: 위험한 액션 (삭제, 탈퇴)

```typescript
<Button variant="danger" onPress={handleDelete} haptic="heavy">
  삭제하기
</Button>
```

**스타일**:
- 배경: Red
- 텍스트: White
- Shadow: 있음
- Haptic: Heavy (권장)

---

## 📏 Button Sizes

### Small
```typescript
<Button size="sm" onPress={handleQuickAction}>
  빠른 저장
</Button>
```
- Padding: 10px vertical, 16px horizontal
- Font: 14px
- Icon: 16px

### Medium (기본)
```typescript
<Button size="md" onPress={handleAction}>
  저장하기
</Button>
```
- Padding: 14px vertical, 20px horizontal
- Font: 16px
- Icon: 18px

### Large
```typescript
<Button size="lg" onPress={handleSubmit}>
  제출하기
</Button>
```
- Padding: 18px vertical, 24px horizontal
- Font: 18px
- Icon: 20px

---

## 🔊 Haptic Feedback

### Haptic 타입

| 타입 | 강도 | 사용처 | 예시 |
|------|------|--------|------|
| **light** | 약함 | 일반 버튼, 체크박스 | 탭바 이동 |
| **medium** | 중간 | 중요 버튼, 모달 | 저장, 제출 |
| **heavy** | 강함 | 경고, 삭제 | 삭제 확인 |
| **success** | 알림 | 성공 완료 | 저장 완료 |
| **warning** | 알림 | 주의 필요 | 입력 오류 |
| **error** | 알림 | 실패 | 에러 발생 |

### 사용 예시

```typescript
import { haptic, notification } from '../utils/haptics';

// 일반 버튼
<Button onPress={handleClick} haptic="light">
  클릭
</Button>

// 저장 버튼 (성공 시 피드백)
<Button onPress={async () => {
  await saveData();
  notification.success(); // 저장 완료 피드백
}}>
  저장
</Button>

// 삭제 버튼 (강한 피드백)
<Button
  variant="danger"
  onPress={handleDelete}
  haptic="heavy"
>
  삭제
</Button>
```

---

## 🎯 실전 예시

### 예시 1: 할 일 추가 모달

```typescript
import Button, { ButtonGroup } from '../components/Button';
import { haptic, notification } from '../utils/haptics';

function TodoModal() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      notification.error(); // 입력 오류 피드백
      alert('할 일을 입력하세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTodo(title);
      notification.success(); // 성공 피드백
      closeModal();
    } catch (error) {
      notification.error(); // 실패 피드백
      alert('추가 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <TextInput value={title} onChangeText={setTitle} />

      <ButtonGroup fullWidth>
        <Button
          variant="secondary"
          onPress={closeModal}
          haptic="light"
          style={{ flex: 1 }}
        >
          취소
        </Button>

        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          haptic="medium"
          style={{ flex: 1 }}
        >
          추가하기
        </Button>
      </ButtonGroup>
    </View>
  );
}
```

---

### 예시 2: 삭제 확인 다이얼로그

```typescript
import { hapticPatterns } from '../utils/haptics';

function DeleteConfirmDialog() {
  const handleDelete = async () => {
    // 삭제 확인 패턴 (2단계 피드백)
    await hapticPatterns.deleteConfirm();

    await deleteItem();

    // 완료 피드백
    notification.success();
    closeDialog();
  };

  return (
    <View>
      <Text>정말 삭제하시겠습니까?</Text>

      <ButtonGroup>
        <Button variant="secondary" onPress={closeDialog}>
          취소
        </Button>

        <Button
          variant="danger"
          onPress={handleDelete}
          leftIcon="trash"
          haptic="heavy"
        >
          삭제
        </Button>
      </ButtonGroup>
    </View>
  );
}
```

---

### 예시 3: IconButton 사용

```typescript
import { IconButton } from '../components/Button';

function SettingsScreen() {
  return (
    <View>
      {/* 헤더 아이콘 버튼 */}
      <IconButton
        icon="settings"
        onPress={() => router.push('/settings')}
        variant="secondary"
        haptic="light"
      />

      {/* 삭제 아이콘 버튼 */}
      <IconButton
        icon="trash"
        onPress={handleDelete}
        variant="danger"
        haptic="heavy"
      />

      {/* 좋아요 버튼 */}
      <IconButton
        icon={isLiked ? "heart" : "heart-outline"}
        onPress={toggleLike}
        variant={isLiked ? "primary" : "secondary"}
        haptic="soft"
      />
    </View>
  );
}
```

---

### 예시 4: ButtonGroup 레이아웃

```typescript
// 가로 배치 (기본)
<ButtonGroup direction="row">
  <Button variant="secondary">취소</Button>
  <Button variant="primary">확인</Button>
</ButtonGroup>

// 세로 배치
<ButtonGroup direction="column" fullWidth>
  <Button variant="primary">로그인</Button>
  <Button variant="outline">회원가입</Button>
  <Button variant="ghost">비밀번호 찾기</Button>
</ButtonGroup>

// 균등 분할
<ButtonGroup direction="row" fullWidth>
  <Button variant="secondary" style={{ flex: 1 }}>
    취소
  </Button>
  <Button variant="primary" style={{ flex: 1 }}>
    확인
  </Button>
</ButtonGroup>
```

---

## 🎨 디자인 가이드라인

### 버튼 우선순위

**한 화면에 Primary 버튼은 1개만**
```typescript
// ✅ Good
<View>
  <Button variant="primary">저장하기</Button>
  <Button variant="secondary">취소</Button>
</View>

// ❌ Bad (Primary가 2개)
<View>
  <Button variant="primary">저장하기</Button>
  <Button variant="primary">취소</Button>
</View>
```

### 버튼 배치

**중요한 액션은 오른쪽/아래**
```typescript
// ✅ Good (확인이 오른쪽)
<ButtonGroup>
  <Button variant="secondary">취소</Button>
  <Button variant="primary">확인</Button>
</ButtonGroup>

// ❌ Bad (확인이 왼쪽)
<ButtonGroup>
  <Button variant="primary">확인</Button>
  <Button variant="secondary">취소</Button>
</ButtonGroup>
```

### 버튼 간격

```typescript
// 기본 간격: 12px
<ButtonGroup gap={12}>
  <Button>버튼 1</Button>
  <Button>버튼 2</Button>
</ButtonGroup>

// 넓은 간격: 16px
<ButtonGroup gap={16}>
  <Button>버튼 1</Button>
  <Button>버튼 2</Button>
</ButtonGroup>
```

---

## 📊 Haptic 성능 최적화

### 과도한 Haptic 방지

```typescript
// ❌ Bad (스크롤마다 피드백)
<ScrollView onScroll={() => haptic.light()}>
  {/* 너무 많은 피드백 */}
</ScrollView>

// ✅ Good (중요한 순간만)
<ScrollView onScrollEndDrag={() => haptic.soft()}>
  {/* 스크롤 끝날 때만 */}
</ScrollView>
```

### Haptic 설정 (사용자 제어)

```typescript
import { setHapticEnabled, isHapticEnabled } from '../utils/haptics';

// 설정 화면
function SettingsScreen() {
  const [hapticEnabled, setHapticState] = useState(isHapticEnabled());

  const toggleHaptic = (enabled: boolean) => {
    setHapticEnabled(enabled);
    setHapticState(enabled);
  };

  return (
    <Switch
      value={hapticEnabled}
      onValueChange={toggleHaptic}
    />
  );
}
```

---

## 🧪 테스트

### 버튼 동작 테스트

```typescript
// 1. 모든 variant 확인
const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
variants.forEach(variant => {
  <Button variant={variant}>Test</Button>
});

// 2. 로딩 상태 확인
<Button loading={true}>Loading...</Button>

// 3. 비활성화 상태 확인
<Button disabled={true}>Disabled</Button>

// 4. Haptic 피드백 확인
<Button onPress={() => console.log('Pressed')} haptic="medium">
  Press Me
</Button>
```

---

## 📈 예상 효과

| 지표 | BEFORE | AFTER | 개선율 |
|------|--------|-------|--------|
| **만족도** | 4.0 | 4.6 | +15% |
| **버튼 클릭률** | 65% | 82% | +26% |
| **인터랙션 즐거움** | - | 85% | NEW |

**사용자 피드백 (예상)**:
- "버튼 누를 때 진동이 느껴져서 좋아요"
- "앱이 더 프리미엄하게 느껴져요"
- "반응이 빠르고 정확해요"

---

## 🎯 체크리스트

배포 전 확인 사항:

- [ ] 모든 주요 버튼에 Haptic 피드백 적용
- [ ] 삭제 버튼은 `variant="danger"` 사용
- [ ] 한 화면에 Primary 버튼 1개만 존재
- [ ] 로딩 상태에서 `disabled={true}` 설정
- [ ] 중요한 액션은 오른쪽/아래 배치
- [ ] 아이콘 버튼에는 `IconButton` 사용
- [ ] Haptic 설정 기능 제공

---

**작성일**: 2026-02-16
**업데이트**: 필요시 언제든지
