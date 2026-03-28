import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { translations } from '../../../constants/I18n';
import { useUserStore } from '../../../store/userStore';
import { cn } from '../../../lib/utils';

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

export default function NestChoiceScreen() {
    const router = useRouter();
    const { language } = useUserStore();
    const t = translations[language].onboarding;

    return (
        <View className="flex-1 bg-white pt-12 px-5">
            <Animated.View entering={FadeInDown.duration(600).springify()}>
                {/* 진행 표시기 */}
                <StepIndicator current={2} total={3} />

                {/* Eyebrow + 제목 */}
                <Text className="eyebrow text-primary mb-2">{t.step2}</Text>
                <Text className="text-heading-1 text-gray-900 tracking-tight leading-snug mb-2">
                    {t.choice_title}
                </Text>
                <Text className="caption mb-8">보금자리를 직접 만들거나, 초대코드로 참여하세요</Text>
            </Animated.View>

            {/* 선택 카드 */}
            <View className="gap-4">
                <Animated.View entering={FadeInUp.delay(200).duration(500).springify()}>
                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/create_nest')}
                        className="card-mobile active:opacity-90"
                    >
                        <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-2xl">🪐</Text>
                        </View>
                        <Text className="section-header text-gray-900 mb-1">{t.create_nest_btn}</Text>
                        <Text className="text-body text-gray-400 leading-relaxed">
                            {t.create_nest_desc}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(350).duration(500).springify()}>
                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/join_nest')}
                        className="card-mobile active:opacity-90"
                    >
                        <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-2xl">📩</Text>
                        </View>
                        <Text className="section-header text-gray-900 mb-1">{t.join_nest_btn}</Text>
                        <Text className="text-body text-gray-400 leading-relaxed">
                            {t.join_nest_desc}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
