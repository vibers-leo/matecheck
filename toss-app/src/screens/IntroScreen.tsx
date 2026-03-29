// IntroScreen.tsx — 서비스 소개 (토스 로그인 전)
// 풀페이지 인트로: 큰 이모지 + 핵심 설명 + 하단 고정 CTA

import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS } from '../constants/config';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

interface IntroScreenProps {
  navigation: any;
}

export default function IntroScreen({ navigation }: IntroScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const loginWithToss = useAuthStore((s) => s.loginWithToss);

  // 토스 로그인 시작
  const handleStart = async () => {
    setIsLoading(true);
    try {
      // TODO: 실제 토스 프로필 API 연동 후 교체
      const success = await loginWithToss('toss_user_001', '토스유저');
      if (success) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 상단 여백 + 로고 영역 */}
        <View style={styles.heroArea}>
          <View style={styles.emojiContainer}>
            <Txt typography="t1" style={styles.heroEmoji}>
              🏠
            </Txt>
          </View>

          <View style={styles.spacer24} />

          <Txt typography="t2" fontWeight="bold" color={COLORS.gray900} textAlign="center">
            함께 사는 공간,{'\n'}함께 관리해요
          </Txt>

          <View style={styles.spacer16} />

          <Txt typography="t5" color={COLORS.gray500} textAlign="center">
            할 일, 가계부, 규칙을 한 곳에서
          </Txt>
        </View>

        {/* 기능 하이라이트 카드 */}
        <View style={styles.featureArea}>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Txt typography="t4">✅</Txt>
              <Txt typography="t6" color={COLORS.gray700}>할 일 관리</Txt>
            </View>
            <View style={styles.featureItem}>
              <Txt typography="t4">💰</Txt>
              <Txt typography="t6" color={COLORS.gray700}>공동 가계부</Txt>
            </View>
            <View style={styles.featureItem}>
              <Txt typography="t4">📋</Txt>
              <Txt typography="t6" color={COLORS.gray700}>생활 규칙</Txt>
            </View>
          </View>

          <View style={styles.spacer16} />

          <View style={styles.targetBadge}>
            <Txt typography="t7" color={COLORS.gray500}>
              룸메이트 · 커플 · 가족 모두 사용할 수 있어요
            </Txt>
          </View>
        </View>
      </View>

      {/* 하단 고정 CTA 버튼 */}
      <View style={styles.bottomArea}>
        <Button
          display="block"
          size="big"
          type="primary"
          onPress={handleStart}
          loading={isLoading}
        >
          시작하기
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emojiContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.tossBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 44,
  },
  spacer24: {
    height: 24,
  },
  spacer16: {
    height: 16,
  },
  featureArea: {
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  targetBadge: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
});
