// App.tsx — 루트 컴포넌트
// NavigationContainer + Stack (Intro → Main Tabs)
// 풀스크린, 라이트 모드 고정, TossNavBar, 종료 확인 모달

import React, { useState, useCallback } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TDSProvider } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';

import { COLORS } from './constants/config';
import { useAuthStore } from './store/authStore';

// 스크린
import IntroScreen from './screens/IntroScreen';
import HomeScreen from './screens/HomeScreen';
import TodoScreen from './screens/TodoScreen';
import BudgetScreen from './screens/BudgetScreen';
import RulesScreen from './screens/RulesScreen';
import SettingsScreen from './screens/SettingsScreen';

// 컴포넌트
import TossNavBar from './components/TossNavBar';
import ExitModal from './components/ExitModal';

// --- 네비게이션 타입 ---
type RootStackParamList = {
  Intro: undefined;
  Main: undefined;
};

type TabParamList = {
  Home: undefined;
  Todo: undefined;
  Budget: undefined;
  Rules: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// --- 탭 아이콘 라벨 ---
const TAB_CONFIG: Record<keyof TabParamList, { label: string; icon: string }> = {
  Home: { label: '홈', icon: '🏠' },
  Todo: { label: '할일', icon: '✅' },
  Budget: { label: '가계부', icon: '💰' },
  Rules: { label: '규칙', icon: '📋' },
  Settings: { label: '설정', icon: '⚙️' },
};

// --- 메인 탭 네비게이터 ---
function MainTabs() {
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  // 종료 모달 열기
  const handleClosePress = useCallback(() => {
    setExitModalVisible(true);
  }, []);

  // 종료 확인
  const handleExitConfirm = useCallback(() => {
    setExitModalVisible(false);
    // TODO: 토스 앱으로 돌아가기 (AppsInToss.exit() 등)
    logout();
  }, [logout]);

  return (
    <View style={styles.mainContainer}>
      {/* 토스 네비게이션 바 */}
      <TossNavBar
        title="룸메이트체크"
        onMorePress={() => {
          // TODO: 더보기 메뉴 (공유, 신고 등)
        }}
        onClosePress={handleClosePress}
      />

      {/* 탭 네비게이터 */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.tossBLue,
          tabBarInactiveTintColor: COLORS.gray400,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.gray100,
            borderTopWidth: 0.5,
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabel: ({ focused }) => (
            <Txt
              typography="t7"
              fontWeight={focused ? 'bold' : undefined}
              color={focused ? COLORS.tossBLue : COLORS.gray400}
            >
              {TAB_CONFIG[route.name as keyof TabParamList].label}
            </Txt>
          ),
          tabBarIcon: ({ focused }) => (
            <Txt typography="t5" style={{ opacity: focused ? 1 : 0.6 }}>
              {TAB_CONFIG[route.name as keyof TabParamList].icon}
            </Txt>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Todo" component={TodoScreen} />
        <Tab.Screen name="Budget" component={BudgetScreen} />
        <Tab.Screen name="Rules" component={RulesScreen} />
        <Tab.Screen name="Settings">
          {() => (
            <SettingsScreen
              onLogout={() => {
                // 로그아웃 후 인트로로 이동은 Stack 레벨에서 처리
              }}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* 종료 확인 모달 */}
      <ExitModal
        visible={exitModalVisible}
        onCancel={() => setExitModalVisible(false)}
        onConfirm={handleExitConfirm}
      />
    </View>
  );
}

// --- 루트 앱 ---
export default function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <SafeAreaProvider>
      <TDSProvider>
        {/* 라이트 모드 고정 */}
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            {isLoggedIn ? (
              <Stack.Screen name="Main" component={MainTabs} />
            ) : (
              <Stack.Screen name="Intro" component={IntroScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </TDSProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
