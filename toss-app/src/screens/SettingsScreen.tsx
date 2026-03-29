// SettingsScreen.tsx — 설정
// 프로필 + 로그아웃

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS, APP_NAME } from '../constants/config';
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

  // 초대 코드 복사 (Clipboard API가 없으므로 Alert으로 대체)
  const handleCopyInviteCode = () => {
    if (inviteCode) {
      Alert.alert('초대 코드', `초대 코드: ${inviteCode}\n\n이 코드를 룸메이트에게 공유하세요!`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Txt typography="t2" color={COLORS.white}>
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

      {/* 보금자리 정보 */}
      <View style={styles.section}>
        <Txt typography="t6" fontWeight="bold" color={COLORS.gray400}>
          보금자리 정보
        </Txt>
        <View style={styles.spacer12} />

        <View style={styles.infoRow}>
          <Txt typography="t6" color={COLORS.gray600}>
            보금자리 이름
          </Txt>
          <Txt typography="t6" color={COLORS.gray900}>
            {nestName || '없음'}
          </Txt>
        </View>

        <View style={styles.infoRow}>
          <Txt typography="t6" color={COLORS.gray600}>
            멤버 수
          </Txt>
          <Txt typography="t6" color={COLORS.gray900}>
            {members.length}명
          </Txt>
        </View>

        {inviteCode && (
          <TouchableOpacity style={styles.infoRow} onPress={handleCopyInviteCode}>
            <Txt typography="t6" color={COLORS.gray600}>
              초대 코드
            </Txt>
            <Txt typography="t6" color={COLORS.tossBLue}>
              {inviteCode} (탭하여 보기)
            </Txt>
          </TouchableOpacity>
        )}
      </View>

      {/* 앱 정보 */}
      <View style={styles.section}>
        <Txt typography="t6" fontWeight="bold" color={COLORS.gray400}>
          앱 정보
        </Txt>
        <View style={styles.spacer12} />

        <View style={styles.infoRow}>
          <Txt typography="t6" color={COLORS.gray600}>
            버전
          </Txt>
          <Txt typography="t6" color={COLORS.gray900}>
            1.0.0
          </Txt>
        </View>

        <View style={styles.infoRow}>
          <Txt typography="t6" color={COLORS.gray600}>
            제작
          </Txt>
          <Txt typography="t6" color={COLORS.gray900}>
            계발자들 (Vibers)
          </Txt>
        </View>
      </View>

      {/* 로그아웃 */}
      <View style={styles.logoutSection}>
        <Button display="block" size="big" type="light" onPress={handleLogout}>
          로그아웃
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.gray50,
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
    gap: 2,
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.gray50,
  },
  spacer12: {
    height: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 32,
  },
});
