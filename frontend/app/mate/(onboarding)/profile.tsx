import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { API_URL } from '../../../constants/Config';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../../components/Avatar';
import { Language, translations } from '../../../constants/I18n';

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
                Alert.alert("Error", data.error || "Something went wrong.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server connection failed.");
        }
    };

    return (
        <View className="flex-1 bg-white pt-12 px-6">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text className="text-gray-400 font-medium mb-1 text-sm">{t.step1}</Text>
                <Text className="text-2xl font-bold text-gray-800 mb-8 leading-9">
                    {t.profile_title}
                </Text>

                <View className="items-center mb-10">
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
                        <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-gray-100 shadow-md">
                            <Ionicons name="refresh" size={16} color="#666" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-gray-400 text-xs mt-3">{t.avatar_hint}</Text>
                </View>

                <Text className="text-base font-semibold text-gray-700 mb-3 ml-1">{t.nickname_label}</Text>
                <TextInput
                    value={nickname}
                    onChangeText={setLocalNickname}
                    placeholder={t.nickname_placeholder}
                    placeholderTextColor="#E2E8F0"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-gray-800 text-lg focus:border-orange-200"
                    autoFocus
                />
            </Animated.View>

            <View className="flex-1 justify-end pb-12">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!nickname.trim()}
                    className={cn(
                        "w-full py-5 rounded-2xl items-center",
                        nickname.trim() ? "bg-orange-500 shadow-lg shadow-orange-100" : "bg-gray-100"
                    )}
                >
                    <Text className={cn("font-bold text-lg", nickname.trim() ? "text-white" : "text-gray-400")}>{t.next_button}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
