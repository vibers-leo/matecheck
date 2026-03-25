import { View, Text, ScrollView, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { cn } from '../lib/utils';
import { THEMES, AVATARS } from '../constants/data';
// import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';
import { translations, Language } from '../constants/I18n';
import Avatar from './Avatar';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { User, Todo, CalendarEvent, Goal, HouseRule } from '../store/userStore';

const { width, height } = Dimensions.get('window');

interface ActivityModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ActivityModal({ visible, onClose }: ActivityModalProps) {
    const { nestTheme, todos, events, goals, members, language, nestName, nestId, rules } = useUserStore();
    const t = translations[language as Language];

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

    const today = new Date().toISOString();

    const activities = [
        ...todos.filter((todo: Todo) => todo.isCompleted).map((todo: Todo) => ({
            id: `todo-${todo.id}`, type: 'todo', title: todo.title,
            user: members.find((m: User) => m.id === todo.completedBy) || members.find((m: User) => m.id === todo.assignees[0]?.id) || members[0],
            date: today, message: language === 'ko' ? "할 일을 완료했어요 ✅" : "completed a task ✅"
        })),
        ...events.map((event: CalendarEvent) => ({
            id: `event-${event.id}`, type: 'event', title: event.title,
            user: members.find((m: User) => m.id === event.creatorId) || members[0],
            date: event.date, message: language === 'ko' ? "일정을 추가했어요 📅" : "added a schedule 📅"
        })),
        ...goals.map((goal: Goal) => ({
            id: `goal-${goal.id}`, type: 'goal', title: goal.title, user: members[0],
            date: today, message: language === 'ko' ? "새로운 목표가 추가되었어요 ✨" : "A new goal was added ✨"
        })),
        ...rules.map((rule: HouseRule) => ({
            id: `rule-${rule.id}`, type: 'rule', title: rule.title, user: members[0],
            date: rule.created_at || today, message: language === 'ko' ? "새로운 규칙이 추가되었어요 📜" : "A new rule was added 📜"
        })),
        ...members.slice(1).map((m: User) => ({
            id: `join-${m.id}`, type: 'join', title: nestName, user: m,
            date: today, message: language === 'ko' ? "새로운 가족이 합류했어요 👋" : "joined the family 👋"
        })),
        {
            id: 'nest-created', type: 'nest', title: nestName, user: members[0] || { nickname: 'Admin', avatarId: 0 },
            date: today, message: language === 'ko' ? "보금자리가 개설되었어요 🎉" : "The nest was created 🎉"
        }
    ].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View className="flex-1 bg-black/40 justify-end">
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={onClose} />
                <Animated.View
                    entering={FadeInUp.springify().damping(20)}
                    exiting={FadeOutDown}
                    style={{ height: height * 0.75 }}
                    className="bg-white rounded-t-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-8 pt-8 pb-4">
                        <Text className="text-2xl font-bold text-gray-900">
                            {language === 'ko' ? "알림 기록 👀" : "Notifications 👀"}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <Text style={{ fontSize: 20, color: '#4B5563' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                        {activities.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <Text className="text-5xl mb-4">📭</Text>
                                <Text className="text-gray-400 text-lg">
                                    {language === 'ko' ? "아직 활동 내역이 없어요" : "No activity yet"}
                                </Text>
                            </View>
                        ) : (
                            activities.map((item, index) => {
                                const isCommunal = item.type === 'goal' || item.type === 'rule' || item.type === 'nest';
                                return (
                                    <View key={index} className="flex-row items-start mb-6 px-2">
                                        <View className="absolute left-[30px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />
                                        <Avatar
                                            source={(AVATARS[item.user?.avatarId || 0] || AVATARS[0]).image}
                                            size="sm"
                                            className="z-10 bg-gray-50"
                                        />
                                        <View className="flex-1 ml-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                            <View className="flex-row justify-between items-center mb-1">
                                                {!isCommunal && <Text className="font-bold text-gray-900 text-sm">{item.user?.nickname || 'Unknown'}</Text>}
                                                <Text className="text-[10px] text-gray-400">{formatRelativeTime(item.date)}</Text>
                                            </View>
                                            <Text className="text-gray-800 text-sm leading-5">
                                                {isCommunal ? (
                                                    <Text>
                                                        {item.message}{'\n'}
                                                        <Text className="font-bold text-orange-600">"{item.title}"</Text>
                                                    </Text>
                                                ) : (
                                                    <Text>
                                                        <Text className="font-bold">"{item.title}"</Text> {item.message}
                                                    </Text>
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}
