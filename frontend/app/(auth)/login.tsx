import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const router = useRouter();
    const { setNest, setProfile, setEmail: setStoreEmail, setMembers } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStoreEmail(email);
                const user = data.user;
                const nest = data.nest;

                if (user.nickname) {
                    setProfile(user.nickname, user.avatar_id || 0, String(user.id));
                } else {
                    setProfile("돌아온 메이트", 0, String(user.id));
                }

                if (nest) {
                    setNest(nest.name, nest.theme_id, nest.invite_code, String(nest.id));
                    setMembers(nest.members);
                    router.replace('/(tabs)/home');
                } else {
                    router.push('/(onboarding)/nest_choice');
                }
            } else {
                if (response.status === 401) {
                    setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
                } else {
                    setErrorMessage(data.error || '로그인에 실패했습니다. 다시 시도해주세요.');
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
                        <Text className="text-4xl font-extrabold text-gray-900 mb-3">반가워요! 👋</Text>
                        <Text className="text-base text-gray-500 leading-6">
                            가족과의 소중한 일상,{'\n'}메이트체크에서 다시 이어가세요.
                        </Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="w-full">
                    {/* Error Message */}
                    {errorMessage ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex-row items-center">
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
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
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</Text>
                        <TextInput
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrorMessage('');
                            }}
                            placeholder="비밀번호를 입력해주세요"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-base"
                            secureTextEntry
                            editable={!isLoading}
                            onSubmitEditing={handleLogin}
                            returnKeyType="go"
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl items-center shadow-lg shadow-orange-200 mb-6 ${isLoading ? 'bg-orange-300' : 'bg-orange-500 active:bg-orange-600'
                            }`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {isLoading ? '로그인 중...' : '로그인하기'}
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center gap-2">
                        <Text className="text-gray-400 text-base">계정이 없으신가요?</Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-orange-600 font-bold text-base">회원가입</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
