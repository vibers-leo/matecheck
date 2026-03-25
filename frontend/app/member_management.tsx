import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { AVATARS } from '../constants/data';
import { API_URL } from '../constants/Config';
import Avatar from '../components/Avatar';
import { translations } from '../constants/I18n';

export default function MemberManagementScreen() {
    const router = useRouter();
    const { members, nestId, language, setMembers, isMaster } = useUserStore();
    const tm = (translations[language as keyof typeof translations] as any).master;

    const handleRemoveMember = (memberId: string, nickname: string, role?: string) => {
        if (!isMaster) {
            Alert.alert(tm.badge, tm.only_notice);
            return;
        }
        if (role === 'master') {
            Alert.alert(tm.badge, language === 'ko' ? "방장은 스스로를 내보낼 수 없습니다." : "The master cannot remove themselves.");
            return;
        }
        Alert.alert(
            language === 'ko' ? "멤버 삭제" : "Remove Member",
            language === 'ko' ? `'${nickname}' 님을 내보내시겠습니까?` : `Are you sure you want to remove '${nickname}'?`,
            [
                { text: language === 'ko' ? "취소" : "Cancel", style: "cancel" },
                {
                    text: language === 'ko' ? "삭제" : "Remove",
                    style: "destructive",
                    onPress: async () => {
                        Alert.alert(language === 'ko' ? "알림" : "Notice", language === 'ko' ? "멤버 관리는 아직 준비 중인 기능입니다." : "Member management is coming soon.");
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">{language === 'ko' ? "멤버 관리" : "Member Management"}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-6">
                <Text className="text-gray-500 font-medium mb-4">{language === 'ko' ? "함께하는 가족 구성원" : "Nest Members"}</Text>

                <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                    {members.map((member, index) => (
                        <View
                            key={member.id}
                            className={`flex-row items-center justify-between p-4 ${index !== members.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <View className="flex-row items-center gap-4">
                                <Avatar
                                    source={(AVATARS[member.avatarId] || AVATARS[0]).image}
                                    size="md"
                                />
                                <View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-lg font-bold text-gray-900">{member.nickname}</Text>
                                        {member.role === 'master' && (
                                            <View className="bg-yellow-400 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                                                <Ionicons name="star" size={10} color="white" />
                                                <Text className="text-white text-[10px] font-black uppercase">{tm.badge}</Text>
                                            </View>
                                        )}
                                        {member.memberType && !member.role && (
                                            <View className="bg-orange-100 px-2 py-0.5 rounded-md">
                                                <Text className="text-orange-600 text-[10px] font-bold uppercase">{member.memberType}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-400 text-xs">ID: {member.id.substring(0, 8)}...</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => handleRemoveMember(member.id, member.nickname, member.role)} className="p-2">
                                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add Member Button */}
                <TouchableOpacity
                    onPress={() => router.push('/add_member')}
                    className="mt-6 bg-white border border-gray-200 border-dashed rounded-3xl p-6 flex-row items-center justify-center gap-2 active:bg-gray-50"
                >
                    <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center">
                        <Ionicons name="add" size={24} color="#F97316" />
                    </View>
                    <Text className="text-gray-600 font-bold text-lg">{language === 'ko' ? "새로운 멤버 초대/추가하기" : "Invite/Add New Member"}</Text>
                </TouchableOpacity>

                <View className="mt-8">
                    <Text className="text-gray-400 text-xs text-center leading-5">
                        {language === 'ko'
                            ? "가족 구성원을 추가하고 함께 보금자리를 꾸며보세요.\n초대 코드를 공유하거나, 자녀/반려동물 프로필을 직접 생성할 수 있어요."
                            : "Add members to your nest.\nShare invite codes or create profiles for kids and pets."}
                    </Text>
                </View>
            </ScrollView >
        </View >
    );
}
