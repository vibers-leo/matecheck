// TossNavBar.tsx — 토스 스타일 네비게이션 바
// 깔끔한 상단 바: 좌측 타이틀 + 우측 더보기/닫기 버튼

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS } from '../constants/config';

interface TossNavBarProps {
  title?: string;
  onMorePress?: () => void;
  onClosePress: () => void;
  showMoreButton?: boolean;
}

export default function TossNavBar({
  title,
  onMorePress,
  onClosePress,
  showMoreButton = true,
}: TossNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* 좌측: 타이틀 */}
        <View style={styles.titleContainer}>
          {title && (
            <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
              {title}
            </Txt>
          )}
        </View>

        {/* 우측: ... 버튼 + X 버튼 */}
        <View style={styles.buttonContainer}>
          {showMoreButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onMorePress}
              accessibilityLabel="더보기"
              activeOpacity={0.6}
            >
              <Txt typography="t5" color={COLORS.gray500}>
                ···
              </Txt>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onClosePress}
            accessibilityLabel="닫기"
            activeOpacity={0.6}
          >
            <Txt typography="t5" fontWeight="bold" color={COLORS.gray500}>
              ✕
            </Txt>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
