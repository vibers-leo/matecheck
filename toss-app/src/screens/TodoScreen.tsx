// TodoScreen.tsx — 할 일 관리
// 할 일 CRUD (체크/추가/삭제)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useNestStore } from '../store/nestStore';
import { useTodoStore } from '../store/todoStore';

export default function TodoScreen() {
  const { userId } = useAuthStore();
  const { nestId } = useNestStore();
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo, syncMissions } = useTodoStore();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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
  const activeTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTodos} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Txt typography="t4" fontWeight="bold" color={COLORS.gray900}>
            할 일
          </Txt>
          <Txt typography="t6" color={COLORS.gray500}>
            {activeTodos.length}개 남음
          </Txt>
        </View>

        {/* 할 일 추가 입력 */}
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
            />
            <View style={styles.addButtons}>
              <Button size="medium" type="light" onPress={() => setIsAdding(false)}>
                취소
              </Button>
              <Button size="medium" type="primary" onPress={handleAddTodo}>
                추가
              </Button>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Txt typography="t6" color={COLORS.tossBLue}>
              + 할 일 추가
            </Txt>
          </TouchableOpacity>
        )}

        {/* 미완료 목록 */}
        {activeTodos.map((todo) => (
          <TouchableOpacity
            key={todo.id}
            style={styles.todoRow}
            onPress={() => handleToggle(todo.id)}
            onLongPress={() => handleDelete(todo.id, todo.title)}
          >
            <View style={styles.checkbox} />
            <View style={styles.todoContent}>
              <Txt typography="t6" color={COLORS.gray800}>
                {todo.title}
              </Txt>
              {todo.assignees.length > 0 && (
                <Txt typography="t7" color={COLORS.gray400}>
                  {todo.assignees.map((a) => a.nickname).join(', ')}
                </Txt>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* 완료 목록 */}
        {completedTodos.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.sectionLabel}>
              <Txt typography="t6" fontWeight="bold" color={COLORS.gray400}>
                완료됨 ({completedTodos.length})
              </Txt>
            </View>
            {completedTodos.map((todo) => (
              <TouchableOpacity
                key={todo.id}
                style={styles.todoRow}
                onPress={() => handleToggle(todo.id)}
                onLongPress={() => handleDelete(todo.id, todo.title)}
              >
                <View style={[styles.checkbox, styles.checkboxChecked]}>
                  <Txt typography="t7" color={COLORS.white}>
                    ✓
                  </Txt>
                </View>
                <View style={styles.todoContent}>
                  <Txt typography="t6" color={COLORS.gray400}>
                    {todo.title}
                  </Txt>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* 빈 상태 */}
        {todos.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Txt typography="t5" color={COLORS.gray400}>
              아직 할 일이 없어요
            </Txt>
            <View style={{ height: 4 }} />
            <Txt typography="t6" color={COLORS.gray300}>
              위의 + 버튼으로 할 일을 추가해보세요
            </Txt>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  addForm: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  input: {
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tossBLue,
    marginBottom: 12,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    gap: 2,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.gray50,
  },
  sectionLabel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
