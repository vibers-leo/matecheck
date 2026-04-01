import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function DevGateway() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#F2F4F7]">
            <StatusBar style="dark" />

            <View className="flex-1 px-8 pt-24 pb-12 items-center justify-center">
                
                {/* 헤더 섹션 */}
                <Animated.View entering={FadeInDown.duration(800)} className="items-center mb-16">
                    <View className="w-24 h-24 bg-white rounded-[32px] items-center justify-center shadow-sm mb-8">
                        <Text className="text-5xl">🛠️</Text>
                    </View>
                    <Text className="text-[#191F28] text-4xl font-black tracking-tight mb-3">Dev Gateway</Text>
                    <Text className="text-[#6B7684] text-lg font-bold text-center">
                        Secure access to portfolio services.{"\n"}Select an environment to proceed.
                    </Text>
                </Animated.View>

                {/* 버튼 그리드 */}
                <View className="w-full max-w-[400px] gap-4">
                    
                    <Animated.View entering={FadeInUp.delay(200)}>
                        <TouchableOpacity
                            onPress={() => router.push('/toss')}
                            activeOpacity={0.85}
                            className="w-full bg-white p-8 rounded-[40px] flex-row items-center border border-gray-100 shadow-sm"
                        >
                            <View className="w-16 h-16 bg-[#EBF4FF] rounded-2xl items-center justify-center mr-5">
                                <Ionicons name="apps-sharp" size={32} color="#0064FF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#0064FF] text-xl font-black mb-1">App In Toss</Text>
                                <Text className="text-[#8B95A1] text-sm font-bold">Roommate Check (MiniApp)</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(400)}>
                        <TouchableOpacity
                            onPress={() => router.push('/mate')}
                            activeOpacity={0.85}
                            className="w-full bg-white p-8 rounded-[40px] flex-row items-center border border-gray-100 shadow-sm"
                        >
                            <View className="w-16 h-16 bg-[#FFF4ED] rounded-2xl items-center justify-center mr-5">
                                <Ionicons name="home-sharp" size={32} color="#FF7F50" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#FF7F50] text-xl font-black mb-1">MateCheck</Text>
                                <Text className="text-[#8B95A1] text-sm font-bold">Standalone Native Version</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    </Animated.View>

                </View>

                {/* 푸터 */}
                <Animated.View entering={FadeIn.delay(800)} className="absolute bottom-16 items-center">
                    <View className="bg-white/50 px-4 py-2 rounded-full border border-gray-200">
                        <Text className="text-[#ADB5BD] text-[10px] font-black uppercase tracking-widest">
                            Env: <Text className="text-[#495057]">Local Development</Text>
                        </Text>
                    </View>
                </Animated.View>

            </View>
        </View>
    );
}
