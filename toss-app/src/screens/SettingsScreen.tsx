// SettingsScreen.tsx — 설정
// 카드 기반 UI: 프로필 카드 + 메뉴 그룹 + 로그아웃

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS, CARD_STYLE, APP_NAME } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useNestStore } from '../store/nestStore';

interface SettingsScreenProps {
  onLogout: () => void;
}

export default function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const { nickname, userId, avatarId, logout } = useAuthStore();
  const { nestName, nestId, inviteCode, members } = useNestStore();

  // 로그아웃 확인
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          logout();
          onLogout();
        },
      },
    ]);
  };

  // 초대 코드 보기
  const handleCopyInviteCode = () => {
    if (inviteCode) {
      Alert.alert('초대 코드', `초대 코드: ${inviteCode}\n\n이 코드를 룸메이트에게 공유하세요!`);
    }
  };

  // 메뉴 아이템 렌더러
  const MenuItem = ({
    emoji,
    label,
    value,
    onPress,
    showChevron = true,
    isLast = false,
  }: {
    emoji: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconContainer}>
          <Txt typography="t5">{emoji}</Txt>
        </View>
        <Txt typography="t5" color={COLORS.gray800}>
          {label}
        </Txt>
      </View>
      <View style={styles.menuRight}>
        {value && (
          <Txt typography="t6" color={COLORS.gray500}>
            {value}
          </Txt>
        )}
        {showChevron && (
          <Txt typography="t6" color={COLORS.gray300}>
            &gt;
          </Txt>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Txt typography="t2" fontWeight="bold" color={COLORS.white}>
            {nickname ? nickname.charAt(0) : '?'}
          </Txt>
        </View>
        <View style={styles.profileInfo}>
          <Txt typography="t4" fontWeight="bold" color={COLORS.gray900}>
            {nickname || '이름 없음'}
          </Txt>
          <Txt typography="t6" color={COLORS.gray500}>
            {APP_NAME}
          </Txt>
        </View>
      </View>

      {/* 보금자리 정보 그룹 */}
      <View style={styles.sectionLabel}>
        <Txt typography="t7" fontWeight="bold" color={COLORS.gray400}>
          보금자리 정보
        </Txt>
      </View>
      <View style={styles.menuCard}>
        <MenuItem
          emoji="🏠"
          label="보금자리 이름"
          value={nestName || '없음'}
          showChevron={false}
        />
        <MenuItem
          emoji="👥"
          label="멤버 수"
          value={`${members.length}명`}
          showChevron={false}
        />
        {inviteCode && (
          <MenuItem
            emoji="🔑"
            label="초대 코드"
            value={inviteCode}
            onPress={handleCopyInviteCode}
            isLast
          />
        )}
        {!inviteCode && (
          <MenuItem
            emoji="🔑"
            label="초대 코드"
            value="없음"
            showChevron={false}
            isLast
          />
        )}
      </View>

      {/* 앱 정보 그룹 */}
      <View style={styles.sectionLabel}>
        <Txt typography="t7" fontWeight="bold" color={COLORS.gray400}>
          앱 정보
        </Txt>
      </View>
      <View style={styles.menuCard}>
        <MenuItem
          emoji="📱"
          label="버전"
          value="1.0.0"
          showChevron={false}
        />
        <MenuItem
          emoji="👨‍💻"
          label="제작"
          value="계발자들 (Vibers)"
          showChevron={false}
          isLast
        />
      </View>

      {/* 로그아웃 */}
      <View style={styles.logoutArea}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Txt typography="t5" fontWeight="bold" color={COLORS.red}>
            로그아웃
          </Txt>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
});
