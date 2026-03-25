import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions, Platform, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cn } from '../lib/utils';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useUserStore } from '../store/userStore';
import { translations } from '../constants/I18n';
import { TDS_COLORS, TDS_ELEVATION } from '../constants/DesignTokens';

interface FloatingActionMenuProps {
    themeBg?: string;
}

const { width } = Dimensions.get('window');

export default function FloatingActionMenu({ themeBg = 'bg-orange-500' }: FloatingActionMenuProps) {
    const { language, isMaster, appMode } = useUserStore();
    const isTossMode = appMode === 'roommatecheck';
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const t = (translations[language as keyof typeof translations] as any).master;

    const toggleMenu = () => {
        setVisible(!visible);
    };

    const handleAction = (path: any) => {
        setVisible(false);
        setTimeout(() => {
            router.push(path);
        }, 200);
    };

    const menuItems = [
        {
            label: '목표 추가',
            subLabel: '함께 달성할 목표',
            icon: 'trophy',
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            path: { pathname: '/(tabs)/rules', params: { action: 'add_goal' } },
            isMasterOnly: true
        },
        {
            label: '일정 추가',
            subLabel: '중요한 약속 공유',
            icon: 'calendar',
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            path: { pathname: '/(tabs)/plan', params: { action: 'add' } }
        },
        {
            label: '하우스 룰',
            subLabel: '우리만의 약속',
            icon: 'document-text', // Changed from document-text-outline for filled style
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            path: { pathname: '/(tabs)/rules', params: { action: 'add_rule' } },
            isMasterOnly: true
        },
        {
            label: '공금 내역',
            subLabel: '투명한 정산',
            icon: 'wallet', // Changed icon
            color: 'bg-pink-500',
            textColor: 'text-pink-600',
            bgColor: 'bg-pink-50',
            path: '/(tabs)/budget'
        },
        {
            label: '집안일',
            subLabel: '역할 분담',
            icon: 'refresh',
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            path: '/chore_rotation'
        },
        {
            label: '생활 정보',
            subLabel: '지원사업 & 꿀팁',
            icon: 'sparkles',
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            path: '/life_info'
        },
        {
            label: '공용물품',
            subLabel: '쇼핑 위시리스트',
            icon: 'cart',
            color: 'bg-teal-500',
            textColor: 'text-teal-600',
            bgColor: 'bg-teal-50',
            path: '/wishlist'
        },
    ];

    return (
        <>
            <Modal visible={visible} transparent animationType="none" onRequestClose={toggleMenu}>
                <View className="flex-1 justify-end">
                    {/* Backdrop */}
                    <TouchableWithoutFeedback onPress={toggleMenu}>
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
                        />
                    </TouchableWithoutFeedback>

                    {/* Bottom Sheet Panel */}
                    <Animated.View
                        entering={SlideInDown.springify().damping(18)}
                        exiting={SlideOutDown}
                        className="bg-white rounded-t-[32px] overflow-hidden shadow-2xl pb-10"
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-8 pt-8 pb-6 bg-white border-b border-gray-50">
                            <View>
                                <Text className="text-2xl font-black text-gray-900 mb-1">새로운 활동 ✨</Text>
                                <Text className="text-gray-400 font-medium text-sm">무엇을 추가하시겠어요?</Text>
                            </View>
                            <TouchableOpacity onPress={toggleMenu} className="bg-gray-100 p-2 rounded-full">
                                <Text style={{ fontSize: 20, color: '#9CA3AF' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Grid Layout */}
                        <View className="flex-row flex-wrap px-6 pt-4">
                            {menuItems.map((item, index) => (
                                <Animated.View
                                    key={index}
                                    entering={FadeInDown.delay(index * 50 + 100).springify()}
                                    className="w-1/2 p-2"
                                >
                                    <TouchableOpacity
                                        onPress={() => item.isMasterOnly && !isMaster ? Alert.alert(t.badge, t.only_notice) : handleAction(item.path)}
                                        activeOpacity={0.7}
                                        className={cn(
                                            "p-5 rounded-3xl border flex-row items-center gap-4 shadow-sm",
                                            item.bgColor,
                                            item.isMasterOnly && !isMaster ? "opacity-60 grayscale" : "border-white"
                                        )}
                                        style={{
                                            // Optional: Add subtle border matching color with low opacity 
                                            borderColor: item.color.replace('bg-', '') === 'yellow-500' ? '#FEF08A' : undefined
                                        }}
                                    >
                                        <View className={cn("w-12 h-12 rounded-2xl items-center justify-center shadow-sm", item.color)}>
                                            <Text style={{ fontSize: 24 }}>
                                                {(item.isMasterOnly && !isMaster) ? "🔒" :
                                                    item.icon === 'trophy' ? '🏆' :
                                                        item.icon === 'calendar' ? '📅' :
                                                            item.icon === 'document-text' ? '📜' :
                                                                item.icon === 'wallet' ? '💰' :
                                                                    item.icon === 'refresh' ? '🔄' :
                                                                        item.icon === 'sparkles' ? '✨' :
                                                                            item.icon === 'cart' ? '🛒' : '•'
                                                }
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-1">
                                                <Text className={cn("font-bold text-base mb-0.5", item.textColor)}>{item.label}</Text>
                                                {item.isMasterOnly && !isMaster && <Text style={{ fontSize: 12 }}>🔒</Text>}
                                            </View>
                                            <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>{item.subLabel}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>

                        {/* Bottom Safe Area Spacer */}
                        <View className="h-8" />
                    </Animated.View>
                </View>
            </Modal>

            {/* FAB Button */}
            {!visible && (
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ position: 'absolute', bottom: 120, right: 24, zIndex: 50 }}>
                    <Pressable
                        onPress={toggleMenu}
                        style={({ pressed }) => [
                            {
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isTossMode ? TDS_COLORS.blue : '#F97316',
                                borderWidth: 4,
                                borderColor: TDS_COLORS.white,
                            },
                            pressed ? TDS_ELEVATION.fabPressed : TDS_ELEVATION.fab,
                        ]}
                    >
                        <Text style={{ fontSize: 36, color: 'white' }}>+</Text>
                    </Pressable>
                </Animated.View>
            )}
        </>
    );
}
