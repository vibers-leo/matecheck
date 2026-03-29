// TodoScreen.tsx — 할 일 관리
// 카드 기반 UI: 프로그레스 바 + 미완료/완료 분리 + 하단 고정 추가 버튼

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS, CARD_STYLE } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useNestStore } from '../store/nestStore';
import { useTodoStore } from '../store/todoStore';

export default function TodoScreen() {
  const { userId } = useAuthStore();
  const { nestId } = useNestStore();
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo, syncMissions } = useTodoStore();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // 할 일 동기화
  const loadTodos = useCallback(async () => {
    if (nestId) {
      await syncMissions(nestId);
    }
  }, [nestId]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // 할 일 추가
  const handleAddTodo = async () => {
    if (!newTitle.trim()) return;
    if (!nestId) {
      Alert.alert('알림', '보금자리에 먼저 참여해주세요.');
      return;
    }

    try {
      await addTodo(newTitle.trim(), nestId);
      setNewTitle('');
      setIsAdding(false);
    } catch (error) {
      Alert.alert('오류', '할 일 추가에 실패했습니다.');
    }
  };

  // 할 일 토글
  const handleToggle = (todoId: string) => {
    if (!nestId) return;
    toggleTodo(todoId, userId, nestId);
  };

  // 할 일 삭제 확인
  const handleDelete = (todoId: string, title: string) => {
    Alert.alert('삭제 확인', `"${title}"을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          if (nestId) deleteTodo(todoId, nestId);
        },
      },
    ]);
  };

  // 미완료/완료 분리
  const activeTodos = useMemo(() => todos.filter((t) => !t.isCompleted), [todos]);
  const completedTodos = useMemo(() => todos.filter((t) => t.isCompleted), [todos]);
  const totalCount = todos.length;
  const completionRate = useMemo(
    () => (totalCount > 0 ? Math.round((completedTodos.length / totalCount) * 100) : 0),
    [completedTodos.length, totalCount]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTodos} />}
      >
        {/* 상단 요약 카드: 날짜 + 완료율 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
              할 일
            </Txt>
            <Txt typography="t6" color={COLORS.gray500}>
              {activeTodos.length}개 남음
            </Txt>
          </View>
          {totalCount > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
              </View>
              <Txt typography="t7" color={COLORS.tossBLue}>
                {completionRate}%
              </Txt>
            </View>
          )}
        </View>

        {/* 미완료 목록 카드 */}
        <View style={styles.listCard}>
          {activeTodos.length > 0 ? (
            activeTodos.map((todo, index) => (
              <TouchableOpacity
                key={todo.id}
                style={[
                  styles.todoRow,
                  index < activeTodos.length - 1 && styles.todoRowBorder,
                ]}
                onPress={() => handleToggle(todo.id)}
                onLongPress={() => handleDelete(todo.id, todo.title)}
                activeOpacity={0.6}
              >
                {/* 체크박스 (빈 원) */}
                <View style={styles.checkbox} />
                <View style={styles.todoContent}>
                  <Txt typography="t5" color={COLORS.gray800}>
                    {todo.title}
                  </Txt>
                  {todo.assignees.length > 0 && (
                    <View style={styles.assigneeRow}>
                      {todo.assignees.map((a, i) => (
                        <View key={i} style={styles.assigneeBadge}>
                          <Txt typography="t7" color={COLORS.gray500}>
                            {a.nickname}
                          </Txt>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            !isLoading && totalCount === 0 && (
              <View style={styles.emptyState}>
                <Txt typography="t2">📝</Txt>
                <View style={styles.spacer12} />
                <Txt typography="t5" color={COLORS.gray400}>
                  아직 할 일이 없어요
                </Txt>
                <View style={styles.spacer4} />
                <Txt typography="t6" color={COLORS.gray300}>
                  아래 버튼으로 할 일을 추가해보세요
                </Txt>
              </View>
            )
          )}
        </View>

        {/* 완료 목록 (접힌 상태 → 터치하면 펼침) */}
        {completedTodos.length > 0 && (
          <View style={styles.completedSection}>
            <TouchableOpacity
              style={styles.completedToggle}
              onPress={() => setShowCompleted(!showCompleted)}
              activeOpacity={0.6}
            >
              <Txt typography="t6" fontWeight="bold" color={COLORS.gray400}>
                완료됨 ({completedTodos.length})
              </Txt>
              <Txt typography="t6" color={COLORS.gray400}>
                {showCompleted ? '접기' : '펼치기'}
              </Txt>
            </TouchableOpacity>

            {showCompleted && (
              <View style={styles.listCard}>
                {completedTodos.map((todo, index) => (
                  <TouchableOpacity
                    key={todo.id}
                    style={[
                      styles.todoRow,
                      index < completedTodos.length - 1 && styles.todoRowBorder,
                    ]}
                    onPress={() => handleToggle(todo.id)}
                    onLongPress={() => handleDelete(todo.id, todo.title)}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.checkbox, styles.checkboxChecked]}>
                      <Txt typography="t7" color={COLORS.white}>
                        ✓
                      </Txt>
                    </View>
                    <View style={styles.todoContent}>
                      <Txt typography="t5" color={COLORS.gray400} style={styles.strikethrough}>
                        {todo.title}
                      </Txt>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 하단 여백 (버튼 영역 확보) */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 하단 고정: 추가 버튼 / 입력 폼 */}
      <View style={styles.bottomArea}>
        {isAdding ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="할 일을 입력하세요"
              placeholderTextColor={COLORS.gray400}
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleAddTodo}
              autoFocus
              returnKeyType="done"
            />
            <View style={styles.addFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setNewTitle('');
                }}
              >
                <Txt typography="t6" color={COLORS.gray500}>
                  취소
                </Txt>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !newTitle.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleAddTodo}
                disabled={!newTitle.trim()}
              >
                <Txt typography="t6" fontWeight="bold" color={COLORS.white}>
                  저장
                </Txt>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
            activeOpacity={0.8}
          >
            <Txt typography="t5" fontWeight="bold" color={COLORS.white}>
              + 할 일 추가
            </Txt>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.tossBLue,
  },
  listCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    padding: 0,
    overflow: 'hidden',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  todoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.tossBLue,
    borderColor: COLORS.tossBLue,
  },
  todoContent: {
    flex: 1,
    gap: 4,
  },
  assigneeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  assigneeBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  completedSection: {
    marginTop: 12,
  },
  completedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  spacer12: {
    height: 12,
  },
  spacer4: {
    height: 4,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: COLORS.pageBg,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray200,
  },
  addButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addForm: {
    gap: 12,
  },
  input: {
    fontSize: 16,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
});
