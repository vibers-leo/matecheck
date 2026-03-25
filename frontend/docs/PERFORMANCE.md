# 성능 최적화 가이드

> MateCheck 프로젝트의 성능 최적화 Best Practices

---

## 📊 목표 (OKR KR2, KR3)

- **KR2 (재방문율)**: 빠른 로딩, 매끄러운 애니메이션으로 사용자 경험 개선
- **KR3 (안정성)**: 메모리 사용량 최적화, 크래시 방지

---

## 🖼️ 1. 이미지 최적화

### ✅ OptimizedImage 컴포넌트 사용

**기본 Image 컴포넌트 대신 OptimizedImage 사용**

```tsx
// ❌ Before (느림, 캐싱 없음)
import { Image } from 'react-native';
<Image source={{ uri: url }} style={{ width: 100, height: 100 }} />

// ✅ After (빠름, 자동 캐싱)
import { OptimizedImage } from '../components/OptimizedImage';
<OptimizedImage uri={url} style={{ width: 100, height: 100 }} />
```

### 특수 이미지 컴포넌트

```tsx
// 아바타 (원형)
<AvatarImage uri={avatarUrl} style={{ width: 50, height: 50 }} />

// 썸네일 (우선순위 낮음)
<ThumbnailImage uri={thumbnailUrl} style={{ width: 80, height: 80 }} />

// 배경 이미지 (우선순위 높음)
<BackgroundImage uri={bgUrl} style={{ flex: 1 }} />
```

### 캐싱 전략

```tsx
<OptimizedImage
  uri={url}
  cache="immutable"  // 절대 변하지 않음 (아바타, 아이콘)
  // cache="web"     // HTTP 캐시 헤더 따름 (일반 이미지)
  // cache="cacheOnly" // 캐시만 사용 (오프라인)
/>
```

---

## 📜 2. 긴 리스트 최적화 (FlashList)

### ✅ FlashList 사용

**FlatList 대신 FlashList 사용 (10배 빠름)**

```tsx
// ❌ Before (느림, 메모리 많이 사용)
import { FlatList } from 'react-native';
<FlatList data={todos} renderItem={renderTodo} />

// ✅ After (빠름, 메모리 효율적)
import { FlashList } from '@shopify/flash-list';
<FlashList
  data={todos}
  renderItem={renderTodo}
  estimatedItemSize={80}  // 필수! 아이템 평균 높이
/>
```

### FlashList 최적화 팁

```tsx
<FlashList
  data={todos}
  renderItem={renderTodo}
  estimatedItemSize={80}

  // 성능 향상 옵션
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={5}

  // 키 추출 (필수)
  keyExtractor={(item) => item.id}

  // 아이템 변경 감지
  extraData={selectedId}
/>
```

### renderItem 최적화

```tsx
// ✅ renderItem은 컴포넌트로 분리 + React.memo
const TodoItem = React.memo(({ item }: { item: Todo }) => {
  return (
    <View>
      <Text>{item.title}</Text>
    </View>
  );
});

<FlashList
  data={todos}
  renderItem={({ item }) => <TodoItem item={item} />}
  estimatedItemSize={80}
/>
```

---

## ⚛️ 3. React 렌더링 최적화

### ✅ React.memo

**불필요한 리렌더링 방지**

```tsx
// ❌ Before (부모가 리렌더링되면 항상 리렌더링)
const TodoItem = ({ item }) => {
  return <Text>{item.title}</Text>;
};

// ✅ After (props가 변경될 때만 리렌더링)
const TodoItem = React.memo(({ item }) => {
  return <Text>{item.title}</Text>;
});

// ✅ 커스텀 비교 함수
const TodoItem = React.memo(
  ({ item }) => <Text>{item.title}</Text>,
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);
```

### ✅ useMemo

**비싼 계산 결과 캐싱**

```tsx
// ❌ Before (매번 재계산)
const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);

// ✅ After (transactions 변경 시에만 재계산)
const totalExpense = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);
```

### ✅ useCallback

**함수 재생성 방지**

```tsx
// ❌ Before (매번 새 함수 생성)
const handlePress = (id: string) => {
  deleteTodo(id);
};

// ✅ After (deleteTodo 변경 시에만 재생성)
const handlePress = useCallback((id: string) => {
  deleteTodo(id);
}, [deleteTodo]);
```

