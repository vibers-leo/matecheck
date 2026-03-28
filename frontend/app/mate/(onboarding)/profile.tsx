import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { API_URL } from '../../../constants/Config';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../../components/Avatar';
import { Language, translations } from '../../../constants/I18n';

/* 온보딩 진행 표시기 컴포넌트 */
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

export default function ProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setProfile, userEmail, language } = useUserStore();
    const t = translations[language as Language].onboarding;

    const [nickname, setLocalNickname] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(0);

    const handleNext = async () => {
        if (!nickname.trim()) return;

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    user: {
                        nickname: nickname,
                        avatar_id: selectedAvatarId
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setProfile(nickname, selectedAvatarId, String(data.id));
                router.push('/(onboarding)/nest_choice');
            } else {
                Alert.alert("오류", data.error || "문제가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "서버 연결에 실패했습니다.");
        }
    };

    return (
        <View className="flex-1 bg-white pt-12 px-5">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                {/* 진행 표시기 */}
                <StepIndicator current={1} total={3} />

                {/* Eyebrow + 제목 */}
                <Text className="eyebrow text-primary mb-2">{t.step1}</Text>
                <Text className="text-heading-2 text-gray-900 mb-2 leading-snug tracking-tight">
                    {t.profile_title}
                </Text>
                <Text className="caption mb-8">{t.avatar_hint}</Text>

                {/* 아바타 카드 */}
                <View className="card-mobile items-center mb-6">
                    <TouchableOpacity
                        onPress={() => setSelectedAvatarId((selectedAvatarId + 1) % AVATARS.length)}
                        className="relative"
                    >
                        <Avatar
                            source={(AVATARS[selectedAvatarId] || AVATARS[0]).image}
                            size="xl"
                            borderColor="#E5E7EB"
                            borderWidth={2}
                        />
                        <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-gray-100 shadow-card">
                            <Ionicons name="refresh" size={16} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                    <Text className="caption mt-3">탭하여 변경</Text>
                </View>

                {/* 닉네임 입력 */}
                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">{t.nickname_label}</Text>
                <TextInput
                    value={nickname}
                    onChangeText={setLocalNickname}
                    placeholder={t.nickname_placeholder}
                    placeholderTextColor="#D1D5DB"
                    className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body"
                    autoFocus
                />
            </Animated.View>

            {/* 하단 고정 CTA */}
            <View className="flex-1 justify-end pb-10">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!nickname.trim()}
                    className={cn(
                        "btn-primary w-full",
                        nickname.trim() ? "bg-primary" : "bg-gray-100"
                    )}
                >
                    <Text className={cn("font-semibold text-base", nickname.trim() ? "text-white" : "text-gray-400")}>
                        {t.next_button}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
