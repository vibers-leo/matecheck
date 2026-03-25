import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { AVATARS } from '../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';

const MEMBER_TYPES = [
    { type: 'baby', label: '아기', emoji: '👶', defaultAvatarId: 2 },
    { type: 'pet', label: '반려동물', emoji: '🐶', defaultAvatarId: 4 },
    { type: 'plant', label: '반려식물', emoji: '🪴', defaultAvatarId: 6 },
    { type: 'ai', label: 'AI 메이트', emoji: '🤖', defaultAvatarId: 7 },
];

export default function AddMemberScreen() {
    const router = useRouter();
    const { inviteCode, addManagedMember } = useUserStore();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(0);

    const handleSelectType = (type: string, defaultAvatarId: number) => {
        setSelectedType(type);
        setSelectedAvatarId(defaultAvatarId);
    };

    const handleAdd = async () => {
        if (!selectedType || !nickname.trim()) return;

        await addManagedMember(nickname, selectedAvatarId, selectedType);
        Alert.alert("성공", "새로운 메이트가 추가되었습니다!");
        router.back();
    };

    return (
        <View className="flex-1 bg-white pt-12 px-6">
            <View className="flex-row items-center mb-8">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">메이트 추가</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Invite Code Section */}
                <View className="bg-orange-50 p-6 rounded-3xl mb-8 border border-orange-100">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                            <Ionicons name="share-social" size={20} color="#F97316" />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-800">가족 초대하기</Text>
                            <Text className="text-gray-500 text-xs">코드를 공유해서 메이트를 초대하세요.</Text>
                        </View>
                    </View>
                    <View className="bg-white p-4 rounded-2xl items-center border border-orange-200 border-dashed">
                        <Text className="text-3xl font-black text-orange-500 tracking-widest">{inviteCode}</Text>
                    </View>
                </View>

                {/* 2. Managed Member Types */}
                <Text className="text-lg font-bold text-gray-800 mb-4">함께 사는 메이트 추가</Text>

                <View className="flex-row flex-wrap gap-3 mb-8">
                    {MEMBER_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.type}
                            onPress={() => handleSelectType(type.type, type.defaultAvatarId)}
                            className={cn(
                                "flex-1 min-w-[45%] p-4 rounded-2xl border items-center justify-center gap-2",
                                selectedType === type.type
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-white border-gray-100"
                            )}
                        >
                            <Text className="text-3xl">{type.emoji}</Text>
                            <Text className={cn(
                                "font-bold",
                                selectedType === type.type ? "text-white" : "text-gray-600"
                            )}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 3. Input Section (Visible when type selected) */}
                {selectedType && (
                    <Animated.View entering={FadeInDown.springify()} className="bg-gray-50 p-6 rounded-3xl mb-10 border border-gray-100">
                        <View className="items-center mb-6">
                            <TouchableOpacity
                                onPress={() => setSelectedAvatarId((prev) => (prev + 1) % AVATARS.length)}
                                className="w-20 h-20 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm"
                            >
                                <Image
                                    source={(AVATARS[selectedAvatarId] || AVATARS[0]).image}
                                    className="w-16 h-16 rounded-full"
                                />
                                <View className="absolute bottom-0 right-0 bg-gray-900 p-1 rounded-full">
                                    <Ionicons name="refresh" size={12} color="white" />
                                </View>
                            </TouchableOpacity>
                            <Text className="text-xs text-gray-400 mt-2">터치해서 모습 변경</Text>
                        </View>

                        <Text className="text-sm font-bold text-gray-600 mb-2 ml-1">이름 / 애칭</Text>
                        <TextInput
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="이름을 입력해주세요"
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg mb-4"
                            autoFocus
                        />

                        <TouchableOpacity
                            onPress={handleAdd}
                            disabled={!nickname.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center",
                                nickname.trim() ? "bg-gray-900" : "bg-gray-300"
                            )}
                        >
                            <Text className="text-white font-bold text-lg">추가하기</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}
