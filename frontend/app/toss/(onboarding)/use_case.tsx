import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_RADIUS, TDS_ELEVATION } from '../../../constants/DesignTokens';
import { NEST_TYPE_META, NestType } from '../../../constants/NestTypeDefaults';

const { height } = Dimensions.get('window');

const TYPES: NestType[] = ['dormitory', 'couple', 'family'];

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
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                <Text style={styles.title}>어떤 보금자리인가요?</Text>
                <Text style={styles.subtitle}>
                    선택한 유형에 맞는{'\n'}맞춤 기능을 제공해드려요
                </Text>
            </Animated.View>

            <View style={styles.cardsContainer}>
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
                                style={[
                                    styles.card,
                                    isSelected && { borderColor: meta.color, borderWidth: 2.5 },
                                ]}
                                activeOpacity={0.85}
                            >
                                {/* 선택 인디케이터 */}
                                <View style={[
                                    styles.selectCircle,
                                    isSelected && { backgroundColor: meta.color, borderColor: meta.color },
                                ]}>
                                    {isSelected && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </View>

                                {/* 아이콘 + 내용 */}
                                <View style={[styles.iconBox, { backgroundColor: meta.color + '18' }]}>
                                    <Text style={styles.emoji}>{meta.emoji}</Text>
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{meta.title}</Text>
                                    <Text style={styles.cardSubtitle}>{meta.subtitle}</Text>
                                    <Text style={styles.cardDesc}>{meta.description}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.bottom}>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
                    disabled={!selected}
                >
                    <Text style={styles.nextBtnText}>
                        {selected ? `${NEST_TYPE_META[selected].title} 선택하기` : '유형을 선택해주세요'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.hint}>나중에 설정에서 언제든지 변경할 수 있어요</Text>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: TDS_COLORS.white,
        paddingHorizontal: 24,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 24,
    },
    title: {
        ...TDS_TYPOGRAPHY.display2,
        color: TDS_COLORS.grey900,
        marginBottom: 8,
    },
    subtitle: {
        ...TDS_TYPOGRAPHY.body1,
        color: TDS_COLORS.grey500,
        lineHeight: 22,
    },

    cardsContainer: {
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TDS_COLORS.white,
        borderRadius: TDS_RADIUS.xl,
        padding: 20,
        borderWidth: 1.5,
        borderColor: TDS_COLORS.grey200,
        ...TDS_ELEVATION.card,
    },

    selectCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: TDS_COLORS.grey300,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        flexShrink: 0,
    },
    checkMark: {
        color: TDS_COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },

    iconBox: {
        width: 52,
        height: 52,
        borderRadius: TDS_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        flexShrink: 0,
    },
    emoji: {
        fontSize: 28,
    },

    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...TDS_TYPOGRAPHY.h3,
        color: TDS_COLORS.grey900,
        marginBottom: 2,
    },
    cardSubtitle: {
        ...TDS_TYPOGRAPHY.caption1,
        color: TDS_COLORS.grey600,
        marginBottom: 4,
    },
    cardDesc: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.grey400,
        lineHeight: 16,
    },

    bottom: {
        paddingBottom: 32,
        gap: 12,
    },
    nextBtn: {
        backgroundColor: TDS_COLORS.blue,
        borderRadius: TDS_RADIUS.lg,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextBtnDisabled: {
        backgroundColor: TDS_COLORS.grey300,
    },
    nextBtnText: {
        ...TDS_TYPOGRAPHY.h3,
        color: TDS_COLORS.white,
    },
    hint: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.grey400,
        textAlign: 'center',
    },
});
