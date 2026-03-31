import { View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { API_URL } from '../../../constants/Config';
import { getAuthToken } from '../../../services/api';
import { translations } from '../../../constants/I18n';
import { AVATARS, NEST_AVATARS } from '../../../constants/data';
import { Ionicons } from '@expo/vector-icons';
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

export default function CreateNestScreen() {
    const router = useRouter();
    const { setNest, setMembers, nickname, avatarId, nestAvatarId, userEmail, language, setProfile } = useUserStore();
    const t = (translations[language as keyof typeof translations] as any).onboarding;

    const [name, setName] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            // Authorization 헤더 포함
            const token = getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/nests`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: userEmail,
                    nest: { name: name, theme_id: 0, avatar_id: nestAvatarId },
                    user: {
                        nickname: nickname || userEmail.split('@')[0],
                        avatar_id: avatarId || 0
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setNest(data.name, data.theme_id, data.invite_code, data.id.toString(), '', data.avatar_id, true);

                // 멤버 정보 설정
                if (data.members) {
                    setMembers(data.members.map((m: any) => ({
                        id: String(m.id),
                        nickname: m.nickname,
                        avatarId: m.avatar_id || 0,
                        role: m.role || 'mate',
                        memberType: m.member_type,
                    })));
                }

                router.replace('/(tabs)/home');
            } else {
                Alert.alert("오류", data.errors?.join(', ') || data.error || "보금자리 생성에 실패했습니다.");
            }
        } catch (error) {
            console.error('보금자리 생성 오류:', error);
            Alert.alert("네트워크 오류", "서버 연결에 실패했습니다.\n네트워크 연결을 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white pt-12 px-5">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                {/* 진행 표시기 */}
                <StepIndicator current={3} total={3} />

                {/* Eyebrow + 제목 */}
                <Text className="eyebrow text-primary mb-2">{t.step3}</Text>
                <Text className="text-heading-2 text-gray-900 tracking-tight leading-snug mb-2">
                    {t.create_title}
                </Text>
                <Text className="caption mb-6">보금자리의 이름과 프로필을 설정하세요</Text>

                {/* 아바타 카드 */}
                <View className="card-mobile items-center mb-6">
                    <TouchableOpacity
                        onPress={() => setPickerVisible(true)}
                        className="items-center relative"
                        disabled={isLoading}
                    >
                        <Image
                            source={(NEST_AVATARS.find(a => a.id === nestAvatarId) || NEST_AVATARS[0]).image}
                            className="w-20 h-20 rounded-full border-2 border-gray-100 bg-gray-50"
                            resizeMode="contain"
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
                    onSelect={(id) => useUserStore.setState({ nestAvatarId: id })}
                    selectedId={nestAvatarId}
                    avatars={NEST_AVATARS}
                />

                {/* 보금자리 이름 입력 */}
                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">{t.nest_name_label}</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t.nest_name_placeholder}
                    placeholderTextColor="#D1D5DB"
                    className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body"
                    autoFocus
                    editable={!isLoading}
                    maxLength={30}
                />
                {name.length > 0 && (
                    <Text className="text-xs text-gray-400 mt-1 ml-1">{name.length}/30자</Text>
                )}
            </Animated.View>

            {/* 하단 고정 CTA */}
            <View className="flex-1 justify-end pb-10">
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!name.trim() || isLoading}
                    className={cn(
                        "btn-primary w-full",
                        name.trim() && !isLoading ? "bg-primary" : "bg-gray-100"
                    )}
                >
                    {isLoading ? (
                        <View className="flex-row items-center gap-2">
                            <ActivityIndicator size="small" color="white" />
                            <Text className="text-white font-semibold text-base">생성 중...</Text>
                        </View>
                    ) : (
                        <Text className={cn("font-semibold text-base", name.trim() ? "text-white" : "text-gray-400")}>
                            {t.start_btn}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
