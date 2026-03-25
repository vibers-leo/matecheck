/**
 * Happiness AI Manager
 * Claude Haiku API를 활용한 보금자리 화합 증진 AI
 *
 * OKR 기여:
 * - KR1 (만족도): Proactive한 케어로 갈등 예방, 만족도 향상
 * - KR2 (재방문율): 흥미로운 AI 추천으로 재방문 유도
 *
 * 비용: 월 ~$3 (Claude Haiku - 1M tokens $0.25)
 */

import { Todo, BudgetTransaction, CalendarEvent } from '../store/userStore';
import { Member } from './taskAI';

// Anthropic API 설정
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Claude 모델 (비용 최적화)
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'; // 가장 저렴한 모델

export interface HappinessSuggestion {
  type: 'conflict' | 'harmony' | 'activity' | 'appreciation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  emoji: string;
}

/**
 * 보금자리 데이터 분석 및 AI 추천 생성
 *
 * @param members - 구성원 리스트
 * @param todos - 할 일 리스트
 * @param transactions - 예산 내역
 * @param events - 일정 리스트
 * @returns AI 추천 사항
 */
export async function generateHappinessSuggestions(
  members: Member[],
  todos: Todo[],
  transactions: BudgetTransaction[],
  events: CalendarEvent[]
): Promise<HappinessSuggestion[]> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️ Anthropic API key not configured');
    return getFallbackSuggestions();
  }

  // 데이터 분석
  const analysis = analyzeNestData(members, todos, transactions, events);

  // Claude Haiku에게 추천 요청
  try {
    const prompt = buildPrompt(analysis);
    const response = await callClaudeAPI(prompt);
    return parseSuggestions(response);
  } catch (error) {
    console.error('AI 추천 생성 실패:', error);
    return getFallbackSuggestions();
  }
}

/**
 * 보금자리 데이터 분석
 */
function analyzeNestData(
  members: Member[],
  todos: Todo[],
  transactions: BudgetTransaction[],
  events: CalendarEvent[]
): NestAnalysis {
  // 할 일 분석
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.isCompleted).length;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // 멤버별 할 일 분포
  const memberWorkload = members.map(member => {
    const assignedTodos = todos.filter(t =>
      t.assignees?.some(a => a.id === member.id)
    );
    return {
      memberId: member.id,
      memberName: member.nickname,
      totalAssigned: assignedTodos.length,
      completed: assignedTodos.filter(t => t.isCompleted).length,
    };
  });

  // 일의 불균형 감지
  const workloadVariance = calculateVariance(memberWorkload.map(m => m.totalAssigned));
  const isUnbalanced = workloadVariance > 5;

  // 예산 분석
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgSpentPerMember = members.length > 0 ? totalSpent / members.length : 0;

  // 최근 활동 분석
  const recentTodos = todos.filter(t => {
    const createdAt = new Date(t.createdAt || 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  });

  const isActive = recentTodos.length > 5; // 최근 30일간 5개 이상 활동

  // 다가오는 일정
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    return eventDate >= today && eventDate <= weekLater;
  });

  return {
    memberCount: members.length,
    totalTodos,
    completedTodos,
    completionRate,
    memberWorkload,
    isUnbalanced,
    totalSpent,
    avgSpentPerMember,
    isActive,
    upcomingEventsCount: upcomingEvents.length,
    recentActivityCount: recentTodos.length,
  };
}

interface NestAnalysis {
  memberCount: number;
  totalTodos: number;
  completedTodos: number;
  completionRate: number;
  memberWorkload: Array<{
    memberId: string;
    memberName: string;
    totalAssigned: number;
    completed: number;
  }>;
  isUnbalanced: boolean;
  totalSpent: number;
  avgSpentPerMember: number;
  isActive: boolean;
  upcomingEventsCount: number;
  recentActivityCount: number;
}

/**
 * Claude API 호출용 프롬프트 생성
 */
