import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { API_URL } from '../../../constants/Config';
import { setAuthToken } from '../../../services/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const router = useRouter();
    const { setNest, setProfile, setEmail: setStoreEmail, setMembers } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        setErrorMessage('');

        if (!email.trim() || !password.trim()) {
            setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email,
                        password
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
                const user = data.user;
                const nest = data.nest;

                if (user.nickname) {
                    setProfile(user.nickname, user.avatar_id || 0, String(user.id));
                } else {
                    setProfile("돌아온 메이트", 0, String(user.id));
                }

                if (nest) {
                    setNest(nest.name, nest.theme_id || 0, nest.invite_code, String(nest.id), '', nest.avatar_id || 100, user.role === 'master');
                    if (nest.members) {
                        setMembers(nest.members.map((m: any) => ({
                            id: String(m.id),
                            nickname: m.nickname,
                            avatarId: m.avatar_id || 0,
                            role: m.role || 'mate',
                            memberType: m.member_type,
                        })));
                    }
                    router.replace('/(tabs)/home');
                } else {
                    router.push('/(onboarding)/nest_choice');
                }
            } else {
                if (response.status === 401) {
                    setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
                } else if (response.status === 422) {
                    setErrorMessage(data.errors?.join('\n') || data.error || '입력 정보를 확인해주세요.');
                } else {
                    setErrorMessage(data.error || '로그인에 실패했습니다. 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error('로그인 오류:', error);
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
                        다시 만나서{'\n'}반가워요
                    </Text>
                    <Text className="text-body text-gray-400 mt-2">
                        소중한 일상을 이어가세요.
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
                                placeholder="비밀번호를 입력해주세요"
                                placeholderTextColor="#D1D5DB"
                                className="w-full bg-gray-50 rounded-2xl p-4 pr-12 text-gray-900 text-body"
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                                onSubmitEditing={handleLogin}
                                returnKeyType="go"
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
                    </View>
                </Animated.View>

                {/* 로그인 버튼 + 하단 링크 */}
                <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="mt-10">
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`btn-primary w-full ${isLoading ? 'bg-primary-light' : 'bg-primary active:opacity-90'}`}
                    >
                        {isLoading ? (
                            <View className="flex-row items-center gap-2">
                                <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <Text className="text-white font-semibold text-base">로그인 중...</Text>
                            </View>
                        ) : (
                            <Text className="text-white font-semibold text-base">로그인</Text>
                        )}
                    </TouchableOpacity>

                    {/* 회원가입 링크 */}
                    <View className="flex-row justify-center items-center gap-1 mt-6">
                        <Text className="text-gray-400 text-sm">계정이 없으신가요?</Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-semibold text-sm">회원가입</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
