/**
 * Skeleton Loading Component
 * react-native-reanimated 기반 shimmer 효과
 *
 * OKR 기여:
 * - KR1 (만족도): 프리미엄 로딩 경험
 * - KR2 (재방문율): 지루하지 않은 대기 시간
 */

import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { TDS_COLORS, TDS_RADIUS } from '../constants/DesignTokens';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * 단일 Skeleton 요소 (shimmer 효과)
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = TDS_RADIUS.sm,
  style
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: TDS_COLORS.grey200,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * 카드 Skeleton (home.tsx, budget.tsx용)
 */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ padding: 24, backgroundColor: TDS_COLORS.white, borderRadius: 28 }, style]}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={24} />
      </View>

      {/* Content Lines */}
      <Skeleton width="100%" height={16} style={{ marginBottom: 12 }} />
      <Skeleton width="90%" height={16} style={{ marginBottom: 12 }} />
      <Skeleton width="60%" height={16} />
    </View>
  );
}

/**
 * Todo 아이템 Skeleton (plan.tsx용)
 */
export function SkeletonTodoItem() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TDS_COLORS.white,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12
      }}
    >
      {/* Checkbox */}
      <Skeleton width={24} height={24} borderRadius={6} style={{ marginRight: 12 }} />

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </View>

      {/* Avatar */}
      <Skeleton width={28} height={28} borderRadius={14} />
    </View>
  );
}

/**
 * 캘린더 Skeleton (plan.tsx용)
 */
export function SkeletonCalendar() {
  return (
    <View style={{ padding: 16, backgroundColor: TDS_COLORS.white, borderRadius: 24 }}>
      {/* Month Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Skeleton width={30} height={30} borderRadius={15} />
        <Skeleton width={100} height={20} />
        <Skeleton width={30} height={30} borderRadius={15} />
      </View>

      {/* Week Days */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} width={30} height={14} />
        ))}
      </View>

      {/* Date Grid (4 weeks) */}
      {[...Array(4)].map((_, week) => (
        <View key={week} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
          {[...Array(7)].map((_, day) => (
            <Skeleton key={day} width={30} height={30} borderRadius={15} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * 차트 Skeleton (budget.tsx용)
 */
export function SkeletonChart() {
  return (
    <View style={{ padding: 24, backgroundColor: TDS_COLORS.white, borderRadius: 28, alignItems: 'center' }}>
      {/* Chart Circle */}
      <Skeleton width={180} height={180} borderRadius={90} style={{ marginBottom: 20 }} />

      {/* Legend */}
      <View style={{ width: '100%', gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Skeleton width={12} height={12} borderRadius={6} style={{ marginRight: 8 }} />
              <Skeleton width="60%" height={14} />
            </View>
            <Skeleton width={60} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * 리스트 Skeleton (여러 아이템)
 */
export function SkeletonList({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'todo' }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <View key={i}>
          {type === 'card' ? <SkeletonCard style={{ marginBottom: 16 }} /> : <SkeletonTodoItem />}
        </View>
      ))}
    </>
  );
}
