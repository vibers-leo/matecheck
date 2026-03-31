import React, { useEffect, useState } from "react";
import "../../global.css";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { useUserStore } from "../../store/userStore";
import { loadToken, getAuthToken, clearToken } from "../../services/api";
import { API_URL } from "../../constants/Config";

export default function Layout() {
    const { setAppMode, setNest, setProfile, setMembers, setEmail } = useUserStore();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setAppMode('matecheck');
        checkAuthOnStart();
    }, []);

    /** 앱 시작 시 SecureStore에서 토큰 확인 후 자동 로그인 시도 */
    const checkAuthOnStart = async () => {
        try {
            const token = await loadToken();
            if (!token) {
                // 토큰 없으면 인트로 화면 유지
                setIsCheckingAuth(false);
                return;
            }

            // 토큰 유효성 확인: GET /me (또는 적절한 엔드포인트)
            const response = await fetch(`${API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                const nest = data.nest;

                // 프로필 복원
                setEmail(user.email);
                setProfile(user.nickname || user.email.split('@')[0], user.avatar_id || 0, String(user.id));

                if (nest) {
                    // Nest 있으면 홈으로 이동
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
                    // 약간의 딜레이 후 이동 (레이아웃 마운트 보장)
                    setTimeout(() => router.replace('/mate/(tabs)/home'), 100);
                } else {
                    // Nest 없으면 온보딩으로
                    setTimeout(() => router.replace('/mate/(onboarding)/nest_choice'), 100);
                }
            } else {
                // 토큰 만료/무효 → 삭제
                await clearToken();
            }
        } catch (error) {
            console.error('자동 로그인 실패:', error);
            await clearToken();
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // 인증 확인 중 스플래시
    if (isCheckingAuth) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <StatusBar style="dark" />
                <Text className="text-5xl mb-6">🏡</Text>
                <ActivityIndicator size="large" color="#FF7F50" />
                <Text className="text-gray-400 text-sm mt-4 font-medium">로그인 확인 중...</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}
