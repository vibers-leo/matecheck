/**
 * Budget AI - Smart Anomaly Detection
 * 통계 기반 지출 이상 감지 (무료)
 *
 * OKR 기여:
 * - KR1 (만족도): 사용자를 위한 proactive 알림
 * - KR2 (재방문율): 유용한 알림으로 앱 재방문 유도
 */

import { BudgetTransaction } from '../store/userStore';

export interface BudgetAnomaly {
  category: string;
  categoryName: string;
  usualAmount: number;
  currentAmount: number;
  percentageIncrease: number;
  severity: 'warning' | 'critical'; // warning: 1.5x, critical: 2x+
}

/**
 * 카테고리별 평균과 표준편차 계산
 */
function calculateStats(amounts: number[]): { mean: number; stdDev: number } {
  if (amounts.length === 0) return { mean: 0, stdDev: 0 };

  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * 카테고리별로 거래 그룹화
 */
function groupByCategory(transactions: BudgetTransaction[]): Record<string, BudgetTransaction[]> {
  return transactions.reduce((acc, txn) => {
    if (!acc[txn.category]) {
      acc[txn.category] = [];
    }
    acc[txn.category].push(txn);
    return acc;
  }, {} as Record<string, BudgetTransaction[]>);
}

/**
 * 카테고리 한글 이름 매핑
 */
const CATEGORY_NAMES: Record<string, string> = {
  food: '식비',
  housing: '주거/통신',
  living: '생활용품',
  transport: '교통비',
  etc: '기타'
};

/**
 * 예산 이상 감지 (Anomaly Detection)
 *
 * 로직:
 * 1. 최근 30일 거래를 카테고리별로 분류
 * 2. 각 카테고리의 일일 평균 지출 계산
 * 3. 최근 7일 평균이 전체 평균 대비 1.5배 이상이면 warning
 * 4. 2배 이상이면 critical
 *
 * @param transactions - 전체 거래 내역
 * @param daysToAnalyze - 분석할 기간 (기본 30일)
 * @param recentDays - 최근 비교 기간 (기본 7일)
 * @returns 감지된 이상 지출 목록
 */
export function detectBudgetAnomalies(
  transactions: BudgetTransaction[],
  daysToAnalyze: number = 30,
  recentDays: number = 7
): BudgetAnomaly[] {
  const anomalies: BudgetAnomaly[] = [];

  // 최근 30일 거래만 필터
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysToAnalyze);

  const recentTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate >= thirtyDaysAgo;
  });

  if (recentTransactions.length < 5) {
    // 데이터가 너무 적으면 분석 불가
    return anomalies;
  }

  // 카테고리별 그룹화
  const byCategory = groupByCategory(recentTransactions);

  // 최근 7일 날짜 범위
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - recentDays);

  // 각 카테고리별 분석
  for (const [category, txns] of Object.entries(byCategory)) {
    if (txns.length < 3) continue; // 데이터 너무 적음

    // 전체 기간 평균
    const allAmounts = txns.map(t => t.amount);
    const { mean: overallMean } = calculateStats(allAmounts);

    // 최근 7일 평균
    const recentTxns = txns.filter(t => new Date(t.date) >= sevenDaysAgo);
    if (recentTxns.length === 0) continue;

    const recentAmounts = recentTxns.map(t => t.amount);
    const recentTotal = recentAmounts.reduce((sum, val) => sum + val, 0);
    const recentMean = recentTotal / recentTxns.length;

    // 이상치 판단
    if (overallMean > 0) {
      const ratio = recentMean / overallMean;

      if (ratio >= 2.0) {
        // Critical: 2배 이상 증가
        anomalies.push({
          category,
          categoryName: CATEGORY_NAMES[category] || category,
          usualAmount: Math.round(overallMean),
          currentAmount: Math.round(recentMean),
          percentageIncrease: Math.round((ratio - 1) * 100),
          severity: 'critical'
        });
      } else if (ratio >= 1.5) {
        // Warning: 1.5배 이상 증가
        anomalies.push({
          category,
          categoryName: CATEGORY_NAMES[category] || category,
          usualAmount: Math.round(overallMean),
          currentAmount: Math.round(recentMean),
          percentageIncrease: Math.round((ratio - 1) * 100),
          severity: 'warning'
        });
      }
    }
  }

  // 심각도 순으로 정렬 (critical -> warning)
  return anomalies.sort((a, b) => {
    if (a.severity === b.severity) {
      return b.percentageIncrease - a.percentageIncrease;
    }
    return a.severity === 'critical' ? -1 : 1;
  });
}

/**
 * 이상 감지 알림 메시지 생성
 */
export function generateAnomalyMessage(anomaly: BudgetAnomaly): string {
  const { categoryName, usualAmount, currentAmount, percentageIncrease, severity } = anomaly;

  const emoji = severity === 'critical' ? '🚨' : '⚠️';

  return `${emoji} ${categoryName} 지출이 평소보다 ${percentageIncrease}% 높아요!\n평소: ${usualAmount.toLocaleString()}원 → 최근: ${currentAmount.toLocaleString()}원`;
}

/**
 * 예산 절약 팁 제안
 */
export function getSavingTips(category: string): string[] {
  const tips: Record<string, string[]> = {
    food: [
      '장을 보기 전에 미리 메뉴를 계획해보세요',
      '외식 대신 집밥 횟수를 늘려보세요',
      '대용량 구매로 단가를 낮춰보세요'
    ],
    housing: [
      '에어컨/히터 사용 시간을 줄여보세요',
      '절전형 가전제품으로 교체를 고려해보세요',
      '불필요한 구독 서비스를 정리해보세요'
    ],
    living: [
      '생활용품은 대용량/묶음 구매가 저렴해요',
      '할인 기간을 활용해보세요',
      '공용으로 사용할 수 있는 물품을 검토해보세요'
    ],
    transport: [
      '대중교통 정기권을 활용해보세요',
      '카풀이나 자전거 이용을 고려해보세요',
      '걷기 좋은 날씨에는 도보로 이동해보세요'
    ],
    etc: [
      '충동 구매를 줄여보세요',
      '필수 지출과 선택 지출을 구분해보세요',
      '한 달에 한 번 지출 내역을 검토해보세요'
    ]
  };

  return tips[category] || tips['etc'];
}
