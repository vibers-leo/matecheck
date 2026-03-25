import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import { THEMES, NEST_AVATARS } from '../constants/data';
import { cn } from '../lib/utils';
import * as ImagePicker from 'expo-image-picker';
import AvatarPicker from '../components/AvatarPicker';



export default function NestManagementScreen() {
    const router = useRouter();
    const { nestName, nestTheme, nestImage, nestId, setNest, inviteCode, nestAvatarId } = useUserStore();
    const { language } = useUserStore();

    const [name, setName] = useState(nestName);
    const [selectedTheme, setSelectedTheme] = useState(nestTheme);
    const [selectedAvatarId, setSelectedAvatarId] = useState(nestAvatarId || 100);
    const [imageUrl, setImageUrl] = useState(nestImage || '');
    const [isSaving, setIsSaving] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    const pickCustomImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("알림", "보금자리 이름을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nest: {
                        name,
                        theme_id: selectedTheme,
                        avatar_id: selectedAvatarId,
                        image_url: imageUrl
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Update local store
                setNest(data.name, data.theme_id, data.invite_code, data.id.toString(), data.image_url, data.avatar_id);
                Alert.alert("저장 완료", "보금자리 정보가 수정되었습니다.", [
                    { text: "확인", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("오류", "저장에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "네트워크 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header (Modern Simple) */}
            <View className="pt-16 pb-6 px-6 bg-white shadow-sm rounded-b-[40px] mb-8 z-10 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-black text-gray-900">보금자리 관리</Text>
                </View>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={cn("px-5 py-2 rounded-full", isSaving ? "bg-gray-200" : "bg-gray-900")}
                >
                    <Text className={cn("text-sm font-bold", isSaving ? "text-gray-400" : "text-white")}>
                        {isSaving ? "저장 중..." : "저장"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 50 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="gap-8">

                    {/* 1. Nest Profile Card */}
                    <View>
                        <Text className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">Basic Info</Text>
                        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 items-center">

                            {/* Avatar Picker Trigger */}
                            <TouchableOpacity
                                onPress={() => setPickerVisible(true)}
                                className="w-32 h-32 rounded-[32px] bg-gray-50 items-center justify-center mb-6 shadow-orange-500/20 shadow-xl border-4 border-white relative"
                            >
                                <Image
                                    source={(NEST_AVATARS.find(a => a.id === selectedAvatarId) || NEST_AVATARS[0]).image}
                                    style={{ width: '80%', height: '80%' }}
                                    resizeMode="contain"
                                />
                                <View className="absolute -bottom-2 -right-2 bg-gray-900 w-10 h-10 rounded-full border-4 border-white items-center justify-center">
                                    <Ionicons name="camera" size={16} color="white" />
                                </View>
                            </TouchableOpacity>

                            <Text className="text-gray-400 text-xs font-bold mb-6">아이콘을 눌러 변경해보세요</Text>

                            {/* Name Input */}
                            <View className="w-full">
                                <Text className="text-xs font-bold text-gray-900 mb-2 ml-2">보금자리 이름</Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-lg text-gray-900 font-bold w-full"
                                    placeholder="우리 가족만의 이름을 지어주세요"
                                />
                            </View>
                        </View>
                    </View>

                    {/* 2. Theme Selection Card */}
                    <View>
                        <Text className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">Theme Color</Text>
                        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                            <View className="flex-row gap-4 justify-between">
                                {Object.entries(THEMES).map(([id, theme]: [string, any]) => {
                                    const isSelected = selectedTheme === Number(id);
                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            onPress={() => setSelectedTheme(Number(id))}
                                            className={cn(
                                                "w-14 h-14 rounded-2xl items-center justify-center transition-all",
                                                isSelected ? "bg-gray-900 shadow-md transform scale-110" : "bg-gray-50"
                                            )}
                                        >
                                            <Text className="text-2xl">{theme.emoji}</Text>
                                            {isSelected && (
                                                <View className={cn("absolute -bottom-2 w-1.5 h-1.5 rounded-full", theme.bg.replace("bg-", "bg-"))} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <AvatarPicker
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={(id) => setSelectedAvatarId(id)}
                        selectedId={selectedAvatarId}
                        avatars={NEST_AVATARS}
                    />

                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}