function buildPrompt(analysis: NestAnalysis): string {
  return `당신은 룸메이트들의 화합을 돕는 AI 매니저입니다. 보금자리 구성원들이 더 행복하게 지낼 수 있도록 조언해주세요.

**현재 상황:**
- 구성원 수: ${analysis.memberCount}명
- 전체 할 일: ${analysis.totalTodos}개 (완료율 ${analysis.completionRate.toFixed(1)}%)
- 최근 활동: ${analysis.isActive ? '활발함 ✅' : '다소 조용함 😴'}
- 일 분배: ${analysis.isUnbalanced ? '⚠️ 불균형 (일부 멤버에게 몰림)' : '✅ 균형 잡힘'}
- 다가오는 일정: ${analysis.upcomingEventsCount}개
- 평균 지출: ${Math.round(analysis.avgSpentPerMember).toLocaleString()}원/인

**멤버별 현황:**
${analysis.memberWorkload.map(m => `- ${m.memberName}: ${m.totalAssigned}개 할당 (${m.completed}개 완료)`).join('\n')}

**요청:**
위 데이터를 바탕으로 다음 형식의 JSON 배열로 2-3개의 추천을 생성해주세요:

[
  {
    "type": "conflict|harmony|activity|appreciation",
    "priority": "high|medium|low",
    "title": "짧은 제목 (10자 이내)",
    "description": "구체적인 설명 (30자 이내)",
    "action": "실천 가능한 액션 (20자 이내)",
    "emoji": "적절한 이모지"
  }
]

**참고 사항:**
- type: conflict(갈등 예방), harmony(화합 증진), activity(활동 제안), appreciation(감사 표현)
- priority: high(즉시 조치 필요), medium(권장), low(선택 사항)
- 한국어로 작성
- 실천 가능한 구체적인 제안
- 긍정적이고 따뜻한 톤

JSON 배열만 반환해주세요 (다른 설명 없이):`;
}

/**
 * Claude Haiku API 호출
 */
async function callClaudeAPI(prompt: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500, // 비용 절감: 짧은 응답만
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Claude 응답 파싱
 */
function parseSuggestions(response: string): HappinessSuggestion[] {
  try {
    // JSON 추출 (```json ``` 제거)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions as HappinessSuggestion[];
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return getFallbackSuggestions();
  }
}

/**
 * Fallback 추천 (API 실패 시)
 */
function getFallbackSuggestions(): HappinessSuggestion[] {
  return [
    {
      type: 'activity',
      priority: 'medium',
      title: '함께 저녁 식사',
      description: '이번 주말에 다같이 요리해보는 건 어떨까요?',
      action: '주말 식사 일정 등록하기',
      emoji: '🍽️',
    },
    {
      type: 'harmony',
      priority: 'low',
      title: '감사 메시지',
      description: '오늘 집안일 해준 메이트에게 고마움을 전해보세요',
      action: '감사 메시지 남기기',
      emoji: '💙',
    },
  ];
}

/**
 * 분산 계산 (데이터 불균형 감지)
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;

  return Math.sqrt(variance);
}

/**
 * 빠른 추천 생성 (캐싱 지원)
 * 동일한 데이터로 5분 내 재요청 시 캐시 반환
 */
let cachedSuggestions: HappinessSuggestion[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export async function getCachedHappinessSuggestions(
  members: Member[],
  todos: Todo[],
  transactions: BudgetTransaction[],
  events: CalendarEvent[]
): Promise<HappinessSuggestion[]> {
  const now = Date.now();

  // 캐시 유효성 확인
  if (cachedSuggestions && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Using cached AI suggestions');
    return cachedSuggestions;
  }

  // 새로 생성
  console.log('🤖 Generating new AI suggestions...');
  const suggestions = await generateHappinessSuggestions(members, todos, transactions, events);

  // 캐시 저장
  cachedSuggestions = suggestions;
  cacheTimestamp = now;

  return suggestions;
}

/**
 * 비용 추정
 * Claude Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
 */
export function estimateMonthlyCost(requestsPerDay: number): number {
  const avgInputTokens = 500; // 프롬프트 크기
  const avgOutputTokens = 300; // 응답 크기
  const requestsPerMonth = requestsPerDay * 30;

  const inputCost = (avgInputTokens * requestsPerMonth / 1_000_000) * 0.25;
  const outputCost = (avgOutputTokens * requestsPerMonth / 1_000_000) * 1.25;

  return inputCost + outputCost;
}

// 예상 비용: 하루 10회 요청 시 월 $0.45
// 예상 비용: 하루 100회 요청 시 월 $4.50
console.log('💰 Estimated monthly cost (10 requests/day):', `$${estimateMonthlyCost(10).toFixed(2)}`);
