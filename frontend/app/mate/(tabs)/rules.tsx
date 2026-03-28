import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
// import { useUserStore, Goal } from '../../../store/userStore'; // Removed duplicate
import { cn } from '../../../lib/utils';
import { getThemeColors } from '../../../utils/theme';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../../constants/I18n';
import { API_URL } from '../../../constants/Config';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TutorialOverlay from '../../../components/TutorialOverlay';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Types for House Rules (Now imported from store)
import { useUserStore, HouseRule, Goal } from '../../../store/userStore';

const RULE_TYPES = [
    { id: 'quiet_hours', label: '조용한 시간', icon: 'moon', color: 'bg-indigo-500' },
    { id: 'guests', label: '손님 초대', icon: 'people', color: 'bg-purple-500' },
    { id: 'cleaning', label: '청소 규칙', icon: 'sparkles', color: 'bg-green-500' },
    { id: 'common_space', label: '공용 공간', icon: 'home', color: 'bg-blue-500' },
    { id: 'other', label: '기타', icon: 'ellipsis-horizontal', color: 'bg-gray-500' }
];

export default function RulesScreen() {
    const {
        nestTheme, goals, addGoal, incrementGoalProgress, decrementGoalProgress, deleteGoal,
        language, nestId, rules, addRule, deleteRule, syncRules, isMaster, appMode
    } = useUserStore();
    const router = useRouter();
    const params = useLocalSearchParams<{ action?: string }>();

    // Explicitly cast translations to avoid type errors
    const tCommon = translations[language as Language].common;
    const tGoals = translations[language as Language].goal;

    // Theme Colors
    const { bg: themeBg, text: themeText } = getThemeColors(nestTheme, appMode);

    // --- SELECTION MODAL STATE ---
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);

    // --- GOAL STATE ---
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('1');
    const [selectedGoalType, setSelectedGoalType] = useState<Goal['type']>('month');
    const [goalUnit, setGoalUnit] = useState('회');

    // --- RULE STATE ---
    const [ruleModalVisible, setRuleModalVisible] = useState(false);
    const [ruleTitle, setRuleTitle] = useState('');
    const [ruleDescription, setRuleDescription] = useState('');
    const [ruleType, setRuleType] = useState('other');
    const [showTutorial, setShowTutorial] = useState(false);

    // --- STEP-BY-STEP UI STATE ---
    const [ruleStep, setRuleStep] = useState(1);
    const [goalStep, setGoalStep] = useState(1);

    // Fetch Rules & Handle Deep Linking
    useEffect(() => {
        if (nestId) {
            syncRules();
        }
    }, [nestId]);

    useEffect(() => {
        if (params.action === 'add_goal') {
            setGoalModalVisible(true);
            router.setParams({ action: '' });
        } else if (params.action === 'add_rule') {
            setRuleModalVisible(true);
            router.setParams({ action: '' });
        }
    }, [params.action]);

    // --- ACTIONS ---
    const handleAddButtonPress = () => {
        if (!isMaster) {
            Alert.alert(
                (translations[language as Language] as any).master.badge,
                (translations[language as Language] as any).master.only_notice
            );
            return;
        }
        setSelectionModalVisible(true);
    };

    const handleSelectAction = (action: 'rule' | 'goal') => {
        setSelectionModalVisible(false);
        setTimeout(() => {
            if (action === 'rule') setRuleModalVisible(true);
            else setGoalModalVisible(true);
        }, 300);
    };

    const handleAddGoal = () => {
        if (goalTitle.trim()) {
            addGoal(selectedGoalType, goalTitle, Number(goalTarget), goalUnit);
            setGoalTitle('');
            setGoalTarget('1');
            setGoalUnit('회');
            setGoalModalVisible(false);
        }
    };

    const confirmDeleteGoal = (id: string) => {
        if (!isMaster) {
            Alert.alert((translations[language as Language] as any).master.badge, (translations[language as Language] as any).master.only_notice);
            return;
        }
        Alert.alert(
            tCommon.delete,
            tGoals.delete_msg || "삭제하시겠습니까?", // Fallback
            [
                { text: tCommon.cancel, style: "cancel" },
                { text: tCommon.delete, onPress: () => deleteGoal(id), style: "destructive" }
            ]
        );
    };

    const handleAddRule = async () => {
        if (!ruleTitle.trim()) {
            Alert.alert(tCommon.error, '제목을 입력해주세요.');
            return;
        }

        await addRule(ruleTitle, ruleDescription, ruleType);
        resetRuleForm();
        setRuleModalVisible(false);
    };

    const confirmDeleteRule = (id: number) => {
        if (!isMaster) {
            Alert.alert((translations[language as Language] as any).master.badge, (translations[language as Language] as any).master.only_notice);
            return;
        }
        Alert.alert(
            tCommon.delete,
            language === 'ko' ? '이 규칙을 삭제하시겠습니까?' : 'Delete this rule?',
            [
                { text: tCommon.cancel, style: 'cancel' },
                { text: tCommon.delete, style: 'destructive', onPress: () => deleteRule(id) }
            ]
        );
    };

    const resetRuleForm = () => {
        setRuleTitle('');
        setRuleDescription('');
        setRuleType('other');
    };

    const getRuleTypeInfo = (type: string) => {
        return RULE_TYPES.find(t => t.id === type) || RULE_TYPES[RULE_TYPES.length - 1];
    };

    // --- COMPONENTS ---
    {/* 목표 섹션 컴포넌트 - Supanova 카드 + 프로그레스 바 */}
    const GoalSection = ({ type, label, icon }: { type: Goal['type'], label: string, icon: string }) => {
        const sectionGoals = goals.filter((g: any) => g.type === type);

        if (sectionGoals.length === 0) return null;

        return (
            <View className="mb-4">
                <View className="flex-row items-center mb-2 px-1">
                    <Text className="text-sm mr-1.5">{icon}</Text>
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</Text>
                </View>

                <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                    {sectionGoals.map((goal: Goal, index: number) => (
                        <Animated.View
                            key={goal.id}
                            entering={FadeInUp.delay(index * 80)}
                            layout={Layout.springify()}
                            className={cn("p-5", index !== sectionGoals.length - 1 && "border-b border-gray-100")}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-1 flex-row items-center mr-2">
                                    {goal.current >= goal.target && <Text className="mr-1.5">🎉</Text>}
                                    <Text className={cn("text-base font-bold", goal.current >= goal.target ? "text-gray-300 line-through" : "text-gray-900")} numberOfLines={1}>
                                        {goal.title}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => confirmDeleteGoal(goal.id)} className="p-1">
                                    <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => decrementGoalProgress(goal.id)}
                                    className="w-7 h-7 bg-gray-50 rounded-full items-center justify-center"
                                    disabled={goal.current <= 0}
                                >
                                    <Ionicons name="remove" size={14} color={goal.current <= 0 ? "#D1D5DB" : "#6B7280"} />
                                </TouchableOpacity>

                                <View className="flex-1 mx-3">
                                    <View className="flex-row justify-between items-end mb-1 px-0.5">
                                        <Text className="text-xs font-bold text-gray-500">
                                            {goal.current}
                                            <Text className="font-normal text-gray-400"> / {goal.target} {goal.unit}</Text>
                                        </Text>
                                        <Text className="text-[10px] text-gray-300 font-bold">{Math.min(Math.round((goal.current / goal.target) * 100), 100)}%</Text>
                                    </View>
                                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <View
                                            className={cn("h-full rounded-full", themeBg)}
                                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => incrementGoalProgress(goal.id)}
                                    className={cn("w-7 h-7 rounded-full items-center justify-center", themeBg)}
                                    disabled={goal.current >= goal.target}
                                    style={{ opacity: goal.current >= goal.target ? 0.4 : 1 }}
                                >
                                    <Ionicons name="add" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* 헤더 - Supanova 스타일 */}
            <View className="pt-14 pb-5 px-5 bg-white z-20 flex-row justify-between items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }}>
                <View className="flex-row items-center gap-2">
                    <Text className="text-xl font-bold tracking-tight text-gray-900">
                        {language === 'ko' ? "약속" : "Promises"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-0.5">
                        <Ionicons name="help-circle-outline" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 메인 콘텐츠 */}
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }} showsVerticalScrollIndicator={false}>

                {/* 목표 섹션 */}
                <View className="mb-6">
                    <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">
                        {language === 'ko' ? "우리의 목표" : "Our Goals"}
                    </Text>

                    {goals.length === 0 ? (
                        /* 빈 상태 - Supanova 스타일 */
                        <TouchableOpacity
                            onPress={() => setGoalModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center active:bg-gray-50"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                        >
                            <Ionicons name="trophy-outline" size={40} color="#D1D5DB" />
                            <Text className="text-gray-300 font-bold text-sm mt-3">
                                {language === 'ko' ? "목표를 세워보세요" : "Set your goals"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <GoalSection type="vision" label={language === 'ko' ? "Vision" : "Our Vision"} icon="✨" />
                            <GoalSection type="year" label={language === 'ko' ? "올해 목표" : "Yearly"} icon="📅" />
                            <GoalSection type="month" label={language === 'ko' ? "이번 달" : "Monthly"} icon="🎯" />
                            <GoalSection type="week" label={language === 'ko' ? "이번 주" : "Weekly"} icon="🔥" />
                        </>
                    )}
                </View>

                {/* 규칙 섹션 - Supanova 리스트 카드 */}
                <View className="mb-24">
                    <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">
                        {language === 'ko' ? "우리 집 규칙" : "House Rules"}
                    </Text>

                    {rules.length === 0 ? (
                        /* 빈 상태 */
                        <TouchableOpacity
                            onPress={() => setRuleModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center active:bg-gray-50"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                        >
                            <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
                            <Text className="text-gray-300 font-bold text-sm mt-3">
                                {language === 'ko' ? "규칙이 비어있어요" : "No rules yet"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        /* 규칙 카드 - 체크리스트 형태 */
                        <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                            {rules.map((rule: HouseRule, index: number) => {
                                const typeInfo = getRuleTypeInfo(rule.rule_type);
                                return (
                                    <Animated.View
                                        key={rule.id}
                                        entering={FadeInDown.delay(index * 80)}
                                        className={cn("py-4 px-5", index !== rules.length - 1 && "border-b border-gray-100")}
                                    >
                                        <View className="flex-row items-center">
                                            <View className={`${typeInfo.color} w-8 h-8 rounded-lg items-center justify-center mr-3`}>
                                                <Ionicons name={typeInfo.icon as any} size={16} color="white" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-bold text-gray-900">{rule.title}</Text>
                                                {rule.description ? (
                                                    <Text className="text-gray-400 text-sm mt-0.5">{rule.description}</Text>
                                                ) : null}
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        tCommon.delete,
                                                        language === 'ko' ? '이 규칙을 삭제하시겠습니까?' : 'Delete this rule?',
                                                        [
                                                            { text: tCommon.cancel, style: 'cancel' },
                                                            { text: tCommon.delete, style: 'destructive', onPress: () => deleteRule(rule.id) }
                                                        ]
                                                    );
                                                }}
                                                className="p-1 ml-2"
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB 추가 버튼 - Supanova 스타일 */}
            <TouchableOpacity
                onPress={handleAddButtonPress}
                className={cn("absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center z-30", themeBg)}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* 선택 모달 - Supanova 바텀시트 */}
            <Modal visible={selectionModalVisible} animationType="slide" transparent>
                <TouchableOpacity
                    className="flex-1 bg-black/40 justify-end"
                    activeOpacity={1}
                    onPress={() => setSelectionModalVisible(false)}
                >
                    <View className="bg-white rounded-t-[32px] pb-10">
                        {/* 핸들바 */}
                        <View className="items-center pt-3 pb-4">
                            <View className="w-10 h-1 rounded-full bg-gray-200" />
                        </View>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('rule')}
                            className="py-4 px-6 flex-row items-center border-b border-gray-100 active:bg-gray-50"
                        >
                            <Text className="text-2xl mr-3">📜</Text>
                            <Text className="text-base font-bold text-gray-900">
                                {language === 'ko' ? "규칙 추가하기" : "Add House Rule"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('goal')}
                            className="py-4 px-6 flex-row items-center active:bg-gray-50"
                        >
                            <Text className="text-2xl mr-3">🏆</Text>
                            <Text className="text-base font-bold text-gray-900">
                                {language === 'ko' ? "목표 추가하기" : "Add Goal"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* 규칙 추가 모달 - Supanova 바텀시트 */}
            <Modal visible={ruleModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => { setRuleModalVisible(false); resetRuleForm(); setRuleStep(1); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg", themeBg)}>
                                    <Ionicons name="document-text-sharp" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">새 규칙 추가</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {ruleStep} of 2</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                                {ruleStep === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">규칙 유형 선택</Text>
                                        <View className="flex-row flex-wrap gap-2 mb-6">
                                            {RULE_TYPES.map((type) => (
                                                <TouchableOpacity
                                                    key={type.id}
                                                    onPress={() => setRuleType(type.id)}
                                                    className={cn(
                                                        "flex-row items-center px-4 py-3 rounded-xl border-2",
                                                        ruleType === type.id ? type.color.replace('bg-', 'bg-') + " border-transparent" : "bg-gray-50 border-gray-100"
                                                    )}
                                                >
                                                    <Ionicons name={type.icon as any} size={16} color={ruleType === type.id ? 'white' : '#6B7280'} />
                                                    <Text className={cn("ml-2 font-black", ruleType === type.id ? "text-white" : "text-gray-400")}>{type.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">내용을 입력해주세요</Text>
                                        <TextInput
                                            value={ruleTitle}
                                            onChangeText={setRuleTitle}
                                            autoFocus
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            placeholder="예: 밤 10시 이후 조용히"
                                        />
                                        <TextInput
                                            value={ruleDescription}
                                            onChangeText={setRuleDescription}
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 font-medium h-24"
                                            placeholder="상세 규칙 설명 (선택)"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>
                                )}
                            </ScrollView>

                            <View className="flex-row gap-3">
                                {ruleStep > 1 && (
                                    <TouchableOpacity onPress={() => setRuleStep(1)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200">
                                        <Text className="text-gray-600 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (ruleStep === 1) setRuleStep(2);
                                        else handleAddRule();
                                    }}
                                    disabled={ruleStep === 2 && !ruleTitle.trim()}
                                    className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (ruleStep === 2 && !ruleTitle.trim()) ? "bg-gray-200" : themeBg)}
                                >
                                    <Text className="text-white font-black">{ruleStep === 2 ? "규칙 추가! 📜" : "다음 단계"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* 목표 추가 모달 - Supanova 바텀시트 */}
            <Modal visible={goalModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => { setGoalModalVisible(false); setGoalStep(1); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg", themeBg)}>
                                    <Ionicons name="trophy-sharp" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">새 목표 추가</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {goalStep} of 2</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                                {goalStep === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">목표 유형</Text>
                                        <View className="flex-row flex-wrap gap-2 mb-6">
                                            {['vision', 'year', 'month', 'week'].map((t) => (
                                                <TouchableOpacity
                                                    key={t}
                                                    onPress={() => setSelectedGoalType(t as any)}
                                                    className={cn(
                                                        "px-5 py-3 rounded-2xl border-2",
                                                        selectedGoalType === t ? themeBg + " border-transparent" : "bg-gray-50 border-gray-100"
                                                    )}
                                                >
                                                    <Text className={cn("font-black uppercase text-xs", selectedGoalType === t ? "text-white" : "text-gray-400")}>{t}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">무엇을 이루고 싶나요?</Text>
                                        <TextInput
                                            value={goalTitle}
                                            onChangeText={setGoalTitle}
                                            autoFocus
                                            placeholder={tGoals.goal_title_placeholder}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-800 text-lg font-bold"
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        {selectedGoalType !== 'vision' ? (
                                            <View>
                                                <Text className="text-sm font-black text-gray-900 mb-4 ml-1">목표치를 설정하세요</Text>
                                                <View className="flex-row gap-4">
                                                    <View className="flex-1">
                                                        <TextInput
                                                            value={goalTarget}
                                                            onChangeText={setGoalTarget}
                                                            keyboardType="numeric"
                                                            autoFocus
                                                            className="w-full bg-gray-100 border-2 border-indigo-200 rounded-3xl p-6 text-gray-900 font-black text-3xl text-center"
                                                        />
                                                        <Text className="text-[10px] text-gray-400 text-center mt-2 font-bold uppercase tracking-widest">Target Amount</Text>
                                                    </View>
                                                    <View className="flex-1">
                                                        <TextInput
                                                            value={goalUnit}
                                                            onChangeText={setGoalUnit}
                                                            placeholder="단위 (회/원)"
                                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-3xl p-6 text-gray-800 font-black text-2xl text-center"
                                                        />
                                                        <Text className="text-[10px] text-gray-400 text-center mt-2 font-bold uppercase tracking-widest">Unit</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="items-center py-10 bg-indigo-50 rounded-[40px] border-2 border-dashed border-indigo-200">
                                                <Text className="text-2xl mb-4">✨</Text>
                                                <Text className="text-indigo-600 font-black text-center px-6">비전(Vision)은 수치가 없는{"\n"}추상적인 목표로 등록됩니다.</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>

                            <View className="flex-row gap-3">
                                {goalStep > 1 && (
                                    <TouchableOpacity onPress={() => setGoalStep(1)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200">
                                        <Text className="text-gray-600 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (goalStep === 1) setGoalStep(2);
                                        else handleAddGoal();
                                    }}
                                    disabled={goalStep === 1 && !goalTitle.trim()}
                                    className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (goalStep === 1 && !goalTitle.trim()) ? "bg-gray-200 shadow-none" : themeBg)}
                                >
                                    <Text className="text-white font-black">{goalStep === 2 ? "목표 추가! 🎯" : "다음 단계"}</Text>
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
                        target: { x: 20, y: 270, width: width - 40, height: 180, borderRadius: 24 },
                        title: language === 'ko' ? "함께하는 목표 🏆" : "Shared Goals 🏆",
                        description: language === 'ko' ? "이번 달 공과금 아끼기, 매주 대청소하기 등 메이트들과 함께 달성할 목표를 세워보세요." : "Set goals with your mates like saving on bills or weekly deep cleaning.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 300, width: width - 40, height: 180, borderRadius: 24 },
                        title: language === 'ko' ? "우리의 규칙 📜" : "House Rules 📜",
                        description: language === 'ko' ? "손님 초대, 소음 시간 등 갈등을 줄이기 위한 우리 집만의 약속을 명문화할 수 있습니다." : "Document house rules like quiet hours and guest policies to reduce conflict.",
                        position: "top"
                    },
                    {
                        target: { x: width - 60, y: 65, width: 44, height: 44, borderRadius: 22 },
                        title: language === 'ko' ? "새로운 약속 추가" : "Add New",
                        description: language === 'ko' ? "플러스 버튼을 눌러 목표나 규칙을 언제든지 새롭게 추가할 수 있어요." : "Press + to add new goals or rules anytime.",
                        position: "bottom"
                    }
                ]}
            />
        </View >
    );
}
