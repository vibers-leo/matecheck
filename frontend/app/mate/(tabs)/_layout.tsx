import { Tabs, useRouter } from 'expo-router';
import { View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../../store/userStore';
import React, { useEffect } from 'react';

export default function TabLayout() {
    const { isLoggedIn, language, appMode } = useUserStore();
    const router = useRouter();

    const isTossMode = appMode === 'roommatecheck';

    useEffect(() => {
        if (!isLoggedIn) {
            Alert.alert(
                language === 'ko' ? "로그인 필요" : "Login Required",
                language === 'ko' ? "로그인이 필요한 서비스입니다." : "Please login to continue.",
                [{ text: "OK", onPress: () => router.replace('/') }]
            );
        }
    }, [isLoggedIn]);

    const titles = {
        ko: isTossMode
            ? { home: "홈", plan: "가계부", rules: "규칙", activity: "알림", settings: "더보기", budget: "정산/송금", anniversary: "디데이" }
            : { home: "우리 집", plan: "일정", rules: "약속", activity: "활동", settings: "설정", budget: "정산", anniversary: "기념일" },
        en: { home: "Home", plan: "Plan", rules: "Rules", activity: "Activity", settings: "Settings", budget: "Budget", anniversary: "Anniversary" }
    }[language] || { home: "Home", plan: "Plan", rules: "Rules", activity: "Activity", settings: "Settings", budget: "Budget", anniversary: "Anniversary" };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    height: 90,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: isTossMode ? '#3182F6' : '#FF7F50',
                tabBarInactiveTintColor: isTossMode ? '#ADB5BD' : '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 4,
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: titles.home,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="rules"
                options={{
                    title: titles.rules,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="plan"
                options={{
                    title: titles.plan,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="budget"
                options={{
                    title: titles.budget,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: titles.settings,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
                    )
                }}
            />

            {/* Hidden Tabs (accessible via navigation, but not on tab bar) */}
            <Tabs.Screen
                name="activity"
                options={{
                    title: titles.activity,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="anniversary"
                options={{
                    title: titles.anniversary,
                    href: null,
                }}
            />
        </Tabs>
    );
}
