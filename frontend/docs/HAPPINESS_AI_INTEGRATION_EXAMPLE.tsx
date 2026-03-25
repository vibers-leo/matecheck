/**
 * AI 행복 매니저 통합 예시
 * home.tsx에 추가할 코드
 *
 * ⚠️ 이 파일은 예시이며 실제로 실행되지 않습니다
 * 아래 코드를 app/toss/(tabs)/home.tsx에 복사하세요
 */

import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// 1️⃣ AI 컴포넌트 import
import HappinessCard, { HappinessCardCompact } from '../../../components/HappinessCard';
import { HappinessSuggestion } from '../../../utils/happinessAI';

export default function HomeScreen() {
  const router = useRouter();

  // 2️⃣ AI 추천 액션 핸들러
  const handleAISuggestionAction = (suggestion: HappinessSuggestion) => {
    console.log('🤖 AI Action:', suggestion.type, suggestion.title);

    // 추천 타입별 라우팅
    switch (suggestion.type) {
      case 'activity':
        // 일정 추가 화면으로 이동
        router.push({
          pathname: '/(tabs)/plan',
          params: { action: 'add' }
        });
        break;

      case 'harmony':
        // 감사 메시지 또는 하우스 룰 화면
        router.push('/(tabs)/rules');
        break;

      case 'conflict':
        // 집안일 로테이션 또는 할 일 분배
        router.push({
          pathname: '/(tabs)/plan',
          params: { action: 'todo' }
        });
        break;

      case 'appreciation':
        // TODO: 감사 메시지 기능 (향후 구현)
        alert(`💙 ${suggestion.description}\n\n감사 메시지 기능은 곧 추가될 예정입니다!`);
        break;

      default:
        console.log('Unknown suggestion type:', suggestion.type);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* 기존 홈 헤더 */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-black text-gray-900">
          안녕하세요 👋
        </Text>
      </View>

      {/* 3️⃣ AI 행복 매니저 카드 추가 (전체 버전) */}
      <View className="px-4">
        <HappinessCard onActionPress={handleAISuggestionAction} />
      </View>

      {/* 또는 3️⃣-B Compact 버전 (작은 카드) */}
      {/*
      <View className="px-6">
        <HappinessCardCompact onActionPress={handleAISuggestionAction} />
      </View>
      */}

      {/* 기존 홈 콘텐츠 (오늘의 할 일, 다가오는 일정 등) */}
      <View className="px-6">
        {/* ... 기존 콘텐츠 ... */}
      </View>
    </ScrollView>
  );
}

/**
 * 배치 옵션
 */

// ✅ 옵션 1: 홈 화면 상단 (추천)
// - 사용자가 가장 먼저 보는 위치
// - 재방문율 향상에 효과적

// ✅ 옵션 2: 할 일 섹션 위
// - 관련성 높은 배치
// - "다음에 할 일" 컨텍스트

// ✅ 옵션 3: 일정 섹션 아래
// - 활동 제안에 적합
// - 스크롤 후 발견 (덜 침투적)

/**
 * 고급 사용 예시
 */

// 예시 1: 조건부 표시 (활동이 적을 때만)
function ConditionalHappinessCard() {
  const { todos, events } = useUserStore();
  const recentActivity = todos.filter(/* 최근 7일 */).length;

  // 활동이 적을 때만 AI 추천 표시
  if (recentActivity < 3) {
    return <HappinessCard onActionPress={handleAISuggestionAction} />;
  }

  return null;
}

// 예시 2: 시간대별 표시
function TimeBasedHappinessCard() {
  const hour = new Date().getHours();

  // 저녁 시간에만 표시 (18시-22시)
  if (hour >= 18 && hour < 22) {
    return <HappinessCard onActionPress={handleAISuggestionAction} />;
  }

  return null;
}

// 예시 3: 우선순위 높은 추천만
function HighPriorityAlert() {
  const [highPrioritySuggestion, setHighPrioritySuggestion] = useState(null);

  useEffect(() => {
    async function loadSuggestion() {
      const suggestions = await getCachedHappinessSuggestions(/* ... */);
      const highPriority = suggestions.find(s => s.priority === 'high');
      setHighPrioritySuggestion(highPriority);
    }
    loadSuggestion();
  }, []);

  if (!highPrioritySuggestion) return null;

  return (
    <View className="px-6 mb-4">
      <View className="bg-red-50 border-2 border-red-200 rounded-3xl p-4">
        <View className="flex-row items-center mb-2">
          <Text className="text-2xl mr-2">{highPrioritySuggestion.emoji}</Text>
          <Text className="text-red-700 font-bold">
            {highPrioritySuggestion.title}
          </Text>
        </View>
        <Text className="text-red-600 mb-3">
          {highPrioritySuggestion.description}
        </Text>
        <TouchableOpacity
          onPress={() => handleAISuggestionAction(highPrioritySuggestion)}
          className="bg-red-600 rounded-xl py-3 px-4"
        >
          <Text className="text-white font-bold text-center">
            {highPrioritySuggestion.action}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * 디버깅
 */

// 개발 중 로그 확인
console.log('🤖 [Happiness AI] Loading suggestions...');
console.log('💰 [Happiness AI] Estimated cost:', estimateMonthlyCost(10));

// Sentry 통합 (선택)
import { addSentryBreadcrumb } from '../../../utils/sentry';

const handleAISuggestionActionWithTracking = (suggestion: HappinessSuggestion) => {
  // Sentry breadcrumb 추가
  addSentryBreadcrumb('ai_suggestion', 'User clicked AI suggestion', {
    type: suggestion.type,
    title: suggestion.title,
    priority: suggestion.priority,
  });

  handleAISuggestionAction(suggestion);
};
