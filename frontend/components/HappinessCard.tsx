/**
 * Happiness Card Component
 * AI 행복 매니저의 추천을 표시하는 카드
 *
 * OKR 기여:
 * - KR1 (만족도): 따뜻한 AI 추천으로 사용자 만족도 향상
 * - KR2 (재방문율): 매일 새로운 추천으로 재방문 유도
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_ELEVATION } from '../constants/DesignTokens';
import { HappinessSuggestion, getCachedHappinessSuggestions } from '../utils/happinessAI';
import { useUserStore } from '../store/userStore';

interface HappinessCardProps {
  onActionPress?: (suggestion: HappinessSuggestion) => void;
}

/**
 * AI 행복 매니저 카드
 *
 * 기능:
 * - AI 추천 사항 표시
 * - 우선순위별 색상 구분
 * - 액션 버튼 (일정 등록, 메시지 보내기 등)
 * - 자동 새로고침 (5분 캐싱)
 */
export default function HappinessCard({ onActionPress }: HappinessCardProps) {
  const { members, todos, transactions, events } = useUserStore();
  const [suggestions, setSuggestions] = useState<HappinessSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(false);

      const aiSuggestions = await getCachedHappinessSuggestions(
        members,
        todos,
        transactions,
        events
      );

      setSuggestions(aiSuggestions);
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conflict': return { bg: TDS_COLORS.red, light: '#FEE2E2', text: '#DC2626' };
      case 'harmony': return { bg: TDS_COLORS.blue, light: '#DBEAFE', text: '#2563EB' };
      case 'activity': return { bg: '#10B981', light: '#D1FAE5', text: '#059669' };
      case 'appreciation': return { bg: '#F59E0B', light: '#FEF3C7', text: '#D97706' };
      default: return { bg: TDS_COLORS.grey500, light: TDS_COLORS.grey100, text: TDS_COLORS.grey700 };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { label: '중요', color: '#DC2626' };
      case 'medium': return { label: '권장', color: '#F59E0B' };
      case 'low': return { label: '선택', color: '#6B7280' };
      default: return { label: '', color: TDS_COLORS.grey500 };
    }
  };

  if (loading) {
    return (
      <View style={{
        backgroundColor: TDS_COLORS.white,
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        ...TDS_ELEVATION.card,
      }}>
        <ActivityIndicator size="large" color={TDS_COLORS.blue} />
        <Text style={{
          marginTop: 12,
          ...TDS_TYPOGRAPHY.caption1,
          color: TDS_COLORS.grey500,
        }}>
          AI가 추천을 생성하는 중...
        </Text>
      </View>
    );
  }

  if (error || suggestions.length === 0) {
    return (
      <View style={{
        backgroundColor: TDS_COLORS.white,
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
        ...TDS_ELEVATION.card,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
          <Text style={{ ...TDS_TYPOGRAPHY.h2, color: TDS_COLORS.grey900 }}>
            AI 행복 매니저
          </Text>
        </View>
        <Text style={{ ...TDS_TYPOGRAPHY.body2, color: TDS_COLORS.grey600, marginBottom: 16 }}>
          {error ? '추천을 불러올 수 없습니다' : '오늘은 추천할 내용이 없어요'}
        </Text>
        <TouchableOpacity
          onPress={loadSuggestions}
          style={{
            backgroundColor: TDS_COLORS.grey100,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...TDS_TYPOGRAPHY.body2, color: TDS_COLORS.grey700 }}>
            다시 시도
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={{
        backgroundColor: TDS_COLORS.white,
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
        ...TDS_ELEVATION.card,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, marginRight: 8 }}>🤖</Text>
          <View>
            <Text style={{ ...TDS_TYPOGRAPHY.h2, color: TDS_COLORS.grey900 }}>
              AI 행복 매니저
            </Text>
            <Text style={{ ...TDS_TYPOGRAPHY.caption2, color: TDS_COLORS.grey500 }}>
              보금자리를 더 행복하게
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadSuggestions} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={20} color={TDS_COLORS.grey500} />
        </TouchableOpacity>
      </View>

      {/* Suggestions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {suggestions.map((suggestion, index) => {
          const colors = getTypeColor(suggestion.type);
          const priorityBadge = getPriorityBadge(suggestion.priority);

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 100)}
              style={{
                backgroundColor: colors.light,
                borderRadius: 20,
                padding: 16,
                width: 280,
                borderWidth: 2,
                borderColor: colors.bg + '20',
              }}
            >
              {/* Priority Badge */}
              {priorityBadge.label && (
                <View style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: priorityBadge.color + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}>
                  <Text style={{
                    ...TDS_TYPOGRAPHY.caption3,
                    color: priorityBadge.color,
                  }}>
                    {priorityBadge.label}
                  </Text>
                </View>
              )}

              {/* Emoji */}
              <Text style={{ fontSize: 32, marginBottom: 12 }}>
                {suggestion.emoji}
              </Text>

              {/* Title */}
              <Text style={{
                ...TDS_TYPOGRAPHY.h3,
                color: colors.text,
                marginBottom: 8,
              }}>
                {suggestion.title}
              </Text>

              {/* Description */}
              <Text style={{
                ...TDS_TYPOGRAPHY.body2,
                color: TDS_COLORS.grey700,
                marginBottom: 12,
                lineHeight: 20,
              }}>
                {suggestion.description}
              </Text>

              {/* Action Button */}
              {suggestion.action && (
                <TouchableOpacity
                  onPress={() => onActionPress?.(suggestion)}
                  style={{
                    backgroundColor: colors.bg,
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    ...TDS_TYPOGRAPHY.caption1,
                    color: TDS_COLORS.white,
                  }}>
                    {suggestion.action}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={TDS_COLORS.white} />
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={{
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: TDS_COLORS.grey200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ ...TDS_TYPOGRAPHY.caption2, color: TDS_COLORS.grey500 }}>
          💡 5분마다 자동 업데이트
        </Text>
        <View style={{
          backgroundColor: TDS_COLORS.blue + '15',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={{ ...TDS_TYPOGRAPHY.caption3, color: TDS_COLORS.blue }}>
            Powered by Claude
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Compact 버전 (홈 화면용 작은 카드)
 */
export function HappinessCardCompact({ onActionPress }: HappinessCardProps) {
  const { members, todos, transactions, events } = useUserStore();
  const [suggestion, setSuggestion] = useState<HappinessSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopSuggestion();
  }, []);

  const loadTopSuggestion = async () => {
    try {
      const suggestions = await getCachedHappinessSuggestions(members, todos, transactions, events);
      if (suggestions.length > 0) {
        // 우선순위 높은 것 먼저
        const sortedSuggestions = suggestions.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        setSuggestion(sortedSuggestions[0]);
      }
    } catch (err) {
      console.error('Failed to load suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !suggestion) return null;

  const colors = getTypeColor(suggestion.type);

  function getTypeColor(type: string) {
    switch (type) {
      case 'conflict': return { bg: TDS_COLORS.red, light: '#FEE2E2' };
      case 'harmony': return { bg: TDS_COLORS.blue, light: '#DBEAFE' };
      case 'activity': return { bg: '#10B981', light: '#D1FAE5' };
      case 'appreciation': return { bg: '#F59E0B', light: '#FEF3C7' };
      default: return { bg: TDS_COLORS.grey500, light: TDS_COLORS.grey100 };
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onActionPress?.(suggestion)}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.light,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.bg + '20',
      }}
    >
      <Text style={{ fontSize: 32 }}>{suggestion.emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, marginRight: 6 }}>🤖</Text>
          <Text style={{ ...TDS_TYPOGRAPHY.caption2, color: TDS_COLORS.grey600 }}>
            AI 추천
          </Text>
        </View>
        <Text style={{ ...TDS_TYPOGRAPHY.h3, color: TDS_COLORS.grey900, marginBottom: 4 }}>
          {suggestion.title}
        </Text>
        <Text style={{ ...TDS_TYPOGRAPHY.caption1, color: TDS_COLORS.grey600 }} numberOfLines={2}>
          {suggestion.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.bg} />
    </TouchableOpacity>
  );
}
