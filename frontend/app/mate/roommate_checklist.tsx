import React, { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Share,
    StyleSheet, Dimensions, Alert, Image,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_RADIUS, TDS_ELEVATION } from '../../constants/DesignTokens';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// 22개 체크리스트 항목 (강원대 기사 기반)
// ─────────────────────────────────────────────
interface ChecklistItem {
    id: number;
    category: string;
    categoryEmoji: string;
    question: string;
    options: { label: string; emoji: string }[];
}

const CHECKLIST: ChecklistItem[] = [
    // 🌙 수면 패턴 (4)
    {
        id: 1, category: '수면 패턴', categoryEmoji: '🌙',
        question: '보통 몇 시에 자나요?',
        options: [
            { label: '10~11시', emoji: '🌛' },
            { label: '11~12시', emoji: '😴' },
            { label: '12~1시', emoji: '🦉' },
            { label: '1시 이후', emoji: '🌃' },
        ],
    },
    {
        id: 2, category: '수면 패턴', categoryEmoji: '🌙',
        question: '보통 몇 시에 일어나나요?',
        options: [
            { label: '6~7시', emoji: '🐓' },
            { label: '7~8시', emoji: '☀️' },
            { label: '8~9시', emoji: '🌤️' },
            { label: '9시 이후', emoji: '😪' },
        ],
    },
    {
        id: 3, category: '수면 패턴', categoryEmoji: '🌙',
        question: '낮잠을 자나요?',
        options: [
            { label: '매일 잠', emoji: '😴' },
            { label: '가끔', emoji: '🛋️' },
            { label: '거의 안 잠', emoji: '💪' },
            { label: '절대 안 잠', emoji: '🙅' },
        ],
    },
    {
        id: 4, category: '수면 패턴', categoryEmoji: '🌙',
        question: '잠버릇이 있나요?',
        options: [
            { label: '없음', emoji: '✨' },
            { label: '코골이', emoji: '🐻' },
            { label: '이갈이', emoji: '😬' },
            { label: '잠꼬대', emoji: '💬' },
        ],
    },

    // 🧹 청결 & 정리 (4)
    {
        id: 5, category: '청결 & 정리', categoryEmoji: '🧹',
        question: '청소는 얼마나 자주 하나요?',
        options: [
            { label: '매일', emoji: '✨' },
            { label: '2~3일에 한 번', emoji: '🧽' },
            { label: '주 1회', emoji: '📅' },
            { label: '한 달에 한 번', emoji: '😅' },
        ],
    },
    {
        id: 6, category: '청결 & 정리', categoryEmoji: '🧹',
        question: '평소 정리정돈 수준은?',
        options: [
            { label: '매우 깔끔', emoji: '💎' },
            { label: '보통', emoji: '👍' },
            { label: '약간 어수선', emoji: '🌀' },
            { label: '자유분방', emoji: '🎨' },
        ],
    },
    {
        id: 7, category: '청결 & 정리', categoryEmoji: '🧹',
        question: '욕실은 주로 언제 사용하나요?',
        options: [
            { label: '아침 샤워', emoji: '🌅' },
            { label: '저녁 샤워', emoji: '🌆' },
            { label: '아침 + 저녁', emoji: '🔄' },
            { label: '상관없음', emoji: '🤷' },
        ],
    },
    {
        id: 8, category: '청결 & 정리', categoryEmoji: '🧹',
        question: '설거지는 언제 하나요?',
        options: [
            { label: '먹자마자 바로', emoji: '⚡' },
            { label: '당일 안에', emoji: '🕐' },
            { label: '2~3일 안에', emoji: '📦' },
            { label: '모아서 한 번에', emoji: '🏔️' },
        ],
    },

    // 🔊 소음 & 생활 (4)
    {
        id: 9, category: '소음 & 생활', categoryEmoji: '🔊',
        question: '음악이나 영상은 어떻게 보나요?',
        options: [
            { label: '항상 이어폰', emoji: '🎧' },
            { label: '가끔 스피커', emoji: '📢' },
            { label: '자주 스피커', emoji: '🔊' },
            { label: '상관없음', emoji: '🎶' },
        ],
    },
    {
        id: 10, category: '소음 & 생활', categoryEmoji: '🔊',
        question: '잘 때 방 밝기는?',
        options: [
            { label: '완전 암실 필요', emoji: '⬛' },
            { label: '약한 빛은 괜찮', emoji: '🌙' },
            { label: '보통 조명도 OK', emoji: '💡' },
            { label: '상관없음', emoji: '🤷' },
        ],
    },
    {
        id: 11, category: '소음 & 생활', categoryEmoji: '🔊',
        question: '통화를 얼마나 자주 하나요?',
        options: [
            { label: '거의 안 함', emoji: '🔕' },
            { label: '짧게 가끔', emoji: '📱' },
            { label: '자주 함', emoji: '☎️' },
            { label: '장시간 자주', emoji: '🗣️' },
        ],
    },
    {
        id: 12, category: '소음 & 생활', categoryEmoji: '🔊',
        question: '주로 어디서 공부하나요?',
        options: [
            { label: '도서관', emoji: '📚' },
            { label: '카페', emoji: '☕' },
            { label: '방에서', emoji: '🏠' },
            { label: '그때그때 달라', emoji: '🌀' },
        ],
    },

    // 👥 손님 & 관계 (3)
    {
        id: 13, category: '손님 & 관계', categoryEmoji: '👥',
        question: '친구를 방에 초대하나요?',
        options: [
            { label: '절대 안 함', emoji: '🚫' },
            { label: '아주 가끔', emoji: '🎉' },
            { label: '가끔', emoji: '😊' },
            { label: '자주', emoji: '🏠' },
        ],
    },
    {
        id: 14, category: '손님 & 관계', categoryEmoji: '👥',
        question: '이성 친구의 방 방문은?',
        options: [
            { label: '절대 안 됨', emoji: '⛔' },
            { label: '낮 시간만', emoji: '☀️' },
            { label: '협의하에 가능', emoji: '🤝' },
            { label: '상관없음', emoji: '✅' },
        ],
    },
    {
        id: 15, category: '손님 & 관계', categoryEmoji: '👥',
        question: '반려동물에 대해?',
        options: [
            { label: '알레르기 있음', emoji: '🤧' },
            { label: '싫음', emoji: '😰' },
            { label: '상관없음', emoji: '🤷' },
            { label: '좋아함', emoji: '🐾' },
        ],
    },

    // 🍜 식생활 & 기호 (4)
    {
        id: 16, category: '식생활 & 기호', categoryEmoji: '🍜',
        question: '방에서 음식을 먹나요?',
        options: [
            { label: '절대 안 먹음', emoji: '🙅' },
            { label: '간식만', emoji: '🍪' },
            { label: '배달 자주', emoji: '🛵' },
            { label: '요리도 함', emoji: '👨‍🍳' },
        ],
    },
    {
        id: 17, category: '식생활 & 기호', categoryEmoji: '🍜',
        question: '냉장고 공유는?',
        options: [
            { label: '따로 쓰고 싶음', emoji: '📦' },
            { label: '공간 구분해서', emoji: '📐' },
            { label: '자유롭게 공유', emoji: '🤝' },
            { label: '없어도 됨', emoji: '🤷' },
        ],
    },
    {
        id: 18, category: '식생활 & 기호', categoryEmoji: '🍜',
        question: '흡연 여부는?',
        options: [
            { label: '비흡연', emoji: '🌿' },
            { label: '전자담배 (실외)', emoji: '💨' },
            { label: '흡연 (실외)', emoji: '🚬' },
            { label: '흡연 (실내 가능)', emoji: '🏠' },
        ],
    },
    {
        id: 19, category: '식생활 & 기호', categoryEmoji: '🍜',
        question: '음주는 얼마나?',
        options: [
            { label: '안 마심', emoji: '🥤' },
            { label: '가끔 (특별한 날)', emoji: '🍷' },
            { label: '주 1~2회', emoji: '🍺' },
            { label: '자주', emoji: '🥂' },
        ],
    },

    // 🌡️ 환경 & 기타 (3)
    {
        id: 20, category: '환경 & 기타', categoryEmoji: '🌡️',
        question: '방 온도는 어떻게 선호하나요?',
        options: [
            { label: '시원하게 (에어컨 선호)', emoji: '❄️' },
            { label: '보통', emoji: '🌤️' },
            { label: '따뜻하게 (히터 선호)', emoji: '🔥' },
            { label: '상관없음', emoji: '🤷' },
        ],
    },
    {
        id: 21, category: '환경 & 기타', categoryEmoji: '🌡️',
        question: '환기는 얼마나 자주 하나요?',
        options: [
            { label: '매일 아침', emoji: '🌬️' },
            { label: '가끔', emoji: '🪟' },
            { label: '거의 안 함', emoji: '😶' },
            { label: '상관없음', emoji: '🤷' },
        ],
    },
    {
        id: 22, category: '환경 & 기타', categoryEmoji: '🌡️',
        question: '개인 물건 공유는?',
        options: [
            { label: '절대 안 됨', emoji: '🔒' },
            { label: '먼저 물어보면 가능', emoji: '🙋' },
            { label: '자유롭게 공유', emoji: '🤝' },
            { label: '상관없음', emoji: '✅' },
        ],
    },
];

