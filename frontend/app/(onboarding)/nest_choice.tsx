import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { translations } from '../../constants/I18n';
import { useUserStore } from '../../store/userStore';

export default function NestChoiceScreen() {
    const router = useRouter();
    const { language } = useUserStore();
    const t = translations[language].onboarding;

    return (
        <View className="flex-1 bg-white pt-12 px-6">
            <Animated.View entering={FadeInUp.delay(300).springify()}>
                <Text className="text-gray-400 font-medium mb-1 text-sm">{t.step2}</Text>
                <Text className="text-2xl font-bold text-gray-800 mb-10 leading-9">
                    {t.choice_title}
                </Text>

                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/create_nest')}
                    className="w-full bg-white border border-gray-100 p-8 rounded-3xl mb-4 shadow-sm active:bg-gray-50"
                >
                    <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center mb-5">
                        <Text className="text-3xl">🪐</Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-800 mb-2">{t.create_nest_btn}</Text>
                    <Text className="text-gray-500 leading-6">
                        {t.create_nest_desc}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/join_nest')}
                    className="w-full bg-white border border-gray-100 p-8 rounded-3xl shadow-sm active:bg-gray-50"
                >
                    <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-5">
                        <Text className="text-3xl">📩</Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-800 mb-2">{t.join_nest_btn}</Text>
                    <Text className="text-gray-500 leading-6">
                        {t.join_nest_desc}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
