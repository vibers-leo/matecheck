import { View, Text, TouchableOpacity, Dimensions, StatusBar as RNStatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { Link, Redirect } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
    withSequence
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { translations } from '../../constants/I18n';

const { width, height } = Dimensions.get('window');

const REVIEWS = [
    "룸메이트랑 안 싸우게 됐어요 ✌️",
    "정산이 너무 편해졌어요 💸",
    "집안일 분담이 확실해요 ✨",
    "초대 코드로 친구 부르기 🏠",
    "공유 달력 진짜 꿀팁! 📅",
];

const FloatingReview = ({ text, index, total }: { text: string, index: number, total: number }) => {
    const translateY = useSharedValue(height);
    const opacity = useSharedValue(0);
    const [randomX] = React.useState(() => (Math.random() * 0.6 + 0.2) * width);
    const [randomDuration] = React.useState(() => 20000 + Math.random() * 10000);

    useEffect(() => {
        const delay = index * 3000;
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(height * 0.5, { duration: randomDuration, easing: Easing.linear }),
                    withTiming(height, { duration: 0 })
                ),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 3000 }),
                    withTiming(0.7, { duration: randomDuration - 6000 }),
                    withTiming(0, { duration: 3000 })
                ),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                animatedStyle,
                { position: 'absolute', left: randomX - 60, zIndex: 0 }
            ]}
        >
            <View className="bg-white/60 px-4 py-2 rounded-full border border-white/50 shadow-sm">
                <Text className="text-gray-500 text-xs font-medium">{text}</Text>
            </View>
        </Animated.View>
    );
};

export default function MateHome() {
    const { isLoggedIn, language } = useUserStore();
    const t = translations[language].intro;

    if (isLoggedIn) {
        return <Redirect href="/mate/(tabs)/home" />; // Redirect to local tabs
    }

    return (
        <View className="flex-1 bg-orange-50/30 items-center justify-between py-20 px-6 relative overflow-hidden">
            <StatusBar style="dark" />

            {/* Background Floating Reviews */}
            <View className="absolute inset-0 pointer-events-none w-full h-full">
                {REVIEWS.map((review, i) => (
                    <FloatingReview key={i} text={review} index={i} total={REVIEWS.length} />
                ))}
            </View>

            {/* Header / Hero */}
            <Animated.View entering={FadeInDown.duration(1000).springify()} className="items-center mt-32 z-10">
                <View className="w-40 h-40 bg-white rounded-full items-center justify-center mb-8 shadow-lg shadow-orange-100 border-4 border-white">
                    <Text className="text-7xl">🏡</Text>
                </View>
                <Text className="text-orange-600 text-4xl font-extrabold tracking-tight mb-3">MateCheck</Text>
                <Text className="text-gray-500 text-lg font-medium text-center leading-8 bg-white/50 px-4 py-2 rounded-xl">
                    {t.tagline}
                </Text>
            </Animated.View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()} className="w-full gap-4 mb-10 z-10">
                <Link href="/mate/(auth)/login" asChild>
                    <TouchableOpacity className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:bg-orange-600">
                        <Text className="text-white font-bold text-lg">{t.login_btn}</Text>
                    </TouchableOpacity>
                </Link>

                <View className="flex-row items-center justify-center mt-2">
                    <Text className="text-gray-400 mr-2">{t.signup_prompt}</Text>
                    <Link href="/mate/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-orange-600 font-bold text-base underline">{t.signup_btn}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
