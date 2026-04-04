import React, { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../store/userStore";
import TossNavBar from "../components/TossNavBar";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../components/ErrorBoundary';
import { checkAutoLogin } from '../utils/auth';
import { useFonts } from 'expo-font';

// Fix for NativeWind v4 web: Cannot manually set color scheme
if (typeof StyleSheet.setFlag === 'function') {
    StyleSheet.setFlag('darkMode', 'class');
}

// react-native의 모든 Text에 Paperlogy-Regular 기본 적용
// (fontWeight는 components/Text.tsx 래퍼가 올바른 파일명으로 변환)
const originalTextRender = (Text as any).render;
(Text as any).defaultProps = {
    ...(Text as any).defaultProps,
    style: { fontFamily: 'Paperlogy-Regular' },
};

export default function Layout() {
    const [fontsLoaded] = useFonts({
        'Paperlogy-Regular': require('../assets/fonts/Paperlogy-4Regular.ttf'),
        'Paperlogy-Medium': require('../assets/fonts/Paperlogy-5Medium.ttf'),
        'Paperlogy-SemiBold': require('../assets/fonts/Paperlogy-6SemiBold.ttf'),
        'Paperlogy-Bold': require('../assets/fonts/Paperlogy-7Bold.ttf'),
        'Paperlogy-ExtraBold': require('../assets/fonts/Paperlogy-8ExtraBold.ttf'),
    });

    const { appMode, setEmail } = useUserStore();
    const [hydrated, setHydrated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            // 1. Zustand 하이드레이션 대기
            setHydrated(true);

            // 2. 자동 로그인 체크
            try {
                const { isLoggedIn, email } = await checkAutoLogin();

                if (isLoggedIn && email) {
                    // 사용자 정보 복원
                    setEmail(email);

                    if (__DEV__) {
                        console.log('✅ Auto login successful:', email);
                    }
                } else {
                    if (__DEV__) {
                        console.log('ℹ️ No valid session found');
                    }
                }
            } catch (error) {
                console.error('Auto login error:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        initializeApp();
    }, [setEmail]);

    // 로딩 중이면 스플래시 화면 표시
    if (!hydrated || isCheckingAuth || !fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066FF" />
            </View>
        );
    }

    const isTossMode = appMode === 'roommatecheck';

    return (
        <ErrorBoundary>
            <StatusBar style={isTossMode ? "dark" : "auto"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: isTossMode ? { backgroundColor: '#F2F4F6' } : undefined,
                    animation: isTossMode ? 'slide_from_right' : 'default',
                }}
            />
            {/* Toast는 모든 화면 위에 표시되어야 하므로 마지막에 배치 */}
            <Toast />
        </ErrorBoundary>
    );
}
