import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUserStore, HouseRule } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../constants/I18n';
import { useRouter } from 'expo-router';

export default function ActivityScreen() {
    const { nestTheme, todos, events, goals, members, language, nestName, nestId, rules } = useUserStore();
    const router = useRouter();
    const t = translations[language as Language];

    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // Helper to format date relative time
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';

        const now = new Date();
        const past = new Date(dateString);

        // If dateString is just YYYY-MM-DD, fallback to original string (replace - with .)
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

    // Use full ISO string for current activities to show "Just now" or "X mins ago"
    const today = new Date().toISOString();

    // 1. Nest Creation Log
    const nestCreationLog = {
        id: 'nest-created',
        type: 'nest',
        title: nestName,
        user: members[0] || { nickname: 'Admin', avatarId: 0 },
        date: today,
        message: language === 'ko' ? "보금자리가 개설되었어요 🎉" : "The nest was created 🎉",
        targetPath: '/(tabs)/home'
    };

    // 2. Member Join Logs
    const memberJoinLogs = members.slice(1).map((m, i) => ({
        id: `join-${m.id}`,
        type: 'join',
        title: nestName,
        user: m,
        date: today,
        message: language === 'ko' ? "새로운 가족이 합류했어요 👋" : "joined the family 👋",
        targetPath: '/(tabs)/settings'
    }));

    // 3. Completed Todos
    const completedTodosLogs = todos.filter(todo => todo.isCompleted).map(todo => ({
        id: `todo-${todo.id}`,
        type: 'todo',
        title: todo.title,
        user: members.find(m => m.id === todo.completedBy) || members.find(m => m.id === todo.assignees[0]?.id) || members[0],
        date: today,
        message: language === 'ko' ? "할 일을 완료했어요 ✅" : "completed a task ✅",
        targetPath: '/(tabs)/plan?action=todo'
    }));

    // 4. Events Created
    const createdEventsLogs = events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        user: members.find(m => m.id === event.creatorId) || members[0],
        date: event.date, // This is YYYY-MM-DD, will be formatted as YYYY.MM.DD
        message: language === 'ko' ? "일정을 추가했어요 📅" : "added a schedule 📅",
        targetPath: '/(tabs)/plan'
    }));

    // 5. Goals Added
    const goalLogs = goals.map(goal => ({
        id: `goal-${goal.id}`,
        type: 'goal',
        title: goal.title,
        user: members[0], // Goals are communal, attribution is less important or defaults to admin
        date: today, // Assuming newly added
        message: language === 'ko'
            ? `우리 보금자리 ${nestName}에\n새로운 목표가 추가되었어요 ✨`
            : `A new goal was added to\nour nest ${nestName} ✨`,
        targetPath: '/(tabs)/rules'
    }));

    // 6. Rules Added
    const ruleLogs = rules.map(rule => ({
        id: `rule-${rule.id}`,
        type: 'rule',
        title: rule.title,
        user: members[0], // Rules are communal
        date: rule.created_at || today, // Use real date if available, or today
        message: language === 'ko'
            ? `우리 보금자리 ${nestName}에\n새로운 규칙이 추가되었어요 📜`
            : `A new rule was added to\nour nest ${nestName} 📜`,
        targetPath: '/(tabs)/rules'
    }));

    // Merge all logs
    const activities = [
        ...completedTodosLogs,
        ...createdEventsLogs,
        ...goalLogs,
        ...ruleLogs,
        ...memberJoinLogs,
        nestCreationLog
    ].sort((a, b) => {
        // Sort by full timestamp/date string
        return b.date.localeCompare(a.date);
    });

    const handlePress = (path: string) => {
        if (path.includes('?')) {
            router.push(path as any);
        } else {
            router.push(path as any);
        }
    };

    const ActivityItem = ({ item }: { item: any }) => {
        // Customize text based on type
        const isCommunal = item.type === 'goal' || item.type === 'rule' || item.type === 'nest';

        return (
            <View className="flex-row items-start mb-6 px-4">
                {/* Timeline Line */}
                <View className="absolute left-[34px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />

                <Image
                    source={(AVATARS[item.user?.avatarId || 0] || AVATARS[0]).image}
                    className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm z-10"
                />

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress(item.targetPath)}
                    className="flex-1 ml-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center gap-1">
                            {!isCommunal && <Text className="font-bold text-gray-900 text-base">{item.user?.nickname || 'Unknown'}</Text>}
                            <Text className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.date)}</Text>
                        </View>
                    </View>

                    {isCommunal ? (
                        <View>
                            <Text className="text-gray-800 text-sm font-medium mb-1 leading-5">{item.message}</Text>
                            <Text className={cn("text-base font-bold", themeText)}>{item.title}</Text>
                        </View>
                    ) : (
                        <Text className="text-gray-600 mb-1 leading-5">
                            {item.user?.nickname}{language === 'ko' ? "님이 " : " "}
                            <Text className="font-medium text-gray-800">{item.title}</Text>
                            {language === 'ko'
                                ? (item.type === 'join' ? "에 " : "을(를) ")
                                : " "
                            }
                            {item.message.replace("보금자리를 ", "").replace("보금자리에 ", "").replace("할 일을 ", "").replace("일정을 ", "").replace("created the nest", "created").replace("joined the nest", "joined").replace("completed a task", "completed").replace("added a schedule", "added")}
                        </Text>
                    )}

                    {!isCommunal && (
                        <Text className="text-sm text-gray-400 mt-1">
                            {item.message}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-12 pb-4 px-6 bg-white border-b border-gray-100 shadow-sm z-10">
                <Text className="text-2xl font-black text-gray-800">
                    {language === 'ko' ? "활동 기록 👀" : "Activity Log 👀"}
                </Text>
            </View>

            <ScrollView className="flex-1 pt-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {activities.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-5xl mb-4">📭</Text>
                        <Text className="text-gray-400 text-lg">
                            {language === 'ko' ? "아직 활동 내역이 없어요" : "No activity yet"}
                        </Text>
                    </View>
                ) : (
                    activities.map((item, index) => (
                        <ActivityItem key={index} item={item} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
