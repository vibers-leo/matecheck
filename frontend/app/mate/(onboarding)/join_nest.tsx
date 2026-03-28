import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../../constants/Config';
import { translations } from '../../../constants/I18n';
import { AVATARS } from '../../../constants/data';
import AvatarPicker from '../../../components/AvatarPicker';

/* 온보딩 진행 표시기 */
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <View className="flex-row gap-2 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    className={cn(
                        "h-1 rounded-full flex-1",
                        i < current ? "bg-primary" : "bg-gray-100"
                    )}
                />
            ))}
        </View>
    );
}

export default function JoinNestScreen() {
    const router = useRouter();
    const { userEmail, language, nickname, avatarId, setProfile } = useUserStore();
    const t = translations[language].onboarding;

    const params = useLocalSearchParams();
    const [inviteCode, setInviteCode] = useState(typeof params.code === 'string' ? params.code : '');
    const [isWaiting, setIsWaiting] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    const handleJoinRequest = async () => {
        if (!inviteCode.trim()) return;

        try {
            const response = await fetch(`${API_URL}/nests/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    invite_code: inviteCode,
                    user: {
                        nickname: nickname || userEmail.split('@')[0],
                        avatar_id: avatarId || 0
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsWaiting(true);
            } else {
                Alert.alert("오류", data.error || "잘못된 초대코드입니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "서버 연결에 실패했습니다.");
        }
    };

    /* 승인 대기 화면 */
    if (isWaiting) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-5">
                <Animated.View entering={FadeInDown.springify()} className="items-center w-full">
                    <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                        <Ionicons name="mail-unread-outline" size={40} color="#FF7F50" />
                    </View>
                    <Text className="text-heading-1 text-gray-900 tracking-tight text-center mb-3">
                        {t.waiting_title}
                    </Text>
                    <Text className="text-body text-gray-400 text-center leading-relaxed mb-10">
                        {t.waiting_desc}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/')}
                        className="btn-primary w-full bg-gray-900"
                    >
                        <Text className="text-white font-semibold text-base">{t.back_to_main}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white pt-12 px-5">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                {/* 진행 표시기 */}
                <StepIndicator current={3} total={3} />

                {/* Eyebrow + 제목 */}
                <Text className="eyebrow text-primary mb-2">{t.step3}</Text>
                <Text className="text-heading-2 text-gray-900 tracking-tight leading-snug mb-2">
                    {t.join_title}
                </Text>
                <Text className="caption mb-6">초대코드를 입력하고 보금자리에 참여하세요</Text>

                {/* 아바타 카드 */}
                <View className="card-mobile items-center mb-6">
                    <TouchableOpacity
                        onPress={() => setPickerVisible(true)}
                        className="items-center relative"
                    >
                        <Image
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            className="w-20 h-20 rounded-full border-2 border-gray-100 bg-gray-50"
                        />
                        <View className="absolute bottom-0 right-0 bg-gray-900 p-1.5 rounded-full border-2 border-white">
                            <Ionicons name="camera" size={12} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="caption mt-3">프로필 사진 변경</Text>
                </View>

                <AvatarPicker
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={(id) => setProfile(nickname, id)}
                    selectedId={avatarId}
                />

                {/* 초대코드 입력 */}
                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">{t.invite_code_label}</Text>
                <TextInput
                    value={inviteCode}
                    onChangeText={(text) => setInviteCode(text.toUpperCase())}
                    placeholder={t.invite_code_placeholder}
                    placeholderTextColor="#D1D5DB"
                    className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body mb-2"
                    autoFocus
                />
                <Text className="caption ml-1">
                    {t.invite_hint}
                </Text>
            </Animated.View>

            {/* 하단 고정 CTA */}
            <View className="flex-1 justify-end pb-10">
                <TouchableOpacity
                    onPress={handleJoinRequest}
                    disabled={!inviteCode.trim()}
                    className={cn(
                        "btn-primary w-full",
                        inviteCode.trim() ? "bg-primary" : "bg-gray-100"
                    )}
                >
                    <Text className={cn("font-semibold text-base", inviteCode.trim() ? "text-white" : "text-gray-400")}>
                        {t.join_request_btn}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
