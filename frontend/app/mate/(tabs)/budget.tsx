import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Linking, Image, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { cn } from '../../../lib/utils';
import Animated, { FadeIn, FadeInDown, SlideInUp, Layout } from 'react-native-reanimated';
import { useUserStore, BudgetTransaction, FixedExpense } from '../../../store/userStore';
import { AVATARS } from '../../../constants/data';
import { getThemeColors } from '../../../utils/theme';
import { translations } from '../../../constants/I18n';
import { Ionicons } from '@expo/vector-icons';
import TutorialOverlay from '../../../components/TutorialOverlay';
import Avatar from '../../../components/Avatar';

const { width, height } = Dimensions.get('window');

export default function BudgetScreen() {
    const {
        nestTheme, budgetGoal, transactions, addTransaction, deleteTransaction,
        fixedExpenses, setBudgetGoal, addFixedExpense, deleteFixedExpense,
        avatarId, language: langFromStore, appMode,
        nestId, syncTransactions, isLoading
    } = useUserStore();
    const language = langFromStore as 'ko' | 'en';
    const t = (translations[language] as any).budget;

    // 테마 설정 (getThemeColors로 통합)
    const { bg: themeBg, text: themeText, bgSoft: themeBgSoft, isToss: isTossMode } = getThemeColors(nestTheme, appMode);

    // State for Modals
    const [transModalVisible, setTransModalVisible] = useState(false);
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [fixedModalVisible, setFixedModalVisible] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Form States
    const [tempTitle, setTempTitle] = useState('');
    const [tempAmount, setTempAmount] = useState('');
    const [tempGoal, setTempGoal] = useState(budgetGoal.toString());
    const [tempDay, setTempDay] = useState('1');
    const [tempCategory, setTempCategory] = useState<BudgetTransaction['category']>('etc');

    // --- STEP-BY-STEP UI STATE ---
    const [transStep, setTransStep] = useState(1);
    const [fixedStep, setFixedStep] = useState(1);
    const [smartModalVisible, setSmartModalVisible] = useState(false);
    const [smartStep, setSmartStep] = useState(1);
    const [smartTargetApp, setSmartTargetApp] = useState<'toss' | 'kakao'>('toss');
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);

    const appState = useRef(AppState.currentState);
    const [transferPending, setTransferPending] = useState(false);

    // 화면 진입 시 거래 내역 API 로딩
    useEffect(() => {
        if (nestId) {
            syncTransactions();
        }
    }, [nestId]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (transferPending) {
                    // When returning from transfer app, the modal should already be there or show focus
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [transferPending]);

    // 카테고리 이모지 매핑
    const getCategoryEmoji = (cat: string) => {
        const map: Record<string, string> = { food: '🍽️', housing: '🏠', living: '🛒', transport: '🚗', etc: '📦' };
        return map[cat] || '📦';
    };

    // Calculations
    const totalSpent = transactions.reduce((acc: number, curr: BudgetTransaction) => acc + curr.amount, 0);
    const fixedTotal = fixedExpenses.reduce((acc: number, curr: FixedExpense) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalSpent;
    const progress = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

    // Category Totals
    const categoryTotals = transactions.reduce((acc: Record<string, number>, t: BudgetTransaction) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const chartData = [
        { name: '식비', amount: categoryTotals['food'] || 0, color: '#FFAB91', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '주거/통신', amount: categoryTotals['housing'] || 0, color: '#80CBC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '생활', amount: categoryTotals['living'] || 0, color: '#9FA8DA', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '교통', amount: categoryTotals['transport'] || 0, color: '#CE93D8', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '기타', amount: categoryTotals['etc'] || 0, color: '#BCAAA4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    ].filter(d => d.amount > 0);

    if (chartData.length === 0) {
        chartData.push({ name: '지출 없음', amount: 1, color: '#F3F4F6', legendFontColor: '#9CA3AF', legendFontSize: 12 });
    }

    const handleAddTransaction = () => {
        if (!tempTitle || !tempAmount) return;
        addTransaction(tempTitle, parseInt(tempAmount), tempCategory);
        setTempTitle(''); setTempAmount(''); setTempCategory('etc'); setTransModalVisible(false);
    };

    const handleSetGoal = () => {
        if (!tempGoal) return;
        setBudgetGoal(parseInt(tempGoal));
        setGoalModalVisible(false);
    };

    const handleAddFixed = () => {
        if (!tempTitle || !tempAmount) return;
        addFixedExpense(tempTitle, parseInt(tempAmount), parseInt(tempDay));
        setTempTitle(''); setTempAmount(''); setTempDay('1'); setFixedModalVisible(false);
    };

    const handleStartSmartTransfer = (app: 'toss' | 'kakao') => {
        setSmartTargetApp(app);
        setSmartStep(1);
        setSmartModalVisible(true);
        setTempTitle('');
        setTempAmount('');
        setTempDate(new Date().toISOString().split('T')[0]);
    };

    const handleConfirmSmartTransfer = () => {
        setTransferPending(true);
        if (smartTargetApp === 'toss') {
            Linking.openURL(`supertoss://send?amount=${tempAmount || 0}&memo=${tempTitle}`);
        } else {
            Linking.openURL('kakaotalk://kakaopay/money/transfer');
        }
        setSmartStep(4); // Move to confirm step
    };

    const handleFinalizeSmartTransfer = (save: boolean) => {
        if (save) {
            addTransaction(tempTitle, parseInt(tempAmount), 'etc', tempDate);
        }
        setSmartModalVisible(false);
        setTransferPending(false);
        setSmartStep(1);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* 헤더 - Supanova 스타일 */}
            <View className="pt-14 pb-5 px-5 bg-white z-20 flex-row justify-between items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }}>
                <View className="flex-row items-center gap-2">
                    <Text className="text-xl font-bold tracking-tight text-gray-900">{isTossMode ? "송금/정산" : t.title}</Text>
                    {!isTossMode && (
                        <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-0.5">
                            <Ionicons name="help-circle-outline" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* 로딩 상태 */}
            {isLoading.transactions && (
                <View className="absolute top-28 left-0 right-0 z-10 items-center">
                    <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}>
                        <ActivityIndicator size="small" color="#6366F1" />
                        <Text className="text-xs text-gray-500 font-medium">{language === 'ko' ? '거래 내역 불러오는 중...' : 'Loading transactions...'}</Text>
                    </View>
                </View>
            )}

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                <View className="gap-4">

                    {/* 1. 요약 카드 - Supanova 스타일 */}
                    <Animated.View
                        entering={SlideInUp.delay(100)}
                        className="bg-white rounded-3xl p-5"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                    >
                        {/* eyebrow 라벨 + 수정 버튼 */}
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'ko' ? "남은 예산" : "Remaining Budget"}</Text>
                            <TouchableOpacity onPress={() => setGoalModalVisible(true)} className="bg-gray-100 px-3 py-1.5 rounded-full">
                                <Text className="text-xs font-bold text-gray-500">{language === 'ko' ? '목표 수정' : 'Edit'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 큰 숫자 - 잔액 */}
                        <View className="items-center mb-6">
                            <Text className="text-4xl font-bold tracking-tight text-gray-900" style={{ includeFontPadding: false }}>
                                {remaining.toLocaleString()}
                                <Text className="text-2xl">원</Text>
                            </Text>
                        </View>

                        {/* 프로그레스 바 */}
                        <View className="mb-5">
                            <View className="w-full h-2.5 rounded-full overflow-hidden bg-gray-100">
                                <Animated.View style={{ width: `${progress}%` }} className={cn("h-full rounded-full", themeBg)} />
                            </View>
                            <View className="flex-row justify-between mt-1.5 px-0.5">
                                <Text className="text-[10px] font-bold text-gray-300">{progress}%</Text>
                                <Text className="text-[10px] font-bold text-gray-300">100%</Text>
                            </View>
                        </View>

                        {/* 수입/지출 요약 */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 p-4 rounded-2xl items-center">
                                <Text className="text-[10px] uppercase font-bold text-gray-400 mb-1">{language === 'ko' ? "지출" : "Spent"}</Text>
                                <Text className="font-bold text-base text-red-500">{totalSpent.toLocaleString()}</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 p-4 rounded-2xl items-center">
                                <Text className="text-[10px] uppercase font-bold text-gray-400 mb-1">{language === 'ko' ? "예산" : "Budget"}</Text>
                                <Text className="font-bold text-base text-gray-900">{budgetGoal.toLocaleString()}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* 간편 송금 - Supanova 카드 */}
                    <View>
                        <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">간편 송금</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => handleStartSmartTransfer('toss')}
                                className="flex-1 bg-white p-5 rounded-3xl flex-row items-center justify-center gap-3 active:bg-gray-50"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                            >
                                <View className="w-10 h-10 bg-[#0064FF] rounded-2xl items-center justify-center">
                                    <Text className="text-white font-bold text-xs">TOSS</Text>
                                </View>
                                <Text className="font-bold text-gray-900">토스 기록</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleStartSmartTransfer('kakao')}
                                className="flex-1 bg-white p-5 rounded-3xl flex-row items-center justify-center gap-3 active:bg-gray-50"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                            >
                                <View className="w-10 h-10 bg-[#FFEB00] rounded-2xl items-center justify-center">
                                    <View className="bg-[#3C1E1E] w-5 h-4 rounded-sm items-center justify-center">
                                        <View className="bg-[#FFEB00] w-2 h-2 rounded-full" />
                                    </View>
                                </View>
                                <Text className="font-bold text-gray-900">카카오 기록</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 2. 고정 지출 - Supanova 카드 */}
                    <View>
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-xl font-bold tracking-tight text-gray-900">고정 지출</Text>
                            <TouchableOpacity onPress={() => setFixedModalVisible(true)} className="bg-gray-100 px-3 py-1.5 rounded-full active:bg-gray-200">
                                <Text className="text-xs font-bold text-gray-500">+ 추가</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                            {fixedExpenses.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Ionicons name="home-outline" size={40} color="#D1D5DB" />
                                    <Text className="text-gray-300 font-bold text-sm mt-3">등록된 고정 지출이 없어요</Text>
                                </View>
                            ) : (
                                <View>
                                    {fixedExpenses.map((f: FixedExpense, i: number) => (
                                        <View key={f.id} className={cn("flex-row justify-between items-center py-4 px-5", i !== fixedExpenses.length - 1 && "border-b border-gray-100")}>
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
                                                    <Text className="text-gray-900 font-bold text-sm">{f.day}</Text>
                                                    <Text className="text-gray-400 text-[8px] font-bold">일</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="font-bold text-gray-900 text-base">{f.title}</Text>
                                                    <Text className="text-gray-400 text-xs">매월 자동 계산</Text>
                                                </View>
                                            </View>
                                            <View className="items-end flex-row gap-2">
                                                <Text className="font-bold text-gray-900 text-base">{f.amount.toLocaleString()}원</Text>
                                                <TouchableOpacity onPress={() => deleteFixedExpense(f.id)} className="p-1">
                                                    <Ionicons name="close-circle" size={16} color="#D1D5DB" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                    {/* 합계 */}
                                    <View className="py-4 px-5 bg-gray-50 rounded-b-3xl flex-row justify-between items-center">
                                        <Text className="text-gray-500 text-sm font-bold">합계</Text>
                                        <Text className="text-gray-900 font-bold text-lg">{fixedTotal.toLocaleString()}원</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 3. 지출 분석 - Supanova 카드 */}
                    <View>
                        <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">지출 분석</Text>
                        <View className="bg-white p-5 rounded-3xl items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                            <PieChart
                                data={chartData}
                                width={width - 80}
                                height={200}
                                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[0, 0]}
                                absolute
                            />
                        </View>
                    </View>

                    {/* 4. 최근 지출 - Supanova 리스트 카드 */}
                    <View>
                        <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">최근 지출</Text>
                        <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                            {transactions.length === 0 ? (
                                /* 빈 상태 */
                                <View className="py-10 items-center">
                                    <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                                    <Text className="text-gray-300 font-bold text-sm mt-3">아직 지출 내역이 없습니다.</Text>
                                </View>
                            ) : (
                                transactions.slice(0, 10).map((t: BudgetTransaction, i: number) => (
                                    <Animated.View
                                        entering={FadeInDown.delay(i * 50)}
                                        key={t.id}
                                        className={cn("flex-row justify-between items-center py-4 px-5", i !== Math.min(transactions.length, 10) - 1 && "border-b border-gray-100")}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
                                                <Text className="text-lg">{getCategoryEmoji(t.category)}</Text>
                                            </View>
                                            <View>
                                                <Text className="font-bold text-gray-900 text-base">{t.title}</Text>
                                                <Text className="text-gray-400 text-xs mt-0.5">
                                                    {t.date}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="font-bold text-red-500 text-base">-{t.amount.toLocaleString()}</Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        language === 'ko' ? '삭제' : 'Delete',
                                                        language === 'ko' ? '이 거래 내역을 삭제하시겠습니까?' : 'Delete this transaction?',
                                                        [
                                                            { text: language === 'ko' ? '취소' : 'Cancel', style: 'cancel' },
                                                            { text: language === 'ko' ? '삭제' : 'Delete', style: 'destructive', onPress: () => deleteTransaction(t.id) }
                                                        ]
                                                    );
                                                }}
                                                className="p-1"
                                            >
                                                <Ionicons name="trash-outline" size={14} color="#D1D5DB" />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* FAB 기록 버튼 - Supanova 스타일 */}
            <TouchableOpacity
                onPress={() => setTransModalVisible(true)}
                className={cn("absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center z-30", themeBg)}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* --- 모달 --- */}

            {/* 간편 송금 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent visible={smartModalVisible} onRequestClose={() => setSmartModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            {smartStep < 4 && (
                                <TouchableOpacity onPress={() => setSmartModalVisible(false)} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                    <Ionicons name="close" size={24} color="#94A3B8" />
                                </TouchableOpacity>
                            )}

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-xl", smartTargetApp === 'toss' ? "bg-[#0064FF] shadow-blue-100" : "bg-[#FFEB00] shadow-yellow-100")}>
                                    <Text className="text-2xl">{smartTargetApp === 'toss' ? "🏦" : "💛"}</Text>
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    {smartStep === 4 ? "송금을 완료하셨나요?" : `${smartTargetApp === 'toss' ? '토스' : '카카오'} 기록`}
                                </Text>
                                <Text className="text-gray-400 font-bold mt-1">
                                    {smartStep === 4 ? "앱에 지출 내용을 자동으로 남겨드릴까요?" : `Step ${smartStep} of 3`}
                                </Text>
                            </View>

                            <View className="mb-8 px-2">
                                {smartStep === 1 ? (
                                    <Animated.View entering={FadeInDown}>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">오늘 무엇을 위해 송금하시나요?</Text>
                                        <TextInput
                                            value={tempTitle}
                                            onChangeText={setTempTitle}
                                            placeholder="예: 월세, 마트, 용돈"
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            autoFocus
                                        />
                                    </Animated.View>
                                ) : smartStep === 2 ? (
                                    <Animated.View entering={FadeInDown}>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">송금할 금액을 입력해주세요</Text>
                                        <TextInput
                                            value={tempAmount}
                                            onChangeText={setTempAmount}
                                            placeholder="0"
                                            keyboardType="numeric"
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-gray-900 font-black text-3xl mb-4"
                                            autoFocus
                                        />
                                    </Animated.View>
                                ) : smartStep === 3 ? (
                                    <Animated.View entering={FadeInDown}>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">언제 지출한 내용인가요?</Text>
                                        <TextInput
                                            value={tempDate}
                                            onChangeText={setTempDate}
                                            placeholder="YYYY-MM-DD"
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            autoFocus
                                        />
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity onPress={() => setTempDate(new Date().toISOString().split('T')[0])} className="bg-gray-100 px-4 py-2 rounded-full">
                                                <Text className="text-gray-600 font-bold text-xs">오늘</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => {
                                                const yesterday = new Date();
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                setTempDate(yesterday.toISOString().split('T')[0]);
                                            }} className="bg-gray-100 px-4 py-2 rounded-full">
                                                <Text className="text-gray-600 font-bold text-xs">어제</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                ) : (
                                    <Animated.View entering={FadeInDown} className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 items-center">
                                        <Text className="text-blue-600 font-black text-2xl mb-2">{parseInt(tempAmount || '0').toLocaleString()}원</Text>
                                        <Text className="text-blue-400 font-bold text-center">"{tempTitle}" 항목으로{"\n"}기록을 남길 준비가 되었습니다.</Text>
                                    </Animated.View>
                                )}
                            </View>

                            <View className="flex-row gap-3">
                                {smartStep > 1 && smartStep < 4 && (
                                    <TouchableOpacity onPress={() => setSmartStep(smartStep - 1)} className="flex-1 py-5 rounded-3xl bg-gray-50 items-center justify-center border-2 border-gray-100">
                                        <Text className="text-gray-400 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}

                                {smartStep === 4 ? (
                                    <>
                                        <TouchableOpacity onPress={() => handleFinalizeSmartTransfer(false)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center">
                                            <Text className="text-gray-400 font-black">기록 안 함</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleFinalizeSmartTransfer(true)} className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", themeBg)}>
                                            <Text className="text-white font-black">기록 완료 ✨</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (smartStep === 1 && tempTitle) setSmartStep(2);
                                            else if (smartStep === 2 && tempAmount) setSmartStep(3);
                                            else if (smartStep === 3) handleConfirmSmartTransfer();
                                        }}
                                        disabled={(smartStep === 1 && !tempTitle) || (smartStep === 2 && !tempAmount)}
                                        className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", ((smartStep === 1 && !tempTitle) || (smartStep === 2 && !tempAmount)) ? "bg-gray-200" : themeBg)}
                                    >
                                        <Text className="text-white font-black">
                                            {smartStep === 3 ? "정보 입력 완료" : "다음 단계"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {smartStep === 3 && (
                                <View className="mt-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <Text className="text-orange-600 text-[10px] font-bold text-center leading-4">
                                        ⓘ 다음 단계에서 {smartTargetApp === 'toss' ? '토스' : '카카오'} 앱으로 연결됩니다.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* 예산 목표 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent visible={goalModalVisible} onRequestClose={() => setGoalModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => setGoalModalVisible(false)} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4", themeBg)}>
                                    <Ionicons name="wallet-sharp" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">{t.goal_title}</Text>
                            </View>

                            <View className="mb-8">
                                <Text className="text-sm font-black text-gray-900 mb-3 ml-1">총 예산 금액을 설정해주세요</Text>
                                <TextInput
                                    value={tempGoal}
                                    onChangeText={setTempGoal}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-gray-900 font-black text-3xl mb-4"
                                    autoFocus
                                />
                                <Text className="text-gray-400 text-xs text-center font-bold">{t.goal_desc}</Text>
                            </View>

                            <TouchableOpacity onPress={handleSetGoal} className={cn("w-full py-5 rounded-3xl items-center shadow-lg", themeBg)}>
                                <Text className="text-white font-black text-lg">설정 완료 ✨</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* 지출 기록 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent visible={transModalVisible} onRequestClose={() => setTransModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => { setTransModalVisible(false); setTransStep(1); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg", themeBg)}>
                                    <Ionicons name="receipt-sharp" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">지출 기록</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {transStep} of 2</Text>
                            </View>

                            <View className="mb-8">
                                {transStep === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">어디에 썼나요?</Text>
                                        <TextInput
                                            value={tempTitle}
                                            onChangeText={setTempTitle}
                                            placeholder="예: 마트 장보기"
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            autoFocus
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">금액을 입력해주세요</Text>
                                        <TextInput
                                            value={tempAmount}
                                            onChangeText={setTempAmount}
                                            placeholder="0"
                                            keyboardType="numeric"
                                            className="bg-gray-50 border-2 border-indigo-100 rounded-2xl p-6 text-gray-900 font-black text-3xl mb-4"
                                            autoFocus
                                        />
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1 mt-4">카테고리</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {([
                                                { key: 'food' as const, emoji: '🍽️', label: '식비' },
                                                { key: 'housing' as const, emoji: '🏠', label: '주거' },
                                                { key: 'living' as const, emoji: '🛒', label: '생활' },
                                                { key: 'transport' as const, emoji: '🚗', label: '교통' },
                                                { key: 'etc' as const, emoji: '📦', label: '기타' },
                                            ]).map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.key}
                                                    onPress={() => setTempCategory(cat.key)}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl border-2",
                                                        tempCategory === cat.key ? themeBg + " border-transparent" : "bg-gray-50 border-gray-100"
                                                    )}
                                                >
                                                    <Text className={cn("font-bold text-sm", tempCategory === cat.key ? "text-white" : "text-gray-500")}>
                                                        {cat.emoji} {cat.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row gap-3">
                                {transStep > 1 && (
                                    <TouchableOpacity onPress={() => setTransStep(1)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200"
                                    >
                                        <Text className="text-gray-600 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (transStep === 1) setTransStep(2);
                                        else handleAddTransaction();
                                    }}
                                    disabled={transStep === 1 && !tempTitle}
                                    className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (transStep === 1 && !tempTitle) ? "bg-gray-200" : themeBg)}
                                >
                                    <Text className="text-white font-black">{transStep === 2 ? "기록 완료!" : "다음 단계"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* 고정 지출 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent visible={fixedModalVisible} onRequestClose={() => setFixedModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => { setFixedModalVisible(false); setFixedStep(1); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4", themeBg)}>
                                    <Ionicons name="home-sharp" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">고정 지출 추가</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {fixedStep} of 2</Text>
                            </View>

                            <View className="mb-8">
                                {fixedStep === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">지출 항목을 입력해주세요</Text>
                                        <TextInput
                                            value={tempTitle}
                                            onChangeText={setTempTitle}
                                            placeholder="예: 월세, 관리비"
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            autoFocus
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">금액과 결제일</Text>
                                        <TextInput
                                            value={tempAmount}
                                            onChangeText={setTempAmount}
                                            placeholder="금액 (원)"
                                            keyboardType="numeric"
                                            className="bg-gray-50 border-2 border-indigo-100 rounded-2xl p-4 text-gray-900 font-bold mb-4"
                                            autoFocus
                                        />
                                        <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                                            <Text className="text-gray-500 font-bold">결제 희망일</Text>
                                            <View className="flex-row items-center gap-2">
                                                <TextInput
                                                    value={tempDay}
                                                    onChangeText={setTempDay}
                                                    keyboardType="numeric"
                                                    maxLength={2}
                                                    className="bg-white border-2 border-indigo-200 rounded-xl p-2 w-12 text-center font-black text-indigo-600"
                                                />
                                                <Text className="text-gray-900 font-bold">일</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row gap-3">
                                {fixedStep > 1 && (
                                    <TouchableOpacity onPress={() => setFixedStep(1)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200">
                                        <Text className="text-gray-600 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (fixedStep === 1) setFixedStep(2);
                                        else handleAddFixed();
                                    }}
                                    disabled={fixedStep === 1 && !tempTitle}
                                    className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (fixedStep === 1 && !tempTitle) ? "bg-gray-200" : themeBg)}
                                >
                                    <Text className="text-white font-black">{fixedStep === 2 ? "등록 완료!" : "다음 단계"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 150, width: width - 40, height: 200, borderRadius: 40 },
                        title: language === 'ko' ? "예산 한눈에 보기" : "Budget Overview",
                        description: language === 'ko' ? "이번 달 총 공금과 남은 금액을 실시간으로 확인할 수 있어요." : "See your total budget and remaining amount in real-time.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 370, width: width - 40, height: 180, borderRadius: 30 },
                        title: language === 'ko' ? "고정 지출 관리" : "Fixed Expenses",
                        description: language === 'ko' ? "월세, 관리비 같은 정기적인 지출을 등록하고 매달 일정을 챙기세요." : "Register recurring expenses like rent and utilities.",
                        position: "bottom"
                    },
                    {
                        target: { x: width - 120, y: 60, width: 100, height: 45, borderRadius: 25 },
                        title: language === 'ko' ? "지출 기록하기" : "Record Expense",
                        description: language === 'ko' ? "새로운 지출이 생길 때마다 여기서 바로 기록할 수 있어요." : "Quickly add new expenses here.",
                        position: "bottom"
                    }
                ]}
            />
        </View>
    );
}
