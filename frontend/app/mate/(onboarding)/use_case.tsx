import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { NEST_TYPE_META, NestType } from '../../../constants/NestTypeDefaults';
import { cn } from '../../../lib/utils';

const TYPES: NestType[] = ['dormitory', 'couple', 'family'];

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

export default function UseCaseScreen() {
    const router = useRouter();
    const { setNestType } = useUserStore();
    const [selected, setSelected] = useState<NestType | null>(null);

    const handleNext = () => {
        if (!selected) return;
        setNestType(selected);
        router.push('/(onboarding)/nest_choice');
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-5">
            <Stack.Screen options={{ headerShown: false }} />

            <Animated.View entering={FadeInDown.duration(600)} className="pt-10">
                {/* 진행 표시기 */}
                <StepIndicator current={1} total={3} />

                {/* Eyebrow + 제목 */}
                <Text className="eyebrow text-primary mb-2">NEST TYPE</Text>
                <Text className="text-heading-1 text-gray-900 tracking-tight leading-snug mb-1">
                    어떤 보금자리인가요?
                </Text>
                <Text className="text-body text-gray-400">
                    선택한 유형에 맞는 맞춤 기능을 제공해드려요
                </Text>
            </Animated.View>

            {/* 유형 선택 카드 */}
            <View className="flex-1 justify-center gap-3">
                {TYPES.map((type, idx) => {
                    const meta = NEST_TYPE_META[type];
                    const isSelected = selected === type;

                    return (
                        <Animated.View
                            key={type}
                            entering={FadeInUp.delay(200 + idx * 100).duration(500)}
                        >
                            <TouchableOpacity
                                onPress={() => setSelected(type)}
                                className={cn(
                                    "card-mobile flex-row items-center",
                                    isSelected && "border-2 border-primary"
                                )}
                                activeOpacity={0.85}
                            >
                                {/* 선택 인디케이터 */}
                                <View className={cn(
                                    "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                                    isSelected ? "bg-primary border-primary" : "border-gray-300"
                                )}>
                                    {isSelected && (
                                        <Text className="text-white text-[10px] font-bold">✓</Text>
                                    )}
                                </View>

                                {/* 아이콘 */}
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    style={{ backgroundColor: meta.color + '18' }}
                                >
                                    <Text className="text-2xl">{meta.emoji}</Text>
                                </View>

                                {/* 내용 */}
                                <View className="flex-1">
                                    <Text className="section-header text-gray-900 mb-0.5">{meta.title}</Text>
                                    <Text className="text-xs text-gray-500">{meta.subtitle}</Text>
                                    <Text className="caption mt-1">{meta.description}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            {/* 하단 고정 CTA */}
            <Animated.View entering={FadeInUp.delay(600).duration(500)} className="pb-8 gap-3">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!selected}
                    className={cn(
                        "btn-primary w-full",
                        selected ? "bg-primary" : "bg-gray-200"
                    )}
                >
                    <Text className={cn(
                        "font-semibold text-base",
                        selected ? "text-white" : "text-gray-400"
                    )}>
                        {selected ? `${NEST_TYPE_META[selected].title} 선택하기` : '유형을 선택해주세요'}
                    </Text>
                </TouchableOpacity>

                <Text className="caption text-center">나중에 설정에서 언제든지 변경할 수 있어요</Text>
            </Animated.View>
        </SafeAreaView>
    );
}
