import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Platform, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { NEST_AVATARS, AVATARS } from '../../../constants/data';
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../../constants/I18n';
// Revert to direct imports to avoid barrel file circular dependency issues
import Avatar from '../../../components/Avatar';
import ActivityModal from '../../../components/ActivityModal';
import FloatingActionMenu from '../../../components/FloatingActionMenu';
import TutorialOverlay from '../../../components/TutorialOverlay';
import AdBanner from '../../../components/AdBanner';
import { SkeletonCard, SkeletonList } from '../../../components/Skeleton';
import { Stack } from 'expo-router';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_RADIUS, TDS_SHADOW, TDS_ELEVATION } from '../../../constants/DesignTokens';

// Create Animated TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const {
        nestName, nestAvatarId,
        todos, events, members, language: langFromStore,
        isLoggedIn, hasSeenMasterTutorial, completeMasterTutorial,
        appMode, isLoading, nestType, anniversaries
    } = useUserStore();

    const language = langFromStore as 'ko' | 'en';
    const t = (translations[language] as any).home;
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [showMasterModal, setShowMasterModal] = useState(false);
    const tm = (translations[language] as any).master;

    // D-Day 계산 함수 (useCallback으로 메모이제이션)
    const getDDay = useCallback((dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        const diff = target.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return '오늘';
        if (days < 0) return `D+${Math.abs(days)}`;
        return `D-${days}`;
    }, []);

    // 할 일 필터링 (useMemo로 최적화)
    const incompleteTodos = useMemo(() =>
        todos.filter((t: any) => !t.isCompleted).slice(0, 3),
        [todos]
    );

    // 오늘 날짜 (useMemo로 최적화)
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // 다가오는 이벤트 (useMemo로 최적화)
    const upcomingEvents = useMemo(() =>
        events
            .filter((e: any) => e.date >= todayStr)
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .slice(0, 2),
        [events, todayStr]
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Toss Style Premium Header */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.nestInfo}>
                            <View style={styles.nestIconBox}>
                                <Image
                                    source={(NEST_AVATARS.find((a: any) => a.id === nestAvatarId) || NEST_AVATARS[0]).image}
                                    style={styles.nestIcon}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.nestName}>{nestName}</Text>
                            <Ionicons name="chevron-forward" size={18} color={TDS_COLORS.grey400} />
                        </View>

                        <TouchableOpacity
                            onPress={() => setActivityModalVisible(true)}
                            style={styles.notifButton}
                        >
                            <Ionicons name="notifications" size={24} color={TDS_COLORS.grey400} />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </View>

                    {/* Member Avatars Pill */}
                    <TouchableOpacity style={styles.memberPill}>
                        <View style={styles.avatarStack}>
                            {members.slice(0, 3).map((m: any, i: number) => (
                                <Avatar
                                    key={m.id}
                                    source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                    size="xs"
                                    borderColor="#FFFFFF"
                                    borderWidth={1.5}
                                />
                            ))}
                        </View>
                        <Text style={styles.memberText}>
                            {members.length}명의 메이트가 함께해요
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Main Cards Section */}
                <View style={styles.cardContainer}>

                    {/* Loading State */}
                    {(isLoading.todos || isLoading.events) ? (
                        <>
                            <SkeletonCard style={{ marginBottom: 16, backgroundColor: TDS_COLORS.blue }} />
                            <SkeletonCard style={{ marginBottom: 16 }} />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            {/* 1. Daily Briefing Premium Card */}
                            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.briefingCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardLabel}>데일리 브리핑</Text>
                            <Text style={styles.cardMainTitle}>오늘 기분 좋게,{'\n'}함께 시작해볼까요?</Text>
                        </View>

                        <View style={styles.briefingContent}>
                            {upcomingEvents.length > 0 ? (
                                <TouchableOpacity style={styles.briefingItem}>
                                    <View style={styles.briefingIconBox}>
                                        <Text style={{ fontSize: 20 }}>📅</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.briefingItemLabel}>D-{getDDay(upcomingEvents[0].date).replace('D-', '')} 일정</Text>
                                        <Text style={styles.briefingItemTitle}>{upcomingEvents[0].title}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={TDS_COLORS.grey400} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.briefingItem}>
                                    <View style={[styles.briefingIconBox, { backgroundColor: '#E7F5E9' }]}>
                                        <Text style={{ fontSize: 20 }}>🌿</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.briefingItemLabel}>평온한 하루</Text>
                                        <Text style={styles.briefingItemTitle}>아직 등록된 일정이 없어요</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {/* 2. Tasks / Todos Card */}
                    <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.whiteCard}>
                        <View style={styles.whiteCardHeader}>
                            <Text style={styles.whiteCardTitle}>할 일 리스트</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/plan')}>
                                <Text style={styles.moreText}>더보기</Text>
                            </TouchableOpacity>
                        </View>

                        {incompleteTodos.length > 0 ? (
                            incompleteTodos.map((todo: any, idx: number) => (
                                <View key={todo.id} style={styles.todoRow}>
                                    <View style={styles.todoCheck} />
                                    <Text style={styles.todoText}>{todo.title}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>오늘 할 일을 모두 마쳤어요!</Text>
                        )}
                    </Animated.View>

                    {/* 3. nestType 기반 맞춤 배너 */}
                    {nestType === 'couple' ? (
                        // 커플·파트너: 가장 가까운 기념일 D-Day
                        <AnimatedTouchableOpacity
                            entering={FadeInUp.delay(600).duration(600)}
                            style={[styles.checklistBanner, { backgroundColor: '#4A1942' }]}
                            onPress={() => router.push('/(tabs)/anniversary')}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={[styles.checklistBannerTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={styles.checklistBannerTagText}>💑 기념일</Text>
                                </View>
                                <Text style={styles.checklistBannerTitle}>
                                    {anniversaries && anniversaries.length > 0
                                        ? (() => {
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            const next = anniversaries
                                                .map((a: any) => {
                                                    const d = new Date(a.anniversary_date);
                                                    d.setFullYear(today.getFullYear());
                                                    if (d < today) d.setFullYear(today.getFullYear() + 1);
                                                    return { ...a, _next: d };
                                                })
                                                .sort((a: any, b: any) => a._next - b._next)[0];
                                            const diff = Math.ceil((next._next.getTime() - today.getTime()) / 86400000);
                                            return diff === 0 ? `🎉 오늘은 ${next.title}!` : `D-${diff} ${next.title}`;
                                        })()
                                        : '기념일을 등록해보세요'}
                                </Text>
                                <Text style={styles.checklistBannerSub}>함께한 소중한 날들을 기록해요</Text>
                            </View>
                            <View style={styles.checklistBannerIcon}>
                                <Text style={{ fontSize: 40 }}>💝</Text>
                            </View>
                        </AnimatedTouchableOpacity>
                    ) : nestType === 'family' ? (
                        // 가족: 이번 주 가족 일정
                        <AnimatedTouchableOpacity
                            entering={FadeInUp.delay(600).duration(600)}
                            style={[styles.checklistBanner, { backgroundColor: '#1A5C3A' }]}
                            onPress={() => router.push('/(tabs)/plan')}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={[styles.checklistBannerTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={styles.checklistBannerTagText}>👨‍👩‍👧‍👦 가족 일정</Text>
                                </View>
                                <Text style={styles.checklistBannerTitle}>
                                    {upcomingEvents.length > 0
                                        ? `이번 주 일정 ${upcomingEvents.length}개`
                                        : '이번 주 일정을 추가해보세요'}
                                </Text>
                                <Text style={styles.checklistBannerSub}>가족 모두의 일정을 한 눈에</Text>
                            </View>
                            <View style={styles.checklistBannerIcon}>
                                <Text style={{ fontSize: 40 }}>🗓️</Text>
                            </View>
                        </AnimatedTouchableOpacity>
                    ) : (
                        // 기숙사 (기본): 룸메이트 체크리스트
                        <AnimatedTouchableOpacity
                            entering={FadeInUp.delay(600).duration(600)}
                            style={styles.checklistBanner}
                            onPress={() => router.push('/toss/roommate_checklist')}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={styles.checklistBannerTag}>
                                    <Text style={styles.checklistBannerTagText}>📰 새학기 특집</Text>
                                </View>
                                <Text style={styles.checklistBannerTitle}>룸메이트 체크리스트</Text>
                                <Text style={styles.checklistBannerSub}>22가지 항목으로 나와 맞는{'\n'}룸메이트를 찾아보세요</Text>
                            </View>
                            <View style={styles.checklistBannerIcon}>
                                <Text style={{ fontSize: 40 }}>📋</Text>
                            </View>
                        </AnimatedTouchableOpacity>
                    )}

                    {/* 4. Life Info Banner */}
                    <AnimatedTouchableOpacity
                        entering={FadeInUp.delay(700).duration(600)}
                        style={styles.banner}
                        onPress={() => router.push('/life_info')}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerSubtitle}>룸메이트 맞춤 꿀팁 ✨</Text>
                            <Text style={styles.bannerTitle}>공유 생활 꿀팁 보러가기</Text>
                        </View>
                        <View style={styles.bannerEmoji}>
                            <Text style={{ fontSize: 32 }}>💡</Text>
                        </View>
                    </AnimatedTouchableOpacity>
                        </>
                    )}

                </View>
            </ScrollView>

            {/* 배너 광고 (화면 하단) */}
            <AdBanner position="bottom" />

            <ActivityModal
                visible={activityModalVisible}
                onClose={() => setActivityModalVisible(false)}
            />

            <FloatingActionMenu themeBg={TDS_COLORS.blue} />

            {/* Tutorial Logic */}
            <TutorialOverlay
                visible={!hasSeenMasterTutorial && isLoggedIn}
                onComplete={completeMasterTutorial}
                steps={[
                    {
                        target: { x: 0, y: 0, width: width, height: 300, borderRadius: 0 },
                        title: t.tutorial?.step1_title || "환영합니다!",
                        description: t.tutorial?.step1_desc || "새로운 홈 화면을 확인해보세요.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 350, width: width - 40, height: 200, borderRadius: 28 },
                        title: "할 일 관리",
                        description: "오늘 해야 할 일을 한눈에 확인하세요.",
                        position: "top"
                    }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: TDS_COLORS.grey100,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: TDS_COLORS.white,
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...TDS_ELEVATION.card,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    nestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nestIconBox: {
        width: 32,
        height: 32,
        backgroundColor: TDS_COLORS.grey50,
        borderRadius: 10,
        marginRight: 10,
        padding: 4,
    },
    nestIcon: {
        width: '100%',
        height: '100%',
    },
    nestName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TDS_COLORS.grey900,
        marginRight: 4,
    },
    notifButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: TDS_COLORS.grey50,
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: TDS_COLORS.red,
        borderWidth: 1.5,
        borderColor: TDS_COLORS.white,
    },
    memberPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TDS_COLORS.grey100,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    avatarStack: {
        flexDirection: 'row',
        marginRight: 8,
    },
    memberText: {
        fontSize: 13,
        fontWeight: '600',
        color: TDS_COLORS.grey700,
    },
    cardContainer: {
        padding: 16,
        gap: 20,
    },
    briefingCard: {
        backgroundColor: TDS_COLORS.blue,
        borderRadius: 32,
        padding: 28,
        ...TDS_SHADOW.premium,
        ...Platform.select({ web: { boxShadow: '0 8px 20px rgba(49, 130, 246, 0.25)' } }),
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardMainTitle: {
        color: TDS_COLORS.white,
        fontSize: 22,
        fontWeight: '900',
        lineHeight: 30,
        letterSpacing: -0.8,
        marginBottom: 20,
    },
    cardHeader: {
        // Container for card label and main title
    },
    briefingContent: {
        gap: 12,
    },
    briefingItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    briefingIconBox: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    briefingItemLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    briefingItemTitle: {
        color: TDS_COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    whiteCard: {
        backgroundColor: TDS_COLORS.white,
        borderRadius: 32,
        padding: 28,
        ...TDS_ELEVATION.card,
        ...Platform.select({ web: { boxShadow: '0 2px 10px rgba(0,0,0,0.04)' } }),
    },
    whiteCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    whiteCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TDS_COLORS.grey900,
        letterSpacing: -0.5,
    },
    moreText: {
        fontSize: 13,
        fontWeight: '600',
        color: TDS_COLORS.grey500,
    },
    todoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: TDS_COLORS.grey100,
    },
    todoCheck: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: TDS_COLORS.grey200,
        marginRight: 12,
    },
    todoText: {
        fontSize: 15,
        fontWeight: '600',
        color: TDS_COLORS.grey700,
    },
    emptyText: {
        color: TDS_COLORS.grey500,
        textAlign: 'center',
        paddingVertical: 20,
    },
    banner: {
        backgroundColor: TDS_COLORS.white,
        borderRadius: 32,
        padding: 28,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: TDS_COLORS.white,
        ...TDS_SHADOW.sm,
    },
    bannerSubtitle: {
        color: TDS_COLORS.blue,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TDS_COLORS.grey900,
        letterSpacing: -0.3,
    },
    bannerEmoji: {
        width: 60,
        height: 60,
        backgroundColor: TDS_COLORS.grey50,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Roommate Checklist Banner
    checklistBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A3A6B',
        borderRadius: TDS_RADIUS.xl,
        padding: 20,
        marginBottom: 12,
        ...TDS_ELEVATION.card,
    },
    checklistBannerTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: TDS_RADIUS.sm,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    checklistBannerTagText: {
        ...TDS_TYPOGRAPHY.tiny,
        color: 'rgba(255,255,255,0.9)',
    },
    checklistBannerTitle: {
        ...TDS_TYPOGRAPHY.h2,
        color: TDS_COLORS.white,
        marginBottom: 4,
    },
    checklistBannerSub: {
        ...TDS_TYPOGRAPHY.caption2,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 18,
    },
    checklistBannerIcon: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: TDS_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
