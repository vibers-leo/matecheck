import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Share, Platform, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../../store/userStore';
import { useRouter } from 'expo-router';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../../constants/I18n';
import Avatar from '../../../components/Avatar';
import * as Clipboard from 'expo-clipboard';
import TutorialOverlay from '../../../components/TutorialOverlay';
import { Dimensions } from 'react-native';
import { clearAuthData } from '../../../utils/auth';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
    const {
        nickname, avatarId, nestName, logout, members, nestId, inviteCode,
        pendingRequests, fetchJoinRequests, approveJoinRequest,
        language, setLanguage, isMaster, appMode, setAppMode,
        syncMembers, isLoading
    } = useUserStore();
    const router = useRouter();
    const t = (translations[language as keyof typeof translations] as any).settings;

    const [localInviteCode, setLocalInviteCode] = useState<string>('');
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (nestId) {
            fetchJoinRequests();
            syncMembers(); // 최신 멤버 정보 동기화
            if (!inviteCode) {
                const randomCode = 'MC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                setLocalInviteCode(randomCode);
            } else {
                setLocalInviteCode(inviteCode);
            }
        }
    }, [nestId, inviteCode]);

    const handleLogout = () => {
        Alert.alert(
            t.logout,
            t.confirm_logout,
            [
                { text: t.cancel, style: "cancel" },
                {
                    text: t.logout,
                    style: "destructive",
                    onPress: async () => {
                        await clearAuthData(); // SecureStore 토큰 삭제
                        logout(); // 스토어 상태 초기화
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const toggleLanguage = () => {
        const nextLang = language === 'ko' ? 'en' : 'ko';
        setLanguage(nextLang);
    };

    const onCopyCode = async () => {
        if (!localInviteCode) return;
        await Clipboard.setStringAsync(localInviteCode);

        const message = language === 'ko' ? "초대 코드가 복사되었습니다." : "Invite code copied.";
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(language === 'ko' ? "복사 완료" : "Copied", message);
        }
    };

    const onShareInvite = async () => {
        if (!localInviteCode) return;
        const url = `https://matecheck-pearl.vercel.app/join_nest?code=${localInviteCode}`;
        try {
            await Share.share({
                message: language === 'ko'
                    ? `[MateCheck] 메이트체크에 초대합니다!\n\n초대 코드: ${localInviteCode}\n\n함께 즐거운 동거 생활을 시작해보세요!\n${url}`
                    : `[MateCheck] Join my nest!\n\nInvite Code: ${localInviteCode}\n\nStart your happy co-living journey!\n${url}`,
                url: url,
                title: language === 'ko' ? "메이트체크 초대" : "MateCheck Invitation"
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Supanova 설정 아이템 컴포넌트
    const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-4 px-5 active:bg-gray-50"
            style={{ minHeight: 44 }}
        >
            <View className="flex-row items-center gap-3">
                <View className={cn("w-9 h-9 rounded-xl items-center justify-center", isDestructive ? "bg-red-50" : "bg-gray-50")}>
                    <Ionicons name={icon} size={18} color={isDestructive ? "#EF4444" : "#6B7280"} />
                </View>
                <Text className={cn("text-base font-semibold", isDestructive ? "text-red-500" : "text-gray-900")}>{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-xs text-gray-400 font-medium">{value}</Text>}
                {!isDestructive && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
            </View>
        </TouchableOpacity>
    );

    // Supanova 그룹 구분 eyebrow 라벨
    const SectionLabel = ({ label }: { label: string }) => (
        <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-400 mb-2 px-1">
            {label}
        </Text>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Supanova 프로필 카드 — 상단 */}
            <View className="pt-16 pb-6 px-5 bg-white">
                <View className="flex-row justify-between items-start mb-6">
                    <Text className="text-2xl font-bold tracking-tight text-gray-900">{t.title}</Text>
                    <TouchableOpacity
                        onPress={() => setShowTutorial(true)}
                        className="w-9 h-9 bg-gray-50 rounded-full items-center justify-center"
                        style={{ minHeight: 44, minWidth: 44 }}
                    >
                        <Ionicons name="help" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* 프로필 영역 — 크게 */}
                <View className="items-center mb-5">
                    <View className="mb-3">
                        <Avatar
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            size="lg"
                            borderColor="#F3F4F6"
                            borderWidth={4}
                        />
                        {isMaster && (
                            <View className="absolute -bottom-1 -right-1 bg-yellow-400 px-2 py-0.5 rounded-full border-2 border-white">
                                <Text className="text-[10px] font-bold text-white">👑 {translations[language as keyof typeof translations].master.badge}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-xl font-bold tracking-tight text-gray-900 mb-0.5">{nickname}</Text>
                    <Text className="text-xs text-gray-400 font-medium">@{nestName}</Text>
                </View>

                {/* 프로필 편집 버튼 */}
                <TouchableOpacity
                    onPress={() => router.push('/profile_edit')}
                    className="bg-gray-900 py-3.5 rounded-full items-center"
                    style={{ minHeight: 44 }}
                >
                    <Text className="text-white font-semibold text-sm">{t.profile_edit}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-5 pt-5" showsVerticalScrollIndicator={false}>

                {/* 가입 요청 카드 */}
                {pendingRequests.length > 0 && (
                    <View className="mb-5">
                        <SectionLabel label={language === 'ko' ? '가입 요청' : 'Join Requests'} />
                        <View
                            className="bg-white rounded-3xl p-2 gap-2"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            {pendingRequests.map((req: any) => (
                                <View key={req.id} className="flex-row items-center justify-between p-4 bg-orange-50 rounded-2xl">
                                    <View className="flex-row items-center gap-3">
                                        <Avatar source={(AVATARS[req.avatarId] || AVATARS[0]).image} size="sm" />
                                        <View>
                                            <Text className="text-sm font-bold text-gray-900">{req.nickname}</Text>
                                            <Text className="text-xs text-orange-500 font-medium">
                                                {language === 'ko' ? '새 메이트 요청' : 'New Mate Request'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => approveJoinRequest(req.id)}
                                        className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center"
                                        style={{ minHeight: 44, minWidth: 44 }}
                                    >
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 설정 그룹들 */}
                <View className="gap-5">

                    {/* 그룹 1: 보금자리 */}
                    <View>
                        <SectionLabel label={t.nest_section || (language === 'ko' ? '보금자리' : 'Nest')} />
                        <View
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <SettingItem
                                icon="home"
                                label={language === 'ko' ? "보금자리 관리" : "Nest Settings"}
                                value={nestName}
                                onPress={() => router.push('/nest_management')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-5" />
                            <TouchableOpacity
                                onPress={() => router.push('/member_management')}
                                className="flex-row items-center justify-between py-4 px-5 active:bg-gray-50"
                                style={{ minHeight: 44 }}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-gray-50">
                                        <Ionicons name="people" size={18} color="#6B7280" />
                                    </View>
                                    <Text className="text-base font-semibold text-gray-900">{t.member_mgmt}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="flex-row -space-x-2 mr-2">
                                        {members.slice(0, 3).map((m: any, i: number) => (
                                            <Avatar
                                                key={m.id}
                                                source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                                size="xs"
                                                borderColor="#FFFFFF"
                                                borderWidth={2}
                                            />
                                        ))}
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                                </View>
                            </TouchableOpacity>
                            <View className="h-[1px] bg-gray-50 mx-5" />
                            <SettingItem
                                icon="share-social"
                                label={language === 'ko' ? "초대하기" : "Invite Mates"}
                                value={localInviteCode}
                                onPress={onShareInvite}
                            />
                        </View>
                    </View>

                    {/* 그룹 2: 앱 설정 */}
                    <View>
                        <SectionLabel label={t.account_section || (language === 'ko' ? '앱 설정' : 'App Settings')} />
                        <View
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <SettingItem
                                icon="notifications"
                                label={t.notifications}
                                value="On"
                            />
                            <View className="h-[1px] bg-gray-50 mx-5" />
                            <SettingItem
                                icon="globe"
                                label={language === 'ko' ? "언어 설정" : "Language"}
                                value={language === 'ko' ? "한국어" : "English"}
                                onPress={toggleLanguage}
                            />
                            <View className="h-[1px] bg-gray-50 mx-5" />
                            <SettingItem
                                icon="color-palette"
                                label={language === 'ko' ? "앱 테마" : "App Theme"}
                                value={appMode === 'roommatecheck' ? "Toss Style" : "MateCheck"}
                                onPress={() => {
                                    const next = appMode === 'roommatecheck' ? 'matecheck' : 'roommatecheck';
                                    setAppMode(next);
                                    Alert.alert(next === 'roommatecheck' ? 'Toss Mode' : 'MateCheck Mode', language === 'ko' ? '디자인 테마가 변경되었습니다.' : 'Theme changed successfully.');
                                }}
                            />
                        </View>
                    </View>

                    {/* 그룹 3: 도움말 */}
                    <View>
                        <SectionLabel label={language === 'ko' ? '도움말' : 'Help & Support'} />
                        <View
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <SettingItem
                                icon="megaphone"
                                label={language === 'ko' ? "공지사항" : "Announcements"}
                                onPress={() => router.push('/announcements')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-5" />
                            <SettingItem
                                icon="chatbubble-ellipses"
                                label={language === 'ko' ? "문의하기" : "Contact Us"}
                                onPress={() => router.push('/support')}
                            />
                        </View>
                    </View>

                    {/* 로그아웃 / 탈퇴 — 분리, 빨간색 */}
                    <View>
                        <SectionLabel label={language === 'ko' ? '계정' : 'Account'} />
                        <View
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <SettingItem
                                icon="log-out"
                                label={t.logout}
                                isDestructive
                                onPress={handleLogout}
                            />
                        </View>
                    </View>

                    {/* 버전 정보 — 맨 아래 caption */}
                    <View className="items-center py-6">
                        <Text className="text-xs text-gray-400">MateCheck v1.0.0</Text>
                    </View>

                </View>
            </ScrollView>

            {/* 튜토리얼 오버레이 — 기존 기능 유지 */}
            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 100, width: width - 40, height: 100, borderRadius: 24 },
                        title: (translations[language as keyof typeof translations] as any).settings_tutorial.step1_title,
                        description: (translations[language as keyof typeof translations] as any).settings_tutorial.step1_desc,
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 400, width: width - 40, height: 200, borderRadius: 24 },
                        title: (translations[language as keyof typeof translations] as any).settings_tutorial.step2_title,
                        description: (translations[language as keyof typeof translations] as any).settings_tutorial.step2_desc,
                        position: "top"
                    },
                    {
                        target: { x: 20, y: 550, width: width - 40, height: 100, borderRadius: 24 },
                        title: (translations[language as keyof typeof translations] as any).settings_tutorial.step3_title,
                        description: (translations[language as keyof typeof translations] as any).settings_tutorial.step3_desc,
                        position: "top"
                    }
                ]}
            />
        </View>
    );
}
