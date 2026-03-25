import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import { AVATARS } from '../../constants/data';
import { translations } from '../../constants/I18n';
import Avatar from '../../components/Avatar';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { nickname, avatarId, userId, setProfile, language } = useUserStore();
    const t = translations[language];

    const [newNickname, setNewNickname] = useState(nickname);
    const [selectedAvatarId, setSelectedAvatarId] = useState(avatarId);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!newNickname.trim()) {
            Alert.alert(t.common.error, language === 'ko' ? "닉네임을 입력해주세요." : "Please enter nickname.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    nickname: newNickname,
                    avatar_id: selectedAvatarId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.nickname, data.avatar_id);
                Alert.alert(t.common.success, language === 'ko' ? "프로필이 수정되었습니다." : "Profile updated.", [
                    { text: t.common.ok, onPress: () => router.back() }
                ]);
            } else {
                Alert.alert(t.common.error, language === 'ko' ? "저장에 실패했습니다." : "Failed to save.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t.common.error, t.common.network_error);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">{language === 'ko' ? "프로필 수정" : "Edit Profile"}</Text>
                    </View>
                    <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                        <Text className={`text-lg font-bold ${isSaving ? 'text-gray-300' : 'text-orange-600'}`}>
                            {isSaving ? (language === 'ko' ? "저장 중" : "Saving") : (language === 'ko' ? "완료" : "Done")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Avatar Selection */}
                <View className="items-center mb-8">
                    <Text className="text-sm font-bold text-gray-900 mb-4">{language === 'ko' ? "아바타 선택" : "Choose Avatar"}</Text>

                    {/* Main Preview - Now Squircle 1:1 */}
                    <View className="mb-4">
                        <Avatar
                            source={selectedAvatar.image}
                            size="2xl"
                            borderColor="#FFEDD5"
                            borderWidth={4}
                        />
                    </View>

                    <Text className="text-xs text-gray-400 mb-6">{language === 'ko' ? "아이콘을 눌러 캐릭터를 변경하세요" : "Tap icon to change character"}</Text>

                    {/* Avatar Grid */}
                    <View className="flex-row flex-wrap justify-center gap-4 max-w-sm">
                        {AVATARS.map((avatar) => (
                            <TouchableOpacity
                                key={avatar.id}
                                onPress={() => setSelectedAvatarId(avatar.id)}
                                className={`p-1 rounded-[22px] ${selectedAvatarId === avatar.id
                                    ? 'bg-orange-500 shadow-md'
                                    : 'bg-transparent'
                                    }`}
                            >
                                <Avatar
                                    source={avatar.image}
                                    size="md"
                                    borderColor={selectedAvatarId === avatar.id ? "#F97316" : "#E5E7EB"}
                                    borderWidth={selectedAvatarId === avatar.id ? 2 : 1}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Nickname Input */}
                <View className="mt-4">
                    <Text className="text-sm font-bold text-gray-900 mb-2">{language === 'ko' ? "닉네임" : "Nickname"}</Text>
                    <TextInput
                        value={newNickname}
                        onChangeText={setNewNickname}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-lg text-gray-900 shadow-sm"
                        placeholder={language === 'ko' ? "닉네임을 입력하세요" : "Enter nickname"}
                        maxLength={20}
                    />
                    <View className="flex-row justify-end mt-2">
                        <Text className="text-xs text-gray-400">{newNickname.length} / 20</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