### 최적화 체크리스트

```tsx
function TodoList() {
  const todos = useUserStore((state) => state.todos);
  const deleteTodo = useUserStore((state) => state.deleteTodo);

  // ✅ 비싼 계산은 useMemo
  const completedCount = useMemo(() => {
    return todos.filter(t => t.isCompleted).length;
  }, [todos]);

  // ✅ 콜백은 useCallback
  const handleDelete = useCallback((id: string) => {
    deleteTodo(id);
  }, [deleteTodo]);

  // ✅ renderItem은 컴포넌트로 분리
  const renderItem = useCallback(({ item }) => (
    <TodoItemMemo item={item} onDelete={handleDelete} />
  ), [handleDelete]);

  return (
    <FlashList
      data={todos}
      renderItem={renderItem}
      estimatedItemSize={80}
    />
  );
}

// ✅ 아이템 컴포넌트는 React.memo
const TodoItemMemo = React.memo(TodoItem);
```

---

## 🎯 4. 성능 유틸리티 사용

### Debounce (검색 입력)

```tsx
import { useDebounce } from '../utils/performance';

const SearchInput = () => {
  const debouncedSearch = useDebounce((query: string) => {
    fetchSearchResults(query);
  }, 500);

  return (
    <TextInput
      onChangeText={debouncedSearch}
      placeholder="검색..."
    />
  );
};
```

### Throttle (스크롤 이벤트)

```tsx
import { useThrottle } from '../utils/performance';

const ScrollView = () => {
  const throttledScroll = useThrottle((event) => {
    handleScroll(event);
  }, 100);

  return (
    <ScrollView onScroll={throttledScroll}>
      {/* ... */}
    </ScrollView>
  );
};
```

---

## 📏 5. 성능 측정

### 개발 모드에서 성능 측정

```tsx
import { measurePerformance, logMemoryUsage } from '../utils/performance';

// 함수 실행 시간 측정
measurePerformance('Todo Calculation', () => {
  const result = heavyCalculation(data);
});

// 메모리 사용량 로깅
logMemoryUsage('Before API Call');
await fetchData();
logMemoryUsage('After API Call');
```

---

## ❌ 피해야 할 것

### 1. 인라인 함수 (렌더링 시 매번 생성)

```tsx
// ❌ Bad
<TouchableOpacity onPress={() => deleteTodo(id)}>

// ✅ Good
const handlePress = useCallback(() => deleteTodo(id), [id, deleteTodo]);
<TouchableOpacity onPress={handlePress}>
```

### 2. 인라인 스타일 객체

```tsx
// ❌ Bad (매번 새 객체 생성)
<View style={{ padding: 10, margin: 5 }}>

// ✅ Good (StyleSheet 사용)
const styles = StyleSheet.create({
  container: { padding: 10, margin: 5 },
});
<View style={styles.container}>
```

### 3. 조건부 렌더링에서 새 컴포넌트 생성

```tsx
// ❌ Bad
{isVisible && <Text style={{ color: 'red' }}>Error</Text>}

// ✅ Good
const errorTextStyle = styles.errorText;
{isVisible && <Text style={errorTextStyle}>Error</Text>}
```

### 4. Key에 인덱스 사용

```tsx
// ❌ Bad (아이템 순서 변경 시 문제)
{todos.map((todo, index) => <TodoItem key={index} item={todo} />)}

// ✅ Good (고유 ID 사용)
{todos.map((todo) => <TodoItem key={todo.id} item={todo} />)}
```

---

## 🎯 성능 목표

- **앱 초기 로딩**: < 2초
- **화면 전환**: < 300ms
- **API 응답**: < 200ms (평균)
- **리스트 스크롤**: 60 FPS 유지
- **메모리 사용**: < 150MB (평균)

---

## 🔍 성능 프로파일링 도구

### React DevTools Profiler

```bash
# React Native Debugger 사용
# Performance 탭에서 Flame Graph 확인
```

### Flipper

```bash
# Flipper 설치 및 실행
# React DevTools, Network Inspector 등 사용
```

---

**마지막 업데이트**: 2026-02-14
