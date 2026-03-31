import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Platform, Modal, TouchableWithoutFeedback, Alert, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import { AVATARS, NEST_AVATARS } from '../../../constants/data';
import { getThemeColors } from '../../../utils/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../../constants/I18n';
import TutorialOverlay from '../../../components/TutorialOverlay';
import FloatingActionMenu from '../../../components/FloatingActionMenu';
import Avatar from '../../../components/Avatar';
import ActivityModal from '../../../components/ActivityModal';

const { width, height } = Dimensions.get('window');

// D-Day 계산 헬퍼
const getDDay = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days < 0) return `D+${Math.abs(days)}`;
    return `D-${days}`;
};

/** 스켈레톤 로딩 컴포넌트 */
function SkeletonCard({ height: h = 120, className: cls = '' }: { height?: number; className?: string }) {
    return (
        <View
            className={cn("bg-gray-100 rounded-3xl animate-pulse", cls)}
            style={{ height: h }}
        />
    );
}

/** 빈 상태 컴포넌트 */
function EmptyState({ icon, title, ctaLabel, onPress }: { icon: string; title: string; ctaLabel: string; onPress: () => void }) {
    return (
        <View
            className="bg-white rounded-3xl p-8 items-center justify-center"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 2,
            }}
        >
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-3">
                <Ionicons name={icon as any} size={28} color="#D1D5DB" />
            </View>
            <Text className="text-gray-400 font-medium text-sm mb-4">{title}</Text>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                className="bg-gray-900 px-5 py-2.5 rounded-full"
                style={{ minHeight: 40 }}
            >
                <Text className="text-white font-semibold text-xs">{ctaLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const {
        nickname, avatarId, nestName, nestTheme, nestId, nestAvatarId,
        todos, events, goals, members, language: langFromStore, hasSeenTutorial, completeTutorial,
        syncMissions, syncEvents, syncGoals, syncTransactions, isLoggedIn, hasSeenMasterTutorial, completeMasterTutorial, isMaster,
        appMode, setAppMode, isLoading, transactions
    } = useUserStore();
    const language = langFromStore as 'ko' | 'en';
    const t = (translations[language] as any).home;
    const [greeting, setGreeting] = useState('');
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const tm = (translations[language] as any).master;

    // 테마 설정
    const { bg: themeBg, text: themeText, bgSoft: themeItemBg, isToss } = getThemeColors(nestTheme, appMode);
    const isTossMode = isToss;

    useEffect(() => {
        if (isLoggedIn && hasSeenTutorial && !hasSeenMasterTutorial) {
            const timer = setTimeout(() => {
                setShowMasterModal(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoggedIn, hasSeenTutorial, hasSeenMasterTutorial]);

    // 데이터 집계 (memoized)
    const incompleteTodos = useMemo(
        () => todos.filter((t: any) => !t.isCompleted).slice(0, 3),
        [todos]
    );

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const upcomingEvents = useMemo(
        () => events
            .filter((e: any) => e.date >= todayStr)
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .slice(0, 2),
        [events, todayStr]
    );

    const activeGoals = useMemo(
        () => goals.sort((a: any, b: any) => {
            const order = { vision: 0, year: 1, month: 2, week: 3 };
            return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
        }).slice(0, 3),
        [goals]
    );

    // 이번 달 지출 요약
    const monthlySpending = useMemo(() => {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthTx = transactions.filter((tx: any) => tx.date?.startsWith(yearMonth));
        const total = monthTx.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        return { total, count: monthTx.length };
    }, [transactions]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t.greeting_morning);
        else if (hour < 18) setGreeting(t.greeting_afternoon);
        else setGreeting(t.greeting_evening);

        // 실제 API 데이터 로딩
        if (nestId) {
            useUserStore.getState().syncAll();
        }
    }, [nestId, language]);

    /** Pull-to-Refresh 핸들러 */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await useUserStore.getState().syncAll();
        } catch (error) {
            console.error('새로고침 실패:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // 로딩 상태 확인
    const isDataLoading = isLoading.todos || isLoading.events || isLoading.transactions;

    // Supanova 섹션 헤더
    const SectionHeader = ({ title, onPress }: { title: string, onPress: () => void }) => (
        <View className="flex-row justify-between items-center mb-3 mt-2">
            <Text className="text-2xl font-bold tracking-tight text-gray-900">{title}</Text>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                className="py-2 px-3"
            >
                <Text className="text-xs text-gray-400 font-medium">{language === 'ko' ? '더보기' : 'More'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF7F50"
                        colors={['#FF7F50']}
                    />
                }
            >

                {/* 상단 프로필 영역 — Supanova 클린 헤더 */}
                <View className="pt-16 pb-6 px-5 bg-white">
                    <View className="flex-row justify-between items-center mb-5">
                        {/* 보금자리 아바타 + 인사말 */}
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center overflow-hidden border border-gray-100">
                                <Image
                                    source={(NEST_AVATARS.find((a: any) => a.id === nestAvatarId) || NEST_AVATARS[0]).image}
                                    style={{ width: '80%', height: '80%' }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View>
                                <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-400">
                                    {isTossMode ? "ROOMMATECHECK" : greeting.toUpperCase()}
                                </Text>
                                <Text className="text-2xl font-bold tracking-tight text-gray-900">{nestName}</Text>
                            </View>
                        </View>

                        {/* 알림 + 설정 */}
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setActivityModalVisible(true);
                                }}
                                className="w-11 h-11 items-center justify-center rounded-full bg-gray-50"
                                style={{ minHeight: 44, minWidth: 44 }}
                            >
                                <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                                <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onLongPress={() => {
                                    const next = isTossMode ? 'matecheck' : 'roommatecheck';
                                    setAppMode(next);
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    Alert.alert(next === 'roommatecheck' ? 'Toss Mode' : 'MateCheck Mode', '디자인 테마가 변경되었습니다.');
                                }}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/(tabs)/settings');
                                }}
                                className="w-11 h-11 items-center justify-center rounded-full bg-gray-50"
                                style={{ minHeight: 44, minWidth: 44 }}
                            >
                                <Ionicons name="settings-outline" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 멤버 필 — 깔끔한 컴팩트 */}
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/member_management');
                        }}
                        className="flex-row items-center py-2 px-3 rounded-full bg-gray-50 self-start"
                    >
                        <View className="flex-row -space-x-2 mr-2">
                            {members.slice(0, 4).map((m: any, i: number) => (
                                <Avatar
                                    key={m.id}
                                    source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                    size="xs"
                                    borderColor="#F9FAFB"
                                    borderWidth={2}
                                />
                            ))}
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">
                            {members.length === 0 ? t.empty_mate : language === 'ko' ? `${members.length}명의 메이트` : `${members.length} Mates`}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#9CA3AF" className="ml-1" />
                    </TouchableOpacity>
                </View>

                <View className="px-5 gap-4 mt-4">

                    {/* 빠른 액션 그리드 — 2x2 Supanova 스타일 */}
                    <Animated.View entering={FadeInUp.delay(80)}>
                        <View className="flex-row gap-3">
                            {[
                                { icon: 'checkbox-outline' as const, label: language === 'ko' ? '할 일' : 'Tasks', color: '#3B82F6', bg: '#EFF6FF', badge: incompleteTodos.length, onPress: () => router.push('/(tabs)/plan') },
                                { icon: 'calendar-outline' as const, label: language === 'ko' ? '일정' : 'Events', color: '#F59E0B', bg: '#FFFBEB', badge: upcomingEvents.length, onPress: () => router.push('/(tabs)/plan') },
                                { icon: 'wallet-outline' as const, label: language === 'ko' ? '가계부' : 'Budget', color: '#10B981', bg: '#ECFDF5', badge: 0, onPress: () => router.push('/(tabs)/budget') },
                                { icon: 'flag-outline' as const, label: language === 'ko' ? '목표' : 'Goals', color: '#8B5CF6', bg: '#F5F3FF', badge: activeGoals.length, onPress: () => router.push('/(tabs)/rules') },
                            ].map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        item.onPress();
                                    }}
                                    className="flex-1 bg-white rounded-2xl p-4 items-center justify-center"
                                    style={{
                                        minHeight: 44,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.06,
                                        shadowRadius: 12,
                                        elevation: 2,
                                    }}
                                >
                                    <View className="relative">
                                        <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: item.bg }}>
                                            <Ionicons name={item.icon} size={20} color={item.color} />
                                        </View>
                                        {/* 뱃지 카운트 */}
                                        {item.badge > 0 && (
                                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                                                <Text className="text-white text-[10px] font-bold">{item.badge > 9 ? '9+' : item.badge}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-xs font-semibold text-gray-700">{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>

                    {/* 데일리 브리핑 카드 — Supanova 화이트 카드 */}
                    {isDataLoading && !refreshing ? (
                        <SkeletonCard height={180} />
                    ) : (
                        <Animated.View
                            entering={FadeInUp.delay(160)}
                            className="bg-white rounded-3xl p-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-400 mb-1">
                                        {language === 'ko' ? "데일리 브리핑" : "DAILY BRIEFING"}
                                    </Text>
                                    <Text className="text-lg font-bold tracking-tight text-gray-900">
                                        {language === 'ko' ? '오늘의 체크리스트' : "Today's Checklist"}
                                    </Text>
                                </View>
                                <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                                    <Text className="text-lg">✨</Text>
                                </View>
                            </View>

                            <View className="gap-3">
                                {/* 스마트 콘텐츠 */}
                                {upcomingEvents.length > 0 ? (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/plan')}
                                        activeOpacity={0.8}
                                        className="bg-orange-50 p-4 rounded-2xl flex-row gap-3 items-center"
                                    >
                                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
                                            <Text className="text-base">📅</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-orange-600 font-semibold text-xs mb-0.5">
                                                {getDDay(upcomingEvents[0].date)} {language === 'ko' ? "일정 예정" : "Upcoming"}
                                            </Text>
                                            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{upcomingEvents[0].title}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color="#FB923C" />
                                    </TouchableOpacity>
                                ) : activeGoals.length > 0 ? (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/rules')}
                                        activeOpacity={0.8}
                                        className="bg-blue-50 p-4 rounded-2xl flex-row gap-3 items-center"
                                    >
                                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
                                            <Text className="text-base">🏆</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-blue-600 font-semibold text-xs mb-0.5">{language === 'ko' ? "집중 목표" : "Focus Goal"}</Text>
                                            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{activeGoals[0].title}</Text>
                                            <Text className="text-gray-400 text-xs mt-0.5">{activeGoals[0].current}% {language === 'ko' ? '달성 중' : 'achieved'}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                                    </TouchableOpacity>
                                ) : (
                                    <View className="bg-green-50 p-4 rounded-2xl flex-row gap-3 items-center">
                                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
                                            <Text className="text-base">🌿</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-green-600 font-semibold text-xs mb-0.5">{language === 'ko' ? "평온한 하루" : "Peaceful Day"}</Text>
                                            <Text className="text-gray-900 font-bold text-base">{language === 'ko' ? '오늘 하루도 행복하게!' : 'Have a great day!'}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* 미완료 할 일 */}
                                {incompleteTodos.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/plan')}
                                        className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center"
                                    >
                                        <Text className="text-gray-500 font-medium text-sm">{language === 'ko' ? '남은 할 일' : 'Remaining tasks'}</Text>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-gray-900 font-bold">{incompleteTodos.length}{language === 'ko' ? '개' : ''}</Text>
                                            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {/* 이번 달 지출 요약 */}
                                {monthlySpending.total > 0 && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/budget')}
                                        className="bg-emerald-50 p-4 rounded-2xl flex-row justify-between items-center"
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-emerald-600 text-sm">💰</Text>
                                            <Text className="text-gray-500 font-medium text-sm">{language === 'ko' ? '이번 달 지출' : 'Monthly spending'}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-gray-900 font-bold">
                                                {monthlySpending.total.toLocaleString()}{language === 'ko' ? '원' : ''}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                    )}

                    {/* 돌아오는 일정 — Supanova 카드 리스트 */}
                    <View>
                        <SectionHeader title={language === 'ko' ? "돌아오는 일정" : "Upcoming"} onPress={() => router.push('/(tabs)/plan')} />
                        {isLoading.events && !refreshing ? (
                            <View className="gap-3">
                                <SkeletonCard height={90} />
                                <SkeletonCard height={90} />
                            </View>
                        ) : upcomingEvents.length === 0 ? (
                            <EmptyState
                                icon="calendar-outline"
                                title={language === 'ko' ? '등록된 일정이 없어요' : 'No upcoming events'}
                                ctaLabel={language === 'ko' ? '일정 추가하기' : 'Add event'}
                                onPress={() => router.push('/(tabs)/plan')}
                            />
                        ) : (
                            <View className="gap-3">
                                {upcomingEvents.slice(0, 3).map((evt: any, index: number) => {
                                    const dday = getDDay(evt.date);
                                    const isToday = dday === '오늘';

                                    return (
                                        <Animated.View
                                            key={evt.id}
                                            entering={FadeInUp.delay(index * 80 + 240)}
                                            className="flex-row bg-white p-5 rounded-3xl items-center"
                                            style={{
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.06,
                                                shadowRadius: 12,
                                                elevation: 2,
                                            }}
                                        >
                                            {/* 날짜 박스 */}
                                            <View className={cn("w-12 h-12 rounded-2xl items-center justify-center mr-4", isToday ? "bg-gray-900" : "bg-gray-50")}>
                                                <Text className={cn("text-[10px] font-medium", isToday ? "text-gray-400" : "text-gray-400")}>
                                                    {new Date(evt.date).getMonth() + 1}{language === 'ko' ? '월' : ''}
                                                </Text>
                                                <Text className={cn("text-lg font-bold", isToday ? "text-white" : "text-gray-900")}>
                                                    {new Date(evt.date).getDate()}
                                                </Text>
                                            </View>

                                            {/* 콘텐츠 */}
                                            <View className="flex-1">
                                                <View className={cn("px-2 py-0.5 rounded-md self-start mb-1", isToday ? "bg-red-50" : "bg-gray-100")}>
                                                    <Text className={cn("text-[10px] font-semibold", isToday ? "text-red-500" : "text-gray-500")}>{dday}</Text>
                                                </View>
                                                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{evt.title}</Text>
                                                <Text className="text-xs text-gray-400 mt-0.5">
                                                    {evt.endDate ? `${evt.date} ~ ${evt.endDate}` : 'All Day'}
                                                </Text>
                                            </View>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}
                        {upcomingEvents.length > 0 && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/plan')}
                                className="mt-3 flex-row justify-center items-center py-3.5 bg-white rounded-full"
                                style={{
                                    minHeight: 44,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 12,
                                    elevation: 2,
                                }}
                            >
                                <Text className="text-gray-600 font-semibold text-sm">{language === 'ko' ? '전체 일정 보기' : 'View all events'}</Text>
                                <Ionicons name="arrow-forward" size={14} color="#6B7280" style={{ marginLeft: 6 }} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 오늘의 할 일 미리보기 */}
                    {incompleteTodos.length > 0 && (
                        <View>
                            <SectionHeader title={language === 'ko' ? "오늘의 할 일" : "Today's Tasks"} onPress={() => router.push('/(tabs)/plan')} />
                            <Animated.View
                                entering={FadeInUp.delay(280)}
                                className="bg-white rounded-3xl p-5 gap-3"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 12,
                                    elevation: 2,
                                }}
                            >
                                {incompleteTodos.map((todo: any, index: number) => (
                                    <TouchableOpacity
                                        key={todo.id}
                                        onPress={() => router.push('/(tabs)/plan')}
                                        className="flex-row items-center gap-3 py-1"
                                    >
                                        <View className="w-6 h-6 rounded-full border-2 border-gray-200 items-center justify-center">
                                            {todo.isCompleted && <Ionicons name="checkmark" size={14} color="#10B981" />}
                                        </View>
                                        <Text className="text-gray-900 font-medium text-sm flex-1" numberOfLines={1}>{todo.title}</Text>
                                        {todo.assignees && todo.assignees.length > 0 && (
                                            <View className="flex-row -space-x-1">
                                                {todo.assignees.slice(0, 2).map((a: any, i: number) => (
                                                    <Avatar
                                                        key={a.id || i}
                                                        source={(AVATARS[a.avatarId] || AVATARS[0]).image}
                                                        size="xs"
                                                        borderColor="white"
                                                        borderWidth={1}
                                                    />
                                                ))}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        </View>
                    )}

                    {/* 생활 정보 배너 — Supanova 카드 스타일 */}
                    <Animated.View entering={FadeInUp.delay(320)}>
                        <TouchableOpacity
                            onPress={() => router.push('/life_info')}
                            activeOpacity={0.9}
                            className="bg-white rounded-3xl p-5 flex-row items-center"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <View className="bg-indigo-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                <Ionicons name="sparkles" size={22} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-indigo-400 mb-0.5">
                                    {language === 'ko' ? 'AI 맞춤 추천' : 'AI RECOMMENDATION'}
                                </Text>
                                <Text className="text-base font-bold text-gray-900">
                                    {language === 'ko' ? '놓치고 있는 혜택 확인하기' : 'Check benefits you might miss'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#C7D2FE" />
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </ScrollView>

            {/* 튜토리얼 오버레이 — 기존 기능 유지 */}
            <TutorialOverlay
                visible={!hasSeenTutorial}
                onComplete={completeTutorial}
                steps={[
                    {
                        target: { x: 0, y: 0, width: width, height: 200, borderRadius: 0 },
                        title: (translations[language] as any).tutorial.step1_title,
                        description: (translations[language] as any).tutorial.step1_desc,
                        position: "bottom"
                    },
                    {
                        target: { x: 16, y: 280, width: width - 32, height: 200, borderRadius: 24 },
                        title: (translations[language] as any).tutorial.step2_title,
                        description: (translations[language] as any).tutorial.step2_desc,
                        position: "bottom"
                    },
                    {
                        target: { x: width - 88, y: height - 194, width: 72, height: 72, borderRadius: 36 },
                        title: (translations[language] as any).tutorial.step3_title,
                        description: (translations[language] as any).tutorial.step3_desc,
                        position: "top"
                    },
                    {
                        target: { x: 0, y: height - (Platform.OS === 'ios' ? 95 : 70), width: width, height: 90, borderRadius: 0 },
                        title: (translations[language] as any).tutorial.step4_title,
                        description: (translations[language] as any).tutorial.step4_desc,
                        position: "top"
                    }
                ]}
            />

            <FloatingActionMenu themeBg={themeBg} />

            <ActivityModal
                visible={activityModalVisible}
                onClose={() => setActivityModalVisible(false)}
            />

            {/* 마스터 튜토리얼 모달 — Supanova 스타일 */}
            <Modal
                visible={showMasterModal}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-5">
                    <TouchableWithoutFeedback onPress={() => {
                        completeMasterTutorial();
                        setShowMasterModal(false);
                    }}>
                        <View className="absolute inset-0" />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        entering={FadeInUp.springify().damping(12)}
                        className="bg-white rounded-3xl w-full p-6 items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.12,
                            shadowRadius: 24,
                            elevation: 8,
                        }}
                    >
                        <View className="w-20 h-20 bg-yellow-50 rounded-3xl items-center justify-center mb-6">
                            <Text className="text-4xl">👑</Text>
                        </View>

                        <Text className="text-2xl font-bold tracking-tight text-gray-900 mb-2 text-center">
                            {tm.tutorial_title}
                        </Text>

                        <Text className="text-gray-500 text-center leading-6 mb-6 font-medium text-sm">
                            {tm.tutorial_desc}
                        </Text>

                        <View className="bg-orange-50 p-4 rounded-2xl mb-6 w-full flex-row items-center gap-3">
                            <View className="w-9 h-9 bg-white rounded-full items-center justify-center">
                                <Text className="text-base">💡</Text>
                            </View>
                            <Text className="flex-1 text-orange-700 text-xs font-medium leading-5">
                                {tm.grant_notice}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                completeMasterTutorial();
                                setShowMasterModal(false);
                            }}
                            className="bg-gray-900 w-full py-3.5 rounded-full items-center"
                            style={{ minHeight: 44 }}
                        >
                            <Text className="text-white font-semibold text-base">
                                {language === 'ko' ? '확인했습니다' : 'Got it'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
