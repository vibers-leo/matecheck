import { View, Text, Pressable, Dimensions, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  CheckSquare, 
  Megaphone, 
  ChevronRight, 
  Plus, 
  MessageSquare,
  Sparkles,
  Heart
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeInDown, 
    FadeInUp,
    FadeInRight
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { fetchChoreRotation, Chore } from "@/lib/api";

const { width } = Dimensions.get('window');

export default function MateHome() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const { data: chores = [] as Chore[], refetch, isLoading } = useQuery<Chore[]>({
        queryKey: ["chores"],
        queryFn: fetchChoreRotation,
        initialData: [],
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const displayChores: Chore[] = chores.length > 0 ? chores : [
        { id: "1", title: "거실 청소", assignee: "주노", due_date: "오늘", status: "pending" },
        { id: "2", title: "분리수거", assignee: "민지", due_date: "내일", status: "pending" }
    ];

    return (
        <ScrollView 
            className="flex-1 bg-[#fff8f5]"
            contentContainerClassName="pb-12"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff7f50" />
            }
        >
            <StatusBar style="dark" />

            {/* 프리미엄 헤더 & 메인 배너 */}
            <View className="bg-white rounded-b-[50px] shadow-2xl shadow-orange-100 overflow-hidden">
                <LinearGradient
                    colors={["#ff7f50", "#ff4500"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pt-20 pb-24 px-8"
                >
                    <Animated.View entering={FadeInDown.duration(800)}>
                        <View className="flex-row items-center justify-between mb-10">
                            <View className="flex-row items-center gap-3">
                                <View className="p-3 bg-white/20 rounded-[22px] border border-white/30 backdrop-blur-xl">
                                    <Home size={24} color="#fff" strokeWidth={2.5} />
                                </View>
                                <Text className="text-white text-2xl font-black tracking-tight">MateCheck</Text>
                            </View>
                            <Pressable className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                                <Sparkles size={20} color="#fff" />
                            </Pressable>
                        </View>

                        <View className="mb-8">
                            <Text className="text-orange-100 text-lg font-bold">즐거운 공동생활의 시작</Text>
                            <Text className="text-white text-4xl font-black mt-2 leading-[48px]">
                                함께하는 공간,{"\n"}
                                <Text className="text-orange-200">더 스마트하게</Text>
                            </Text>
                        </View>

                        <Pressable 
                            onPress={() => router.push("/mate/(tabs)/home")}
                            className="bg-white px-10 py-5 rounded-[24px] shadow-xl shadow-orange-900/20 active:opacity-90 flex-row items-center justify-center gap-3"
                        >
                            <Heart size={20} color="#ff7f50" fill="#ff7f50" />
                            <Text className="text-orange-600 text-lg font-black uppercase tracking-wider">우리 집 관리하기</Text>
                        </Pressable>
                    </Animated.View>
                </LinearGradient>
            </View>

            {/* 퀵 메뉴 */}
            <View className="px-6 -mt-10">
                <Animated.View 
                    entering={FadeInUp.delay(400)} 
                    className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-slate-50 flex-row items-center justify-around"
                >
                    {[
                        { icon: Users, label: "멤버", color: "#6366f1" },
                        { icon: Calendar, label: "일정", color: "#ec4899" },
                        { icon: CreditCard, label: "정산", color: "#10b981" },
                        { icon: CheckSquare, label: "집안일", color: "#f59e0b" }
                    ].map((item, idx) => (
                        <Pressable key={idx} className="items-center gap-2">
                            <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center">
                                <item.icon size={22} color={item.color} />
                            </View>
                            <Text className="text-slate-600 text-xs font-black">{item.label}</Text>
                        </Pressable>
                    ))}
                </Animated.View>
            </View>

            {/* 오늘의 할 일 */}
            <View className="px-8 mt-12">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-slate-900 text-2xl font-black">오늘의 집안일</Text>
                    <Pressable className="bg-orange-50 px-4 py-2 rounded-full">
                        <Text className="text-orange-500 text-xs font-black">전체보기</Text>
                    </Pressable>
                </View>

                {displayChores.map((chore: Chore, idx: number) => (
                    <Animated.View 
                        key={chore.id}
                        entering={FadeInRight.delay(500 + (idx * 150))}
                        className="bg-white p-6 rounded-[32px] mb-4 border border-slate-100 shadow-sm flex-row items-center"
                    >
                        <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center mr-5">
                            <CheckSquare size={24} color="#ff7f50" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 font-black text-lg">{chore.title}</Text>
                            <View className="flex-row items-center mt-1 gap-3">
                                <View className="flex-row items-center gap-1">
                                    <Users size={12} color="#94a3b8" />
                                    <Text className="text-slate-400 text-xs font-bold">{chore.assignee}</Text>
                                </View>
                                <View className="w-1 h-1 rounded-full bg-slate-200" />
                                <Text className="text-orange-500 text-xs font-black">{chore.due_date}</Text>
                            </View>
                        </View>
                        <Pressable className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                            <ChevronRight size={18} color="#cbd5e1" />
                        </Pressable>
                    </Animated.View>
                ))}
            </View>

            {/* 공지사항 띠 배너 */}
            <View className="px-8 mt-8">
                <LinearGradient
                    colors={["#1e293b", "#0f172a"]}
                    className="rounded-[28px] p-6 flex-row items-center gap-4"
                >
                    <View className="w-10 h-10 bg-indigo-500 rounded-xl items-center justify-center">
                        <Megaphone size={18} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-black text-sm">이번 주 관리비 정산일입니다</Text>
                        <Text className="text-slate-400 text-[10px] mt-1 font-bold">잊지 말고 확인해 주세요!</Text>
                    </View>
                    <ChevronRight size={16} color="#475569" />
                </LinearGradient>
            </View>

            {/* 새로운 메이트 초대 */}
            <View className="px-8 mt-8 mb-10">
                <Pressable className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-8 items-center justify-center gap-3">
                    <View className="w-12 h-12 bg-slate-50 rounded-full items-center justify-center">
                        <Plus size={24} color="#94a3b8" />
                    </View>
                    <Text className="text-slate-400 font-black text-base">새로운 메이트 초대하기</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
