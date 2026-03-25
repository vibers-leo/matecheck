import React, { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../store/userStore";
import TossNavBar from "../components/TossNavBar";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../components/ErrorBoundary';
import { checkAutoLogin } from '../utils/auth';

// Fix for NativeWind v4 web: Cannot manually set color scheme
if (typeof StyleSheet.setFlag === 'function') {
    StyleSheet.setFlag('darkMode', 'class');
}

export default function Layout() {
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
    if (!hydrated || isCheckingAuth) {
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
