// IntroScreen.tsx — 서비스 소개 (토스 로그인 전)
// 인트로 → 로그인 → 메인 흐름의 첫 번째 화면

import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS } from '../constants/config';
import { useAuthStore } from '../store/authStore';

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
      // 현재는 테스트용 더미 데이터로 로그인
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
        {/* 로고 영역 */}
        <View style={styles.logoArea}>
          <View style={styles.iconCircle}>
            <Txt typography="t1" color={COLORS.white}>
              🏠
            </Txt>
          </View>
        </View>

        {/* 서비스 소개 */}
        <View style={styles.textArea}>
          <Txt typography="t2" fontWeight="bold" color={COLORS.gray900} textAlign="center">
            룸메이트체크
          </Txt>
          <View style={styles.spacer16} />
          <Txt typography="t5" color={COLORS.gray600} textAlign="center">
            함께 사는 공간, 함께 관리해요
          </Txt>
          <View style={styles.spacer8} />
          <Txt typography="t6" color={COLORS.gray500} textAlign="center">
            할 일, 가계부, 규칙을 한 곳에서 관리하고{'\n'}
            투명한 공동 생활을 시작하세요
          </Txt>
          <View style={styles.spacer8} />
          <Txt typography="t6" color={COLORS.gray500} textAlign="center">
            룸메이트, 커플, 가족 모두 사용할 수 있어요
          </Txt>
        </View>

        {/* 시작하기 버튼 */}
        <View style={styles.buttonArea}>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  spacer16: {
    height: 16,
  },
  spacer8: {
    height: 8,
  },
  buttonArea: {
    paddingHorizontal: 8,
  },
});
