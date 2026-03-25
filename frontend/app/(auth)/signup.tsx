import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
                router.push('/(onboarding)/nest_choice');
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
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mb-12">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                    >
                        <Ionicons name="arrow-back" size={24} color="#4B5563" />
                    </TouchableOpacity>

                    <Animated.View entering={FadeInDown.duration(800).springify()}>
                        <Text className="text-4xl font-extrabold text-gray-900 mb-3">환영합니다! 🎉</Text>
                        <Text className="text-base text-gray-500 leading-6">
                            메이트체크와 함께{'\n'}우리 가족만의 특별한 공간을 만들어요.
                        </Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="w-full">
                    {/* Error Message */}
                    {errorMessage ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex-row items-start">
                            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginTop: 2 }} />
                            <Text className="text-red-600 ml-2 flex-1">{errorMessage}</Text>
                        </View>
                    ) : null}

                    {/* Email Input */}
                    <View className="mb-5">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">이메일 주소</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrorMessage('');
                            }}
                            placeholder="example@matecheck.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-base"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View className="mb-5">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</Text>
                        <TextInput
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrorMessage('');
                            }}
                            placeholder="영문, 숫자 포함 8자리 이상"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-base"
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호 확인</Text>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrorMessage('');
                            }}
                            placeholder="비밀번호 다시 입력"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-base"
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl items-center shadow-lg shadow-orange-200 mb-6 ${isLoading ? 'bg-orange-300' : 'bg-orange-500 active:bg-orange-600'
                            }`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {isLoading ? '가입 중...' : '가입하고 시작하기'}
                        </Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View className="flex-row justify-center items-center gap-2">
                        <Text className="text-gray-400 text-base">이미 계정이 있으신가요?</Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-orange-600 font-bold text-base">로그인</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
