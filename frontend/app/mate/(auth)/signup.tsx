import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { API_URL } from '../../../constants/Config';
import { setAuthToken } from '../../../services/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignupScreen() {
    const router = useRouter();
    const { setEmail: setStoreEmail, setProfile } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

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
                // JWT 토큰 SecureStore에 저장
                if (data.token) {
                    await setAuthToken(data.token);
                }

                setStoreEmail(email);

                // 유저 정보가 있으면 프로필에 반영
                if (data.user) {
                    setProfile(
                        data.user.nickname || email.split('@')[0],
                        data.user.avatar_id || 0,
                        String(data.user.id)
                    );
                }

                // 프로필 설정을 먼저 진행한 후 nest_choice로 이동
                router.push('/(onboarding)/profile');
            } else {
                if (response.status === 422 && data.errors) {
                    // Rails validation 에러 (배열 형태)
                    const errorList = Array.isArray(data.errors)
                        ? data.errors.join('\n')
                        : typeof data.errors === 'object'
                            ? Object.values(data.errors).flat().join('\n')
                            : String(data.errors);
                    setErrorMessage(errorList);
                } else {
                    setErrorMessage(data.error || '회원가입에 실패했습니다. 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            setErrorMessage('서버와 통신 중 문제가 발생했습니다.\n네트워크 연결을 확인해주세요.');
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
                        <Animated.View entering={FadeInDown.duration(300)} className="bg-red-50 rounded-2xl p-4 flex-row items-start">
                            <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginTop: 2 }} />
                            <Text className="text-red-500 ml-2 flex-1 text-sm leading-5">{errorMessage}</Text>
                        </Animated.View>
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
                            autoComplete="email"
                            editable={!isLoading}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                    </View>

                    {/* 비밀번호 입력 */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">비밀번호</Text>
                        <View className="relative">
                            <TextInput
                                ref={passwordRef}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrorMessage('');
                                }}
                                placeholder="영문, 숫자 포함 8자리 이상"
                                placeholderTextColor="#D1D5DB"
                                className="w-full bg-gray-50 rounded-2xl p-4 pr-12 text-gray-900 text-body"
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                                returnKeyType="next"
                                onSubmitEditing={() => confirmRef.current?.focus()}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* 비밀번호 강도 표시 */}
                        {password.length > 0 && (
                            <View className="flex-row items-center gap-2 mt-2 ml-1">
                                <View className="flex-row gap-1 flex-1">
                                    <View className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-red-300'}`} />
                                    <View className={`h-1 flex-1 rounded-full ${password.length >= 10 ? 'bg-green-400' : 'bg-gray-200'}`} />
                                    <View className={`h-1 flex-1 rounded-full ${password.length >= 12 && /[!@#$%^&*]/.test(password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                                </View>
                                <Text className={`text-xs ${password.length >= 8 ? 'text-green-500' : 'text-red-400'}`}>
                                    {password.length < 8 ? `${password.length}/8자` : '사용 가능'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* 비밀번호 확인 입력 */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">비밀번호 확인</Text>
                        <View className="relative">
                            <TextInput
                                ref={confirmRef}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrorMessage('');
                                }}
                                placeholder="비밀번호 다시 입력"
                                placeholderTextColor="#D1D5DB"
                                className="w-full bg-gray-50 rounded-2xl p-4 pr-12 text-gray-900 text-body"
                                secureTextEntry={!showConfirmPassword}
                                editable={!isLoading}
                                returnKeyType="go"
                                onSubmitEditing={handleSignup}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-4"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* 비밀번호 일치 표시 */}
                        {confirmPassword.length > 0 && (
                            <View className="flex-row items-center gap-1 mt-2 ml-1">
                                <Ionicons
                                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                                    size={14}
                                    color={password === confirmPassword ? "#22C55E" : "#EF4444"}
                                />
                                <Text className={`text-xs ${password === confirmPassword ? 'text-green-500' : 'text-red-400'}`}>
                                    {password === confirmPassword ? '비밀번호 일치' : '비밀번호 불일치'}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* 가입 버튼 + 하단 링크 */}
                <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="mt-10">
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isLoading}
                        className={`btn-primary w-full ${isLoading ? 'bg-primary-light' : 'bg-primary active:opacity-90'}`}
                    >
                        {isLoading ? (
                            <View className="flex-row items-center gap-2">
                                <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <Text className="text-white font-semibold text-base">가입 중...</Text>
                            </View>
                        ) : (
                            <Text className="text-white font-semibold text-base">가입하고 시작하기</Text>
                        )}
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
