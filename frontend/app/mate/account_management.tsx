import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AccountManagementScreen() {
    const router = useRouter();
    const { updatePassword, deleteAccount, logout } = useUserStore();

    // UI State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    // Modals
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("오류", "새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        const result = await updatePassword(currentPassword, newPassword, confirmPassword);
        setLoading(false);

        if (result.success) {
            Alert.alert("성공", "비밀번호가 변경되었습니다.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            Alert.alert("실패", result.error || "비밀번호 변경에 실패했습니다.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirmPassword) return;

        setLoading(true);
        const result = await deleteAccount(deleteConfirmPassword);
        setLoading(false);

        if (result.success) {
            setDeleteModalVisible(false);
            Alert.alert("탈퇴 완료", "계정이 삭제되었습니다. 이용해 주셔서 감사합니다.", [
                { text: "확인", onPress: () => router.replace('/') }
            ]);
        } else {
            Alert.alert("실패", result.error || "계정 삭제에 실패했습니다.");
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 pb-4 px-6 border-b border-gray-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">계정 관리</Text>
            </View>

            <Animated.ScrollView
                entering={FadeInDown.duration(300)}
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 비밀번호 변경 섹션 */}
                <View className="mb-10">
                    <Text className="text-lg font-bold text-gray-800 mb-4">비밀번호 변경</Text>

                    <View className="gap-3">
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="현재 비밀번호"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                        />
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="새 비밀번호 (6자 이상)"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                        />
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="새 비밀번호 확인"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                        />

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={loading}
                            className={cn(
                                "py-4 rounded-xl items-center mt-2",
                                loading ? "bg-gray-300" : "bg-gray-900"
                            )}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">비밀번호 변경하기</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 회원 탈퇴 섹션 */}
                <View className="mt-8 pt-8 border-t border-gray-100">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="warning-outline" size={24} color="#EF4444" />
                        <Text className="text-lg font-bold text-red-500">회원 탈퇴</Text>
                    </View>

                    <View className="bg-red-50 p-5 rounded-2xl mb-6 border border-red-100">
                        <Text className="text-gray-700 font-bold mb-2">⚠ 주의사항</Text>
                        <Text className="text-gray-600 text-sm leading-6 mb-2">
                            • 탈퇴 시 닉네임, 프로필, 활동 기록 등 계정 정보가 즉시 삭제되며 복구할 수 없습니다.
                        </Text>
                        <Text className="text-gray-600 text-sm leading-6">
                            • <Text className="font-bold text-gray-800">보금자리는 유지됩니다.</Text> 다른 가족 구성원이 있다면 그들은 계속해서 보금자리를 이용할 수 있습니다. (단, 혼자 사용 중인 경우 보금자리도 함께 삭제됩니다.)
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setDeleteModalVisible(true)}
                        className="py-4 bg-white border border-red-200 rounded-xl items-center shadow-sm active:bg-red-50"
                    >
                        <Text className="text-red-500 font-bold text-lg">계정 영구 삭제</Text>
                    </TouchableOpacity>
                </View>

            </Animated.ScrollView>

            {/* 탈퇴 확인 모달 */}
            <Modal
                transparent
                visible={deleteModalVisible}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold text-gray-900 mb-2">정말 탈퇴하시겠습니까?</Text>
                        <Text className="text-gray-500 mb-6">본인 확인을 위해 현재 비밀번호를 입력해주세요.</Text>

                        <TextInput
                            value={deleteConfirmPassword}
                            onChangeText={setDeleteConfirmPassword}
                            placeholder="비밀번호 입력"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-lg"
                            autoFocus
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                className="flex-1 py-4 bg-gray-100 rounded-xl items-center"
                            >
                                <Text className="font-bold text-gray-600">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                disabled={!deleteConfirmPassword || loading}
                                className={cn(
                                    "flex-1 py-4 rounded-xl items-center",
                                    (!deleteConfirmPassword || loading) ? "bg-red-200" : "bg-red-500"
                                )}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold text-white">탈퇴</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
