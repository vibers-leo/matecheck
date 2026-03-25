/**
 * Task AI - Fair Task Assignment
 * 공평한 일 분배 추천 알고리즘 (무료)
 *
 * OKR 기여:
 * - KR1 (만족도): 공평한 분배로 갈등 감소
 * - KR2 (재방문율): 유용한 추천으로 앱 사용 증가
 */

import { Todo } from '../store/userStore';

export interface Member {
  id: string;
  nickname: string;
  avatarId?: string | number;
}

export interface TaskAssignmentScore {
  memberId: string;
  memberName: string;
  score: number; // 낮을수록 추천 (적게 배정됨)
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
  reason: string;
}

/**
 * 공평한 일 분배 추천
 *
 * 로직:
 * 1. 각 멤버의 할 일 배정 횟수 계산
 * 2. 완료율 고려 (완료율 높은 사람에게 우선 배정)
 * 3. 최근 배정 이력 고려 (최근에 배정받은 사람은 낮은 우선순위)
 * 4. 가장 적게 배정받은 사람 추천
 *
 * @param members - 모든 멤버 리스트
 * @param todos - 전체 할 일 리스트
 * @param recentDays - 최근 고려 기간 (기본 30일)
 * @returns 추천 멤버 (점수 낮은 순)
 */
export function suggestFairTaskAssignment(
  members: Member[],
  todos: Todo[],
  recentDays: number = 30
): TaskAssignmentScore[] {
  if (members.length === 0) return [];

  // 최근 30일 할 일만 필터
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - recentDays);

  const recentTodos = todos.filter(todo => {
    const todoDate = new Date(todo.createdAt || new Date());
    return todoDate >= thirtyDaysAgo;
  });

  // 각 멤버의 통계 계산
  const memberScores: TaskAssignmentScore[] = members.map(member => {
    // 배정된 할 일 (assignees에 포함된 경우)
    const assignedTodos = recentTodos.filter(todo =>
      todo.assignees?.some(a => a.id === member.id)
    );

    // 완료한 할 일
    const completedTodos = assignedTodos.filter(todo => todo.isCompleted);

    const totalAssigned = assignedTodos.length;
    const totalCompleted = completedTodos.length;
    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

    // 점수 계산 (낮을수록 추천)
    // 1. 기본 점수: 배정 횟수
    let score = totalAssigned * 10;

    // 2. 완료율 보너스 (완료율 높으면 점수 감소 = 우선 추천)
    // 완료율 100% → -5점, 50% → -2.5점, 0% → 0점
    score -= (completionRate / 100) * 5;

    // 3. 최근 배정 페널티
    const lastAssignedTodo = assignedTodos
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

    if (lastAssignedTodo) {
      const daysSinceLastAssignment = Math.floor(
        (new Date().getTime() - new Date(lastAssignedTodo.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24)
      );

      // 최근 3일 이내 배정 → +3점 페널티
      if (daysSinceLastAssignment < 3) {
        score += 3;
      }
    }

    // 이유 생성
    let reason = '';
    if (totalAssigned === 0) {
      reason = '아직 배정받은 일이 없어요';
    } else if (completionRate === 100) {
      reason = `완료율 ${Math.round(completionRate)}%로 성실해요! 👍`;
    } else if (completionRate >= 70) {
      reason = `완료율 ${Math.round(completionRate)}%로 잘하고 있어요`;
    } else if (totalAssigned < Math.min(...members.map(m => {
      const count = recentTodos.filter(t => t.assignees?.some(a => a.id === m.id)).length;
      return count;
    }))) {
      reason = '가장 적게 배정받았어요';
    } else {
      reason = `완료율 ${Math.round(completionRate)}%`;
    }

    return {
      memberId: member.id,
      memberName: member.nickname,
      score,
      totalAssigned,
      totalCompleted,
      completionRate: Math.round(completionRate),
      reason
    };
  });

  // 점수 낮은 순으로 정렬 (공평하게 배정)
  return memberScores.sort((a, b) => a.score - b.score);
}

/**
 * 단일 추천 멤버 반환 (가장 공평한 선택)
 */
export function suggestSingleAssignee(members: Member[], todos: Todo[]): Member | null {
  const scores = suggestFairTaskAssignment(members, todos);
  if (scores.length === 0) return null;

  const topScore = scores[0];
  return members.find(m => m.id === topScore.memberId) || null;
}

/**
 * 추천 메시지 생성
 */
export function generateAssignmentMessage(score: TaskAssignmentScore): string {
  const { memberName, totalAssigned, completionRate, reason } = score;

  if (totalAssigned === 0) {
    return `💡 ${memberName}님이 좋을 것 같아요! (${reason})`;
  }

  return `💡 ${memberName}님 어때요? ${reason}`;
}

/**
 * 팀 밸런스 분석
 * 팀 전체의 일 분배가 얼마나 공평한지 점수로 반환
 *
 * @returns 0-100 점수 (100 = 완벽하게 공평, 0 = 매우 불공평)
 */
export function analyzeTeamBalance(members: Member[], todos: Todo[]): {
  balanceScore: number;
  isBalanced: boolean;
  message: string;
} {
  if (members.length === 0 || todos.length === 0) {
    return { balanceScore: 100, isBalanced: true, message: '아직 데이터가 없어요' };
  }

  const scores = suggestFairTaskAssignment(members, todos);

  // 표준편차 계산 (분산도)
  const avgAssigned = scores.reduce((sum, s) => sum + s.totalAssigned, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s.totalAssigned - avgAssigned, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // 밸런스 점수 (표준편차 낮을수록 공평 → 점수 높음)
  // 표준편차 0 → 100점, 표준편차 5+ → 0점
  const balanceScore = Math.max(0, Math.min(100, 100 - (stdDev * 20)));

  const isBalanced = balanceScore >= 70;

  let message = '';
  if (balanceScore >= 90) {
    message = '완벽하게 공평하게 분배되고 있어요! 🎉';
  } else if (balanceScore >= 70) {
    message = '잘 분배되고 있어요 👍';
  } else if (balanceScore >= 50) {
    message = '조금 더 공평하게 분배해보세요';
  } else {
    message = '일부 멤버에게 일이 몰려있어요 😅';
  }

  return { balanceScore: Math.round(balanceScore), isBalanced, message };
}

/**
 * 다음 주 로테이션 추천
 * 이번 주 가장 많이 한 사람은 다음 주 가장 적게
 */
export function suggestWeeklyRotation(members: Member[], todos: Todo[]): Member[] {
  const scores = suggestFairTaskAssignment(members, todos, 7); // 최근 7일

  // 점수 낮은 순 (가장 적게 한 사람부터)
  return scores.map(s => members.find(m => m.id === s.memberId)!).filter(Boolean);
}