const CATEGORIES = ['수면 패턴', '청결 & 정리', '소음 & 생활', '손님 & 관계', '식생활 & 기호', '환경 & 기타'];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function RoommateChecklistScreen() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<number, number>>({}); // itemId → optionIndex
    const [showResult, setShowResult] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(0);

    const currentItems = CHECKLIST.filter(item => item.category === CATEGORIES[currentCategory]);
    const answeredInCurrent = currentItems.filter(item => answers[item.id] !== undefined).length;
    const totalAnswered = Object.keys(answers).length;
    const progress = totalAnswered / CHECKLIST.length;
    const allDone = totalAnswered === CHECKLIST.length;

    const handleSelect = useCallback((itemId: number, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [itemId]: optionIdx }));
    }, []);

    const handleNext = () => {
        if (answeredInCurrent < currentItems.length) {
            Alert.alert('미완성', `${currentItems.length - answeredInCurrent}개 항목을 더 선택해주세요.`);
            return;
        }
        if (currentCategory < CATEGORIES.length - 1) {
            setCurrentCategory(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const handleBack = () => {
        if (currentCategory > 0) {
            setCurrentCategory(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const buildShareText = () => {
        let text = '🏠 룸메이트 체크리스트 - MateCheck\n';
        text += '─────────────────\n';
        CATEGORIES.forEach(cat => {
            const catItems = CHECKLIST.filter(i => i.category === cat);
            const catEmoji = catItems[0]?.categoryEmoji || '';
            text += `\n${catEmoji} ${cat}\n`;
            catItems.forEach(item => {
                const answerIdx = answers[item.id];
                const opt = item.options[answerIdx];
                if (opt) {
                    text += `  ${item.question}\n  → ${opt.emoji} ${opt.label}\n`;
                }
            });
        });
        text += '\n─────────────────\n';
        text += '📱 MateCheck으로 룸메이트 찾기: matecheck.app';
        return text;
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: buildShareText() });
        } catch (error) {
            Alert.alert('공유 실패', '다시 시도해주세요.');
        }
    };

    if (showResult) {
        return <ResultScreen answers={answers} onShare={handleShare} onBack={() => router.back()} />;
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={TDS_COLORS.grey800} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>룸메이트 체크리스트</Text>
                <Text style={styles.headerCount}>{totalAnswered}/{CHECKLIST.length}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBg}>
                <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catTabsScroll}
                contentContainerStyle={styles.catTabsContent}
            >
                {CATEGORIES.map((cat, idx) => {
                    const catItems = CHECKLIST.filter(i => i.category === cat);
                    const catAnswered = catItems.filter(i => answers[i.id] !== undefined).length;
                    const done = catAnswered === catItems.length;
                    const active = idx === currentCategory;
                    const emoji = catItems[0]?.categoryEmoji || '';
                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCurrentCategory(idx)}
                            style={[styles.catTab, active && styles.catTabActive]}
                        >
                            <Text style={[styles.catTabText, active && styles.catTabTextActive]}>
                                {done ? '✅' : emoji} {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Questions */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(400)}>
                    <Text style={styles.categoryTitle}>
                        {CHECKLIST.find(i => i.category === CATEGORIES[currentCategory])?.categoryEmoji} {CATEGORIES[currentCategory]}
                    </Text>
                    <Text style={styles.categorySubtitle}>
                        {answeredInCurrent}/{currentItems.length} 완료
                    </Text>

                    {currentItems.map((item, itemIdx) => (
                        <View key={item.id} style={styles.questionCard}>
                            <Text style={styles.questionNum}>Q{item.id}</Text>
                            <Text style={styles.questionText}>{item.question}</Text>
                            <View style={styles.optionsGrid}>
                                {item.options.map((opt, optIdx) => {
                                    const selected = answers[item.id] === optIdx;
                                    return (
                                        <TouchableOpacity
                                            key={optIdx}
                                            onPress={() => handleSelect(item.id, optIdx)}
                                            style={[styles.optionBtn, selected && styles.optionBtnSelected]}
                                        >
                                            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                                            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    <View style={{ height: 100 }} />
                </Animated.View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.nextBtn, answeredInCurrent < currentItems.length && styles.nextBtnDisabled]}
                >
                    <Text style={styles.nextBtnText}>
                        {currentCategory === CATEGORIES.length - 1 ? '결과 보기 🎉' : '다음 항목 →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// Result Screen
// ─────────────────────────────────────────────
function ResultScreen({ answers, onShare, onBack }: {
    answers: Record<number, number>;
    onShare: () => void;
    onBack: () => void;
}) {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={TDS_COLORS.grey800} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>나의 룸메이트 프로필</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(500)}>
                    {/* Hero Card */}
                    <View style={styles.resultHero}>
                        <Text style={styles.resultHeroEmoji}>🏠</Text>
                        <Text style={styles.resultHeroTitle}>체크리스트 완성!</Text>
                        <Text style={styles.resultHeroSubtitle}>
                            22개 항목을 모두 작성했어요.{'\n'}공유 버튼으로 잠재적 룸메이트에게 보내보세요!
                        </Text>
                        <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
                            <Ionicons name="share-social" size={20} color="#fff" />
                            <Text style={styles.shareBtnText}>내 체크리스트 공유하기</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Summary by category */}
                    {CATEGORIES.map(cat => {
                        const catItems = CHECKLIST.filter(i => i.category === cat);
                        const emoji = catItems[0]?.categoryEmoji || '';
                        return (
                            <View key={cat} style={styles.resultCatCard}>
                                <Text style={styles.resultCatTitle}>{emoji} {cat}</Text>
                                {catItems.map(item => {
                                    const ansIdx = answers[item.id];
                                    const opt = item.options[ansIdx];
                                    return (
                                        <View key={item.id} style={styles.resultRow}>
                                            <Text style={styles.resultRowQ} numberOfLines={1}>{item.question}</Text>
                                            <View style={styles.resultRowA}>
                                                <Text style={styles.resultRowEmoji}>{opt?.emoji}</Text>
                                                <Text style={styles.resultRowLabel}>{opt?.label}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}

                    {/* Article reference */}
                    <View style={styles.articleRef}>
                        <Image
                            source={require('../../assets/everytime-1702144015629.jpg')}
                            style={styles.articleImg}
                            resizeMode="cover"
                        />
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                            <Text style={styles.articleRefTag}>📰 참고 기사</Text>
                            <Text style={styles.articleRefTitle}>
                                새 학기 앞둔 대학생들{'\n'}룸메이트 22개 체크리스트로 구인
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: TDS_COLORS.grey50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 12,
        backgroundColor: TDS_COLORS.white,
        ...TDS_ELEVATION.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TDS_TYPOGRAPHY.h3,
        color: TDS_COLORS.grey900,
    },
    headerCount: {
        ...TDS_TYPOGRAPHY.caption1,
        color: TDS_COLORS.blue,
        width: 40,
        textAlign: 'right',
    },

    // Progress
    progressBg: {
        height: 3,
        backgroundColor: TDS_COLORS.grey200,
    },
    progressFill: {
        height: 3,
        backgroundColor: TDS_COLORS.blue,
    },

    // Category tabs
    catTabsScroll: {
        backgroundColor: TDS_COLORS.white,
        maxHeight: 52,
    },
    catTabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    catTab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: TDS_COLORS.grey100,
    },
    catTabActive: {
        backgroundColor: TDS_COLORS.blue,
    },
    catTabText: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.grey600,
    },
    catTabTextActive: {
        color: TDS_COLORS.white,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: 20 },

    // Category header
    categoryTitle: {
        ...TDS_TYPOGRAPHY.h2,
        color: TDS_COLORS.grey900,
        marginBottom: 4,
    },
    categorySubtitle: {
        ...TDS_TYPOGRAPHY.caption1,
        color: TDS_COLORS.grey500,
        marginBottom: 20,
    },

    // Question card
    questionCard: {
        backgroundColor: TDS_COLORS.white,
        borderRadius: TDS_RADIUS.lg,
        padding: 20,
        marginBottom: 16,
        ...TDS_ELEVATION.sm,
    },
    questionNum: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.blue,
        marginBottom: 6,
    },
    questionText: {
        ...TDS_TYPOGRAPHY.body1,
        color: TDS_COLORS.grey900,
        marginBottom: 16,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionBtn: {
        width: (width - 40 - 40 - 8) / 2,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: TDS_RADIUS.md,
        backgroundColor: TDS_COLORS.grey50,
        borderWidth: 1.5,
        borderColor: TDS_COLORS.grey200,
        alignItems: 'center',
    },
    optionBtnSelected: {
        backgroundColor: TDS_COLORS.blueLight,
        borderColor: TDS_COLORS.blue,
    },
    optionEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    optionLabel: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.grey700,
        textAlign: 'center',
    },
    optionLabelSelected: {
        color: TDS_COLORS.blue,
    },

    // Bottom bar
    bottomBar: {
        padding: 20,
        paddingBottom: 36,
        backgroundColor: TDS_COLORS.white,
        ...TDS_ELEVATION.md,
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

    // Result
    resultHero: {
        backgroundColor: TDS_COLORS.blue,
        borderRadius: TDS_RADIUS.xl,
        padding: 28,
        alignItems: 'center',
        marginBottom: 20,
    },
    resultHeroEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    resultHeroTitle: {
        ...TDS_TYPOGRAPHY.h1,
        color: TDS_COLORS.white,
        marginBottom: 8,
    },
    resultHeroSubtitle: {
        ...TDS_TYPOGRAPHY.body2,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: TDS_RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    shareBtnText: {
        ...TDS_TYPOGRAPHY.body1,
        color: TDS_COLORS.white,
    },

    resultCatCard: {
        backgroundColor: TDS_COLORS.white,
        borderRadius: TDS_RADIUS.lg,
        padding: 20,
        marginBottom: 12,
        ...TDS_ELEVATION.sm,
    },
    resultCatTitle: {
        ...TDS_TYPOGRAPHY.h3,
        color: TDS_COLORS.grey900,
        marginBottom: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: TDS_COLORS.grey100,
    },
    resultRowQ: {
        ...TDS_TYPOGRAPHY.body2,
        color: TDS_COLORS.grey600,
        flex: 1,
        paddingRight: 8,
    },
    resultRowA: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resultRowEmoji: {
        fontSize: 16,
    },
    resultRowLabel: {
        ...TDS_TYPOGRAPHY.caption1,
        color: TDS_COLORS.grey900,
    },

    // Article ref
    articleRef: {
        flexDirection: 'row',
        backgroundColor: TDS_COLORS.white,
        borderRadius: TDS_RADIUS.lg,
        padding: 16,
        marginTop: 8,
        alignItems: 'center',
        ...TDS_ELEVATION.sm,
    },
    articleImg: {
        width: 72,
        height: 72,
        borderRadius: TDS_RADIUS.md,
    },
    articleRefTag: {
        ...TDS_TYPOGRAPHY.caption2,
        color: TDS_COLORS.blue,
        marginBottom: 6,
    },
    articleRefTitle: {
        ...TDS_TYPOGRAPHY.caption1,
        color: TDS_COLORS.grey800,
        lineHeight: 18,
    },
});
