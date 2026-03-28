import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { API_URL } from '../../../constants/Config';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignupScreen() {
    const router = useRouter();
    const { setEmail: setStoreEmail } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSignup = async () => {
        setErrorMessage('');

        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setErrorMessage('모든 정보를 입력해주세요.');
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('올바른 이메일 형식이 아닙니다.');
            return;
        }

        if (password.length < 8) {
            setErrorMessage('비밀번호는 8자리 이상이어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email,
                        password,
                        password_confirmation: confirmPassword
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStoreEmail(email);
                // 프로필 설정을 먼저 진행한 후 nest_choice로 이동
                router.push('/(onboarding)/profile');
            } else {
                if (data.errors) {
                    setErrorMessage(data.errors.join('\n'));
                } else {
                    setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('서버와 통신 중 문제가 발생했습니다. 네트워크 연결을 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <StatusBar style="dark" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* 뒤로가기 */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mb-6 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                >
                    <Ionicons name="arrow-back" size={20} color="#6B7280" />
                </TouchableOpacity>

                {/* 로고 + Eyebrow 영역 */}
                <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10">
                    <Text className="eyebrow text-primary mb-3">MATECHECK</Text>
                    <Text className="text-heading-1 text-gray-900 leading-snug tracking-tight">
                        함께 시작해요
                    </Text>
                    <Text className="text-body text-gray-400 mt-2">
                        우리만의 특별한 공간을 만들어요.
                    </Text>
                </Animated.View>

                {/* 폼 영역 */}
                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} className="w-full gap-4">
                    {/* 에러 메시지 */}
                    {errorMessage ? (
                        <View className="bg-red-50 rounded-2xl p-4 flex-row items-start">
                            <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginTop: 2 }} />
                            <Text className="text-red-500 ml-2 flex-1 text-sm">{errorMessage}</Text>
                        </View>
                    ) : null}

                    {/* 이메일 입력 */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">이메일</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrorMessage('');
                            }}
                            placeholder="example@matecheck.com"
                            placeholderTextColor="#D1D5DB"
                            className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    {/* 비밀번호 입력 */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">비밀번호</Text>
                        <TextInput
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrorMessage('');
                            }}
                            placeholder="영문, 숫자 포함 8자리 이상"
                            placeholderTextColor="#D1D5DB"
                            className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body"
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    {/* 비밀번호 확인 입력 */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">비밀번호 확인</Text>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrorMessage('');
                            }}
                            placeholder="비밀번호 다시 입력"
                            placeholderTextColor="#D1D5DB"
                            className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 text-body"
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>
                </Animated.View>

                {/* 가입 버튼 + 하단 링크 */}
                <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="mt-10">
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isLoading}
                        className={`btn-primary w-full ${isLoading ? 'bg-primary-light' : 'bg-primary active:opacity-90'}`}
                    >
                        <Text className="text-white font-semibold text-base">
                            {isLoading ? '가입 중...' : '가입하고 시작하기'}
                        </Text>
                    </TouchableOpacity>

                    {/* 로그인 링크 */}
                    <View className="flex-row justify-center items-center gap-1 mt-6">
                        <Text className="text-gray-400 text-sm">이미 계정이 있으신가요?</Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-semibold text-sm">로그인</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
