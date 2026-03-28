import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUserStore, HouseRule } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import { getThemeColors } from '../../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../../constants/I18n';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ActivityScreen() {
    const { nestTheme, todos, events, goals, members, language, nestName, nestId, rules, appMode } = useUserStore();
    const router = useRouter();
    const t = translations[language as Language];

    const { text: themeText } = getThemeColors(nestTheme, appMode);

    // 상대 시간 포맷 헬퍼
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';

        const now = new Date();
        const past = new Date(dateString);

        if (dateString.length === 10) return dateString.replace(/-/g, '.');

        const diffMS = now.getTime() - past.getTime();
        const diffSec = Math.floor(diffMS / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (language === 'ko') {
            if (diffSec < 60) return "방금 전";
            if (diffMin < 60) return `${diffMin}분 전`;
            if (diffHour < 24) return `${diffHour}시간 전`;
            if (diffDay < 7) return `${diffDay}일 전`;
            return `${past.getFullYear()}.${String(past.getMonth() + 1).padStart(2, '0')}.${String(past.getDate()).padStart(2, '0')}`;
        } else {
            if (diffSec < 60) return "Just now";
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffHour < 24) return `${diffHour}h ago`;
            if (diffDay < 7) return `${diffDay}d ago`;
            return past.toLocaleDateString();
        }
    };

    // 날짜 그룹 라벨 생성 헬퍼
    const getDateGroupLabel = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const todayStr = now.toISOString().split('T')[0];
        const dateStr = dateString.length >= 10 ? dateString.substring(0, 10) : dateString;

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return language === 'ko' ? '오늘' : 'Today';
        if (dateStr === yesterdayStr) return language === 'ko' ? '어제' : 'Yesterday';
        return dateString.length >= 10 ? dateString.substring(0, 10).replace(/-/g, '.') : dateString;
    };

    const today = new Date().toISOString();

    // 활동 로그 데이터 구성 (기존 로직 유지)
    const nestCreationLog = {
        id: 'nest-created',
        type: 'nest',
        title: nestName,
        user: members[0] || { nickname: 'Admin', avatarId: 0 },
        date: today,
        message: language === 'ko' ? "보금자리가 개설되었어요" : "The nest was created",
        targetPath: '/(tabs)/home',
        icon: 'home' as const,
        iconColor: '#6366F1',
        iconBg: '#EEF2FF',
    };

    const memberJoinLogs = members.slice(1).map((m, i) => ({
        id: `join-${m.id}`,
        type: 'join',
        title: nestName,
        user: m,
        date: today,
        message: language === 'ko' ? "새로운 메이트가 합류했어요" : "joined the family",
        targetPath: '/(tabs)/settings',
        icon: 'person-add' as const,
        iconColor: '#10B981',
        iconBg: '#ECFDF5',
    }));

    const completedTodosLogs = todos.filter(todo => todo.isCompleted).map(todo => ({
        id: `todo-${todo.id}`,
        type: 'todo',
        title: todo.title,
        user: members.find(m => m.id === todo.completedBy) || members.find(m => m.id === todo.assignees[0]?.id) || members[0],
        date: today,
        message: language === 'ko' ? "할 일을 완료했어요" : "completed a task",
        targetPath: '/(tabs)/plan?action=todo',
        icon: 'checkbox' as const,
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
    }));

    const createdEventsLogs = events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        user: members.find(m => m.id === event.creatorId) || members[0],
        date: event.date,
        message: language === 'ko' ? "일정을 추가했어요" : "added a schedule",
        targetPath: '/(tabs)/plan',
        icon: 'calendar' as const,
        iconColor: '#F59E0B',
        iconBg: '#FFFBEB',
    }));

    const goalLogs = goals.map(goal => ({
        id: `goal-${goal.id}`,
        type: 'goal',
        title: goal.title,
        user: members[0],
        date: today,
        message: language === 'ko' ? "새로운 목표가 추가되었어요" : "A new goal was added",
        targetPath: '/(tabs)/rules',
        icon: 'flag' as const,
        iconColor: '#8B5CF6',
        iconBg: '#F5F3FF',
    }));

    const ruleLogs = rules.map(rule => ({
        id: `rule-${rule.id}`,
        type: 'rule',
        title: rule.title,
        user: members[0],
        date: rule.created_at || today,
        message: language === 'ko' ? "새로운 규칙이 추가되었어요" : "A new rule was added",
        targetPath: '/(tabs)/rules',
        icon: 'document-text' as const,
        iconColor: '#EF4444',
        iconBg: '#FEF2F2',
    }));

    // 모든 로그 병합 및 정렬
    const activities = [
        ...completedTodosLogs,
        ...createdEventsLogs,
        ...goalLogs,
        ...ruleLogs,
        ...memberJoinLogs,
        nestCreationLog
    ].sort((a, b) => b.date.localeCompare(a.date));

    // 날짜별 그룹핑
    const groupedActivities: { label: string, items: typeof activities }[] = [];
    let currentGroup = '';
    activities.forEach(activity => {
        const groupLabel = getDateGroupLabel(activity.date);
        if (groupLabel !== currentGroup) {
            currentGroup = groupLabel;
            groupedActivities.push({ label: groupLabel, items: [activity] });
        } else {
            groupedActivities[groupedActivities.length - 1].items.push(activity);
        }
    });

    const handlePress = (path: string) => {
        router.push(path as any);
    };

    // Supanova 활동 아이템 컴포넌트
    const ActivityItem = ({ item, index }: { item: any, index: number }) => {
        const isCommunal = item.type === 'goal' || item.type === 'rule' || item.type === 'nest';

        return (
            <Animated.View entering={FadeInUp.delay(index * 80)}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress(item.targetPath)}
                    className="bg-white rounded-2xl p-4 flex-row items-center gap-3"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 2,
                    }}
                >
                    {/* 아이콘 */}
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: item.iconBg }}>
                        <Ionicons name={item.icon} size={18} color={item.iconColor} />
                    </View>

                    {/* 콘텐츠 */}
                    <View className="flex-1">
                        {isCommunal ? (
                            <>
                                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">{item.message}</Text>
                            </>
                        ) : (
                            <>
                                <View className="flex-row items-center gap-1.5">
                                    <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{item.user?.nickname || 'Unknown'}</Text>
                                    <Text className="text-xs text-gray-400">{item.message}</Text>
                                </View>
                                <Text className="text-xs text-gray-500 font-medium mt-0.5" numberOfLines={1}>{item.title}</Text>
                            </>
                        )}
                    </View>

                    {/* 시간 */}
                    <Text className="text-xs text-gray-400">{formatRelativeTime(item.date)}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Supanova 헤더 */}
            <View className="pt-16 pb-4 px-5 bg-white">
                <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-400 mb-1">
                    {language === 'ko' ? '보금자리 기록' : 'NEST LOG'}
                </Text>
                <Text className="text-2xl font-bold tracking-tight text-gray-900">
                    {language === 'ko' ? "활동 기록" : "Activity Log"}
                </Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {activities.length === 0 ? (
                    /* 빈 상태 — Supanova 미니멀 */
                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4" style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 12,
                            elevation: 2,
                        }}>
                            <Ionicons name="file-tray-outline" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-400 font-medium text-sm">
                            {language === 'ko' ? "아직 활동 내역이 없어요" : "No activity yet"}
                        </Text>
                    </View>
                ) : (
                    /* 타임라인 — 날짜 구분선 + 카드 목록 */
                    groupedActivities.map((group, groupIndex) => (
                        <View key={group.label} className="mb-5">
                            {/* 날짜 구분선 */}
                            <View className="flex-row items-center mb-3 gap-3">
                                <Text className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-400">
                                    {group.label}
                                </Text>
                                <View className="flex-1 h-[1px] bg-gray-200" />
                            </View>

                            {/* 카드 목록 */}
                            <View className="gap-3">
                                {group.items.map((item, index) => (
                                    <ActivityItem key={item.id} item={item} index={groupIndex * 3 + index} />
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
