// HomeScreen.tsx — 홈 화면
// 카드 기반 UI: 멤버 아바타 스크롤 + 오늘 할 일 + 이번 달 지출 요약

import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS, CARD_STYLE } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useNestStore } from '../store/nestStore';
import { useTodoStore } from '../store/todoStore';

export default function HomeScreen() {
  const { nickname } = useAuthStore();
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

  // 오늘 할 일 (미완료 상위 5개)
  const todayTodos = useMemo(() => todos.filter((t) => !t.isCompleted).slice(0, 5), [todos]);
  const completedCount = useMemo(() => todos.filter((t) => t.isCompleted).length, [todos]);
  const totalCount = todos.length;

  // 완료율 퍼센트
  const completionRate = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={nestLoading || todoLoading} onRefresh={loadData} />
      }
    >
      {/* 인사말 + 보금자리 이름 */}
      <View style={styles.header}>
        <Txt typography="t3" fontWeight="bold" color={COLORS.gray900}>
          안녕하세요, {nickname || '메이트'}님 👋
        </Txt>
        {nestName ? (
          <View style={styles.nestBadge}>
            <Txt typography="t6" color={COLORS.tossBLue}>
              🏠 {nestName}
            </Txt>
          </View>
        ) : (
          <Txt typography="t6" color={COLORS.gray500}>
            보금자리를 만들거나 참여해보세요
          </Txt>
        )}
      </View>

      {/* 카드 1: 멤버 */}
      {members.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
              함께 사는 멤버
            </Txt>
            <Txt typography="t7" color={COLORS.gray400}>
              {members.length}명
            </Txt>
          </View>
          <View style={styles.spacer16} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.memberList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Txt typography="t5" fontWeight="bold" color={COLORS.white}>
                      {member.nickname.charAt(0)}
                    </Txt>
                  </View>
                  <Txt typography="t7" color={COLORS.gray600}>
                    {member.nickname}
                    {member.role === 'master' ? ' 👑' : ''}
                  </Txt>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 카드 2: 오늘 할 일 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
            오늘 할 일
          </Txt>
          <Txt typography="t7" color={COLORS.gray400}>
            {completedCount}/{totalCount} 완료
          </Txt>
        </View>

        {/* 진행률 바 */}
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

        <View style={styles.spacer12} />

        {todayTodos.length > 0 ? (
          todayTodos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <View style={styles.todoDot} />
              <View style={styles.todoTextArea}>
                <Txt typography="t6" color={COLORS.gray800}>
                  {todo.title}
                </Txt>
              </View>
              {todo.assignees.length > 0 && (
                <View style={styles.assigneeBadge}>
                  <Txt typography="t7" color={COLORS.gray500}>
                    {todo.assignees.map((a) => a.nickname).join(', ')}
                  </Txt>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Txt typography="t3">🎉</Txt>
            <View style={styles.spacer8} />
            <Txt typography="t6" color={COLORS.gray400}>
              {nestId ? '오늘 할 일이 없어요' : '보금자리에 참여하면 할 일을 관리할 수 있어요'}
            </Txt>
          </View>
        )}
      </View>

      {/* 카드 3: 이번 달 지출 요약 (플레이스홀더) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
            이번 달 지출
          </Txt>
          <Txt typography="t7" color={COLORS.tossBLue}>
            전체보기 &gt;
          </Txt>
        </View>
        <View style={styles.spacer12} />
        <Txt typography="t2" fontWeight="bold" color={COLORS.gray900}>
          — 원
        </Txt>
        <View style={styles.spacer4} />
        <Txt typography="t7" color={COLORS.gray400}>
          가계부 탭에서 거래를 추가해보세요
        </Txt>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 8,
  },
  nestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tossBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  card: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer16: {
    height: 16,
  },
  spacer12: {
    height: 12,
  },
  spacer8: {
    height: 8,
  },
  spacer4: {
    height: 4,
  },
  memberList: {
    flexDirection: 'row',
    gap: 16,
  },
  memberItem: {
    alignItems: 'center',
    gap: 6,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
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
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 10,
    paddingVertical: 6,
  },
  todoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.tossBLue,
  },
  todoTextArea: {
    flex: 1,
  },
  assigneeBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 12,
  },
});
