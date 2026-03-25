import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';
import { translations } from '../../constants/I18n';
import { AVATARS } from '../../constants/data';
import AvatarPicker from '../../components/AvatarPicker';

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
                Alert.alert("Error", data.error || "Invalid invite code.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server connection failed.");
        }
    };

    if (isWaiting) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-10">
                <Animated.View entering={FadeInDown.springify()} className="items-center">
                    <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-8">
                        <Ionicons name="mail-unread-outline" size={48} color="#F97316" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 mb-4 text-center">
                        {t.waiting_title}
                    </Text>
                    <Text className="text-gray-500 text-center leading-7 text-lg mb-12">
                        {t.waiting_desc}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/')}
                        className="w-full py-5 bg-gray-900 rounded-2xl items-center shadow-lg"
                    >
                        <Text className="text-white font-bold text-lg">{t.back_to_main}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white pt-12 px-6">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text className="text-gray-400 font-medium mb-1 text-sm">{t.step3}</Text>
                <Text className="text-2xl font-bold text-gray-800 mb-8 leading-9">
                    {t.join_title}
                </Text>

                <View className="items-center mb-10">
                    <TouchableOpacity
                        onPress={() => setPickerVisible(true)}
                        className="items-center relative"
                    >
                        <Image
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-gray-50"
                        />
                        <View className="absolute bottom-0 right-0 bg-gray-900 p-2 rounded-full border-2 border-white">
                            <Ionicons name="camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-gray-400 text-xs mt-3">프로필 사진 변경</Text>
                </View>

                <AvatarPicker
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={(id) => setProfile(nickname, id)}
                    selectedId={avatarId}
                />

                <Text className="text-base font-semibold text-gray-700 mb-3 ml-1">{t.invite_code_label}</Text>
                <TextInput
                    value={inviteCode}
                    onChangeText={(text) => setInviteCode(text.toUpperCase())}
                    placeholder={t.invite_code_placeholder}
                    placeholderTextColor="#E2E8F0"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-gray-800 text-lg mb-4 focus:border-orange-200"
                    autoFocus
                />
                <Text className="text-gray-400 text-xs ml-1">
                    {t.invite_hint}
                </Text>
            </Animated.View>

            <View className="flex-1 justify-end pb-12">
                <TouchableOpacity
                    onPress={handleJoinRequest}
                    disabled={!inviteCode.trim()}
                    className={cn(
                        "w-full py-5 rounded-2xl items-center",
                        inviteCode.trim() ? "bg-orange-500 shadow-lg shadow-orange-100" : "bg-gray-100"
                    )}
                >
                    <Text className={cn("font-bold text-lg", inviteCode.trim() ? "text-white" : "text-gray-400")}>{t.join_request_btn}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
