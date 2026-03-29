// HomeScreen.tsx — 홈 화면
// 보금자리 이름 + 멤버 + 오늘 할 일 목록

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { ListRow } from '@toss/tds-react-native';
import { COLORS } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useNestStore } from '../store/nestStore';
import { useTodoStore } from '../store/todoStore';

export default function HomeScreen() {
  const { nickname, userId } = useAuthStore();
  const { nestId, nestName, members, isLoading: nestLoading, fetchNest } = useNestStore();
  const { todos, isLoading: todoLoading, syncMissions } = useTodoStore();

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (nestId) {
      await Promise.all([fetchNest(nestId), syncMissions(nestId)]);
    }
  }, [nestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 오늘 할 일 (미완료)
  const todayTodos = todos.filter((t) => !t.isCompleted).slice(0, 5);
  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={nestLoading || todoLoading} onRefresh={loadData} />
      }
    >
      {/* 인사말 */}
      <View style={styles.header}>
        <Txt typography="t3" fontWeight="bold" color={COLORS.gray900}>
          안녕하세요, {nickname || '메이트'}님
        </Txt>
        {nestName ? (
          <Txt typography="t6" color={COLORS.gray500}>
            🏠 {nestName}
          </Txt>
        ) : (
          <Txt typography="t6" color={COLORS.gray500}>
            보금자리를 만들거나 참여해보세요
          </Txt>
        )}
      </View>

      {/* 멤버 목록 */}
      {members.length > 0 && (
        <View style={styles.section}>
          <Txt typography="t5" fontWeight="bold" color={COLORS.gray800}>
            함께 사는 멤버 ({members.length}명)
          </Txt>
          <View style={styles.spacer12} />
          <View style={styles.memberList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberChip}>
                <Txt typography="t6" color={COLORS.tossBLue}>
                  {member.nickname}
                  {member.role === 'master' ? ' 👑' : ''}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 오늘 할 일 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Txt typography="t5" fontWeight="bold" color={COLORS.gray800}>
            오늘 할 일
          </Txt>
          <Txt typography="t6" color={COLORS.gray500}>
            {completedCount}/{todos.length} 완료
          </Txt>
        </View>
        <View style={styles.spacer12} />

        {todayTodos.length > 0 ? (
          todayTodos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <View style={styles.todoDot} />
              <Txt typography="t6" color={COLORS.gray700}>
                {todo.title}
              </Txt>
              {todo.assignees.length > 0 && (
                <Txt typography="t7" color={COLORS.gray400}>
                  {' '}
                  · {todo.assignees.map((a) => a.nickname).join(', ')}
                </Txt>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Txt typography="t6" color={COLORS.gray400}>
              {nestId ? '오늘 할 일이 없어요 🎉' : '보금자리에 참여하면 할 일을 관리할 수 있어요'}
            </Txt>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer12: {
    height: 12,
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    backgroundColor: COLORS.tossBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  todoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.tossBLue,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
