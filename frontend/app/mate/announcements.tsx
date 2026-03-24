import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUserStore } from '../../store/userStore';

interface Announcement {
    id: number;
    title: string;
    content: string;
    published_at: string;
}

export default function AnnouncementsScreen() {
    const router = useRouter();
    const { language } = useUserStore();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_URL}/announcements`);
            if (response.ok) {
                const json = await response.json();
                const data = Array.isArray(json) ? json : (json.data || []);
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const toggleAnnouncement = (id: number) => {
        setSelectedId(selectedId === id ? null : id);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">{language === 'ko' ? '공지사항' : 'Announcements'}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F97316" />
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    {announcements.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-5xl mb-4">📢</Text>
                            <Text className="text-gray-400 text-lg">{language === 'ko' ? '등록된 공지사항이 없습니다.' : 'No announcements yet.'}</Text>
                        </View>
                    ) : (
                        announcements.map((announcement, index) => (
                            <Animated.View
                                key={announcement.id}
                                entering={FadeInDown.delay(index * 100)}
                                className="mb-3"
                            >
                                <TouchableOpacity
                                    onPress={() => toggleAnnouncement(announcement.id)}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Header */}
                                    <View className="p-4 flex-row items-center justify-between">
                                        <View className="flex-1 mr-3">
                                            <View className="flex-row items-center mb-1">
                                                <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                                                <Text className="text-xs text-gray-400">
                                                    {formatDate(announcement.published_at)}
                                                </Text>
                                            </View>
                                            <Text className="text-base font-bold text-gray-900">
                                                {announcement.title}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={selectedId === announcement.id ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </View>

                                    {/* Content (Expandable) */}
                                    {selectedId === announcement.id && (
                                        <View className="px-4 pb-4 pt-2 border-t border-gray-50">
                                            <Text className="text-gray-600 leading-6">
                                                {announcement.content}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
