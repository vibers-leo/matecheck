import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Linking, Image } from 'react-native';
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
        nestTheme, budgetGoal, transactions, addTransaction,
        fixedExpenses, setBudgetGoal, addFixedExpense, deleteFixedExpense,
        avatarId, language: langFromStore, appMode
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

    // --- STEP-BY-STEP UI STATE ---
    const [transStep, setTransStep] = useState(1);
    const [fixedStep, setFixedStep] = useState(1);
    const [smartModalVisible, setSmartModalVisible] = useState(false);
    const [smartStep, setSmartStep] = useState(1);
    const [smartTargetApp, setSmartTargetApp] = useState<'toss' | 'kakao'>('toss');
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);

    const appState = useRef(AppState.currentState);
    const [transferPending, setTransferPending] = useState(false);

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
        addTransaction(tempTitle, parseInt(tempAmount), 'etc');
        setTempTitle(''); setTempAmount(''); setTransModalVisible(false);
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
            {/* Header (Modern Simple Style) */}
            <View className={cn("pt-16 pb-6 px-6 z-20 mb-2 flex-row justify-between items-center", isTossMode ? "bg-white" : "bg-white shadow-sm rounded-b-[40px]")}>
                <View className="flex-row items-center gap-2">
                    <Text className={cn("text-2xl font-black", isTossMode ? "text-gray-900 text-3xl" : "text-gray-900")}>{isTossMode ? "송금/정산" : t.title}</Text>
                    {!isTossMode && (
                        <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-1">
                            <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => setTransModalVisible(true)}
                    className={cn("px-5 py-2.5 rounded-full shadow-lg shadow-orange-200 flex-row items-center gap-1", themeBg)}
                >
                    <Ionicons name="add" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">{language === 'ko' ? '기록' : 'Add'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
                <View className="gap-8">

                    {/* 1. Summary Card (Highlighted) */}
                    <Animated.View
                        entering={SlideInUp.delay(100)}
                        className={cn("p-8 rounded-[40px] shadow-xl", isTossMode ? "bg-white border border-gray-200 shadow-gray-100" : (themeBg + " border border-white/20"))}
                    >
                        {/* Header Row */}
                        <View className="flex-row justify-between items-center mb-10">
                            <Text className={cn("text-lg font-bold", isTossMode ? "text-gray-600" : "text-gray-900 opacity-80")}>{t.goal_title}</Text>
                            <TouchableOpacity onPress={() => setGoalModalVisible(true)} className={cn("px-4 py-2 rounded-full", isTossMode ? "bg-gray-100" : "bg-white shadow-sm")}>
                                <Text className={cn("text-xs font-bold", isTossMode ? "text-gray-600" : "text-gray-900")}>{language === 'ko' ? '목표 수정' : 'Edit Goal'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Center Hero Section */}
                        <View className="items-center mb-12">
                            <Text className={cn("text-sm font-bold mb-2 uppercase tracking-widest", isTossMode ? "text-gray-400" : "text-gray-900/60")}>{language === 'ko' ? "남은 예산" : "Remaining Budget"}</Text>
                            <Text className={cn("text-5xl font-black tracking-tighter", isTossMode ? "text-gray-900" : "text-gray-900")} style={{ includeFontPadding: false }}>
                                {remaining.toLocaleString()}
                                <Text className="text-3xl font-bold">원</Text>
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="mb-6">
                            <View className="flex-row justify-between mb-2 px-1">
                                <Text className={cn("text-xs font-bold", isTossMode ? "text-gray-400" : "text-gray-900/60")}>0%</Text>
                                <Text className={cn("text-xs font-bold", isTossMode ? "text-gray-400" : "text-gray-900/60")}>100%</Text>
                            </View>
                            <View className={cn("w-full h-5 rounded-full overflow-hidden", isTossMode ? "bg-gray-100" : "bg-white/40 backdrop-blur-sm border border-white/30")}>
                                <Animated.View style={{ width: `${progress}%` }} className={cn("h-full rounded-full shadow-sm", isTossMode ? "bg-toss-blue" : "bg-gray-900")} />
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row gap-3">
                            <View className={cn("flex-1 p-5 rounded-3xl items-center", isTossMode ? "bg-gray-50" : "bg-white shadow-sm")}>
                                <Text className={cn("text-[10px] uppercase font-bold mb-1", isTossMode ? "text-gray-400" : "text-gray-400")}>{language === 'ko' ? "현재 지출" : "Spent"}</Text>
                                <Text className={cn("font-bold text-lg", isTossMode ? "text-gray-900" : "text-gray-900")}>{totalSpent.toLocaleString()}</Text>
                            </View>
                            <View className={cn("flex-1 p-5 rounded-3xl items-center", isTossMode ? "bg-gray-50" : "bg-white/50 border border-white/50")}>
                                <Text className={cn("text-[10px] uppercase font-bold mb-1", isTossMode ? "text-gray-400" : "text-gray-800/60")}>{language === 'ko' ? "목표 예산" : "Target"}</Text>
                                <Text className={cn("font-bold text-lg", isTossMode ? "text-gray-900" : "text-gray-900/80")}>{budgetGoal.toLocaleString()}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Quick Transfer Links */}
                    <View>
                        <Text className="text-xl font-black text-gray-900 mb-4 px-2">간편 송금 & 기록 🔗</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => handleStartSmartTransfer('toss')}
                                className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <View className="w-10 h-10 bg-[#0064FF] rounded-2xl items-center justify-center shadow-lg shadow-blue-100">
                                    <Text className="text-white font-black text-xs">TOSS</Text>
                                </View>
                                <Text className="font-black text-gray-800">토스 기록</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleStartSmartTransfer('kakao')}
                                className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <View className="w-10 h-10 bg-[#FFEB00] rounded-2xl items-center justify-center shadow-lg shadow-yellow-100">
                                    <View className="bg-[#3C1E1E] w-5 h-4 rounded-sm items-center justify-center">
                                        <View className="bg-[#FFEB00] w-2 h-2 rounded-full" />
                                    </View>
                                </View>
                                <Text className="font-black text-gray-800">카카오 기록</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 2. Fixed Expenses Section */}
                    <View>
                        <View className="flex-row justify-between items-center mb-4 px-2">
                            <Text className="text-xl font-black text-gray-900">고정 지출 🏠</Text>
                            <TouchableOpacity onPress={() => setFixedModalVisible(true)} className="flex-row items-center gap-1">
                                <Text className={cn("font-bold text-sm", themeText)}>+ 추가</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm">
                            {fixedExpenses.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-gray-400 font-medium">등록된 고정 지출이 없어요</Text>
                                </View>
                            ) : (
                                <View>
                                    {fixedExpenses.map((f: FixedExpense, i: number) => (
                                        <View key={f.id} className={cn("flex-row justify-between items-center p-5", i !== fixedExpenses.length - 1 && "border-b border-gray-50")}>
                                            <View className="flex-row items-center gap-4 flex-1">
                                                <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-200">
                                                    <Text className="text-gray-900 font-black text-sm">{f.day}</Text>
                                                    <Text className="text-gray-400 text-[9px] font-bold">일</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="font-bold text-gray-900 text-lg mb-0.5">{f.title}</Text>
                                                    <Text className="text-gray-400 text-xs font-medium">매월 자동 계산</Text>
                                                </View>
                                            </View>
                                            <View className="items-end gap-1">
                                                <Text className="font-black text-gray-900 text-lg">{f.amount.toLocaleString()}원</Text>
                                                <TouchableOpacity onPress={() => deleteFixedExpense(f.id)} className="opacity-40">
                                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                    <View className="m-2 p-5 bg-gray-50 rounded-[24px] flex-row justify-between items-center border border-gray-100">
                                        <Text className="text-gray-500 text-sm font-bold">총 고정 지출</Text>
                                        <Text className="text-gray-900 font-black text-xl">{fixedTotal.toLocaleString()}원</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 3. Spend Analysis Chart */}
                    <View>
                        <Text className="text-xl font-black text-gray-900 mb-4 px-2">지출 분석 📊</Text>
                        <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm items-center">
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

                    {/* 4. Recent Transactions List */}
                    <View>
                        <Text className="text-xl font-black text-gray-900 mb-4 px-2">최근 지출 💸</Text>
                        <View className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2">
                            {transactions.length === 0 ? (
                                <View className="py-12 items-center">
                                    <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
                                    </View>
                                    <Text className="text-gray-400 font-medium">아직 지출 내역이 없습니다.</Text>
                                </View>
                            ) : (
                                transactions.slice(0, 10).map((t: BudgetTransaction, i: number) => (
                                    <Animated.View
                                        entering={FadeInDown.delay(i * 50)}
                                        key={t.id}
                                        className={cn("flex-row justify-between items-center p-5", i !== transactions.length - 1 && "border-b border-gray-50")}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <Avatar
                                                source={(AVATARS[Number(t.payerId)] || AVATARS[0]).image}
                                                size="sm"
                                                className="bg-gray-50"
                                            />
                                            <View>
                                                <Text className="font-bold text-gray-800 text-base mb-0.5">{t.title}</Text>
                                                <Text className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                                                    {t.date} • {(AVATARS[Number(t.payerId)] || AVATARS[0]).label}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="font-black text-gray-900 text-lg">-{t.amount.toLocaleString()}</Text>
                                            <View className="bg-gray-100 px-2 py-1 rounded mt-1">
                                                <Text className="text-gray-500 text-[10px] font-bold">{t.category}</Text>
                                            </View>
                                        </View>
                                    </Animated.View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* --- MODALS --- */}

            {/* Smart Transfer & Log Modal */}
            <Modal animationType="fade" transparent visible={smartModalVisible} onRequestClose={() => setSmartModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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

            {/* Set Budget Goal Modal */}
            <Modal animationType="fade" transparent visible={goalModalVisible} onRequestClose={() => setGoalModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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

            {/* Add Transaction Modal */}
            <Modal animationType="fade" transparent visible={transModalVisible} onRequestClose={() => setTransModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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
                                        <Text className="text-gray-400 font-bold text-center">정확한 금액을 입력하면 투명하게 공유됩니다 ✨</Text>
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

            {/* Add Fixed Expense Modal */}
            <Modal animationType="fade" transparent visible={fixedModalVisible} onRequestClose={() => setFixedModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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
