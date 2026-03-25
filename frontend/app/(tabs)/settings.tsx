import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Share, Platform, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { cn } from '../../lib/utils';
import { AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../constants/I18n';
import Avatar from '../../components/Avatar';
import * as Clipboard from 'expo-clipboard';
import TutorialOverlay from '../../components/TutorialOverlay';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
    const {
        nickname, avatarId, nestName, logout, members, nestId, inviteCode,
        pendingRequests, fetchJoinRequests, approveJoinRequest,
        language, setLanguage, isMaster, appMode, setAppMode
    } = useUserStore();
    const router = useRouter();
    const t = (translations[language as keyof typeof translations] as any).settings;

    const [localInviteCode, setLocalInviteCode] = useState<string>('');
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (nestId) {
            fetchJoinRequests();

            // Mock invite code generation for functionality
            if (!inviteCode) {
                // Generate a random code if not provided by backend yet
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
                    onPress: () => {
                        logout();
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

    const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
        <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-5 px-6 active:bg-gray-50">
            <View className="flex-row items-center gap-4">
                <View className={cn("w-10 h-10 rounded-2xl items-center justify-center", isDestructive ? "bg-red-50" : "bg-gray-50")}>
                    <Ionicons name={icon} size={20} color={isDestructive ? "#EF4444" : "#4B5563"} />
                </View>
                <Text className={cn("text-base font-bold", isDestructive ? "text-red-500" : "text-gray-900")}>{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-gray-400 font-medium text-sm">{value}</Text>}
                {!isDestructive && <Ionicons name="chevron-forward" size={18} color="#E5E7EB" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header / Profile Section */}
            <View className="pt-12 pb-8 px-6 bg-white shadow-sm rounded-b-[40px] mb-8 z-10">
                <View className="flex-row justify-between items-start mb-6">
                    <Text className="text-2xl font-black text-gray-900">{t.title}</Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="p-2 bg-gray-50 rounded-full">
                        <Ionicons name="help" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-5">
                    <View>
                        <Avatar
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            size="lg"
                            borderColor="#F3F4F6"
                            borderWidth={4}
                        />
                        {isMaster && (
                            <View className="absolute -bottom-1 -right-1 bg-yellow-400 px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                <Text className="text-[10px] font-black text-white">👑 {translations[language as keyof typeof translations].master.badge}</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{nickname}</Text>
                        <Text className="text-gray-500 font-medium text-sm mb-3">@{nestName}</Text>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => router.push('/profile_edit')}
                                className="bg-gray-900 px-4 py-2 rounded-full"
                            >
                                <Text className="text-white font-bold text-xs">{t.profile_edit}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleLogout}
                                className="bg-gray-100 px-4 py-2 rounded-full"
                            >
                                <Text className="text-gray-600 font-bold text-xs">{t.logout}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6">

                {/* Join Requests (Card Style) */}
                {pendingRequests.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-gray-900 mb-3 px-2">🔔 {t.join_requests}</Text>
                        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 gap-2">
                            {pendingRequests.map((req: any) => (
                                <View key={req.id} className="flex-row items-center justify-between p-4 bg-orange-50 rounded-2xl">
                                    <View className="flex-row items-center gap-3">
                                        <Avatar source={(AVATARS[req.avatarId] || AVATARS[0]).image} size="sm" />
                                        <View>
                                            <Text className="text-base font-bold text-gray-900">{req.nickname}</Text>
                                            <Text className="text-orange-600/60 text-xs font-bold">New Mate Request</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => approveJoinRequest(req.id)}
                                        className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center shadow-sm"
                                    >
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Settings Groups */}
                <View className="gap-8">

                    {/* Group 1: Nest & Members */}
                    <View>
                        <Text className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">{t.nest_section}</Text>
                        <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                            <SettingItem
                                icon="home"
                                label={language === 'ko' ? "보금자리 관리" : "Nest Settings"}
                                value={nestName}
                                onPress={() => router.push('/nest_management')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <TouchableOpacity onPress={() => router.push('/member_management')} className="flex-row items-center justify-between py-5 px-6 active:bg-gray-50">
                                <View className="flex-row items-center gap-4">
                                    <View className="w-10 h-10 rounded-2xl items-center justify-center bg-gray-50">
                                        <Ionicons name="people" size={20} color="#4B5563" />
                                    </View>
                                    <Text className="text-base font-bold text-gray-900">{t.member_mgmt}</Text>
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
                                    <Ionicons name="chevron-forward" size={18} color="#E5E7EB" />
                                </View>
                            </TouchableOpacity>
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="share-social"
                                label={language === 'ko' ? "초대하기" : "Invite Mates"}
                                value={localInviteCode}
                                onPress={onShareInvite}
                            />
                        </View>
                    </View>

                    {/* Group 2: App Preferences */}
                    <View>
                        <Text className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">{t.account_section}</Text>
                        <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                            <SettingItem
                                icon="notifications"
                                label={t.notifications}
                                value="On"
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="globe"
                                label={language === 'ko' ? "언어 설정" : "Language"}
                                value={language === 'ko' ? "한국어" : "English"}
                                onPress={toggleLanguage}
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="color-palette"
                                label={language === 'ko' ? "앱 테마" : "App Theme"}
                                value={appMode === 'roommatecheck' ? "Toss Style" : "MateCheck"}
                                onPress={() => {
                                    const next = appMode === 'roommatecheck' ? 'matecheck' : 'roommatecheck';
                                    setAppMode(next);
                                    Alert.alert(next === 'roommatecheck' ? '🏦 Toss Mode' : '🏠 MateCheck Mode', language === 'ko' ? '디자인 테마가 변경되었습니다.' : 'Theme changed successfully.');
                                }}
                            />
                        </View>
                    </View>

                    {/* Group 3: Support */}
                    <View>
                        <Text className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">Help & Support</Text>
                        <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                            <SettingItem
                                icon="megaphone"
                                label={language === 'ko' ? "공지사항" : "Announcements"}
                                onPress={() => router.push('/announcements')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="chatbubble-ellipses"
                                label={language === 'ko' ? "문의하기" : "Contact Us"}
                                onPress={() => router.push('/support')}
                            />
                        </View>
                    </View>

                    <View className="items-center py-4">
                        <Text className="text-gray-300 text-xs font-bold">MateCheck v1.0.0</Text>
                    </View>

                </View>
            </ScrollView>

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
