import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
// import { useUserStore, Goal } from '../../../store/userStore'; // Removed duplicate
import { cn } from '../../../lib/utils';
import { THEMES } from '../../../constants/data';
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
        language, nestId, rules, addRule, deleteRule, syncRules, isMaster
    } = useUserStore();
    const router = useRouter();
    const params = useLocalSearchParams<{ action?: string }>();

    // Explicitly cast translations to avoid type errors
    const tCommon = translations[language as Language].common;
    const tGoals = translations[language as Language].goal;

    // Theme Colors
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

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
    const GoalSection = ({ type, label, icon }: { type: Goal['type'], label: string, icon: string }) => {
        const sectionGoals = goals.filter((g: any) => g.type === type);

        if (sectionGoals.length === 0) return null;

        return (
            <View className="mb-8">
                <View className="flex-row items-center mb-4 px-2">
                    <Text className="text-2xl mr-2">{icon}</Text>
                    <Text className="text-xl font-bold text-gray-800">{label}</Text>
                </View>

                {sectionGoals.map((goal: Goal, index: number) => (
                    <Animated.View
                        key={goal.id}
                        entering={FadeInUp.delay(index * 100)}
                        layout={Layout.springify()}
                        className="bg-white p-5 rounded-2xl mb-3 shadow-sm border border-gray-100"
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-1 flex-row items-center mr-2">
                                {goal.current >= goal.target && <Text className="mr-2">🎉</Text>}
                                <Text className={cn("text-lg font-bold", goal.current >= goal.target ? "text-gray-400 line-through" : "text-gray-800")} numberOfLines={1}>
                                    {goal.title}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => confirmDeleteGoal(goal.id)} className="p-1">
                                <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={() => decrementGoalProgress(goal.id)}
                                className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center border border-gray-200"
                                disabled={goal.current <= 0}
                            >
                                <Ionicons name="remove" size={16} color={goal.current <= 0 ? "#D1D5DB" : "#4B5563"} />
                            </TouchableOpacity>

                            <View className="flex-1 mx-3">
                                <View className="flex-row justify-between items-end mb-1.5 px-1">
                                    <Text className="text-xs font-bold text-gray-500">
                                        {goal.current}
                                        <Text className="font-normal text-gray-400"> / {goal.target} {goal.unit}</Text>
                                    </Text>
                                    <Text className="text-[10px] text-gray-400">{Math.min(Math.round((goal.current / goal.target) * 100), 100)}%</Text>
                                </View>
                                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        className={cn("h-full rounded-full", themeBg)}
                                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => incrementGoalProgress(goal.id)}
                                className={cn("w-8 h-8 rounded-full items-center justify-center shadow-sm", themeBg)}
                                disabled={goal.current >= goal.target}
                                style={{ opacity: goal.current >= goal.target ? 0.5 : 1 }}
                            >
                                <Ionicons name="add" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                ))}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header (Modern Simple Style) */}
            <View className="pt-12 pb-6 px-6 bg-white shadow-sm rounded-b-[40px] z-20 mb-6 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-black text-gray-900">
                        {language === 'ko' ? "약속" : "Promises"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-1">
                        <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleAddButtonPress}
                    className={cn("w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-orange-200", themeBg)}
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Content Info */}
            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                {/* Goals Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-4 px-1">
                        <Text className="text-xl font-black text-gray-900">🏆 {language === 'ko' ? "우리의 목표" : "Our Goals"}</Text>
                    </View>

                    {goals.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setGoalModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center border border-gray-100 shadow-sm active:bg-gray-50 bg-white"
                        >
                            <View className="w-16 h-16 bg-yellow-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="trophy-outline" size={32} color="#fbbf24" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg mb-2">
                                {language === 'ko' ? "목표를 세워보세요" : "Set your goals"}
                            </Text>
                            <Text className="text-gray-400 text-center text-sm leading-5">
                                {language === 'ko' ? "함께 이루고 싶은 꿈이 있나요?\n터치해서 목표를 추가해보세요!" : "Dreaming of something together?\nTap to add a new goal!"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <GoalSection type="vision" label={language === 'ko' ? "우리의 꿈 (Vision)" : "Our Vision"} icon="✨" />
                            <GoalSection type="year" label={language === 'ko' ? "올해의 목표" : "Yearly Goals"} icon="📅" />
                            <GoalSection type="month" label={language === 'ko' ? "이번 달 목표" : "Monthly Goals"} icon="🎯" />
                            <GoalSection type="week" label={language === 'ko' ? "이번 주 목표" : "Weekly Goals"} icon="🔥" />
                        </>
                    )}
                </View>

                {/* Rules Section (Moved to Bottom) */}
                <View className="mb-24">
                    <View className="flex-row items-center mb-4 px-1">
                        <Text className="text-xl font-black text-gray-900">📜 {language === 'ko' ? "우리 집 규칙" : "House Rules"}</Text>
                    </View>

                    {rules.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setRuleModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center border border-gray-100 shadow-sm active:bg-gray-50"
                        >
                            <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="document-text-outline" size={32} color="#6366f1" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg mb-2">
                                {language === 'ko' ? "규칙이 비어있어요" : "No rules yet"}
                            </Text>
                            <Text className="text-gray-400 text-center text-sm leading-5">
                                {language === 'ko' ? "서로를 위한 약속을 만들어볼까요?\n터치해서 첫 규칙을 추가해보세요!" : "Create promises for each other.\nTap to add your first rule!"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        rules.map((rule: HouseRule, index: number) => {
                            const typeInfo = getRuleTypeInfo(rule.rule_type);
                            return (
                                <Animated.View
                                    key={rule.id}
                                    entering={FadeInDown.delay(index * 100)}
                                    className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`${typeInfo.color} w-10 h-10 rounded-xl items-center justify-center mr-3`}>
                                                <Ionicons name={typeInfo.icon as any} size={20} color="white" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-400 mb-0.5">{typeInfo.label}</Text>
                                                <Text className="text-lg font-bold text-gray-900">{rule.title}</Text>
                                            </View>
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
                                            className="p-2 -mr-2"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    {rule.description ? (
                                        <Text className="text-gray-500 leading-5 text-sm ml-[52px]">{rule.description}</Text>
                                    ) : null}
                                </Animated.View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* --- SELECTION MODAL --- */}
            <Modal visible={selectionModalVisible} animationType="fade" transparent>
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end pb-10 px-4"
                    activeOpacity={1}
                    onPress={() => setSelectionModalVisible(false)}
                >
                    <Animated.View
                        entering={FadeInUp.springify()}
                        className="bg-white rounded-2xl overflow-hidden shadow-xl"
                    >
                        <TouchableOpacity
                            onPress={() => handleSelectAction('rule')}
                            className="p-5 border-b border-gray-100 flex-row items-center justify-center bg-gray-50 active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">📜</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "규칙 추가하기" : "Add House Rule"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('goal')}
                            className="p-5 flex-row items-center justify-center bg-white active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">🏆</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "목표 추가하기" : "Add Goal"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity
                        onPress={() => setSelectionModalVisible(false)}
                        className="bg-white rounded-xl p-4 mt-3 items-center shadow-lg"
                    >
                        <Text className="text-lg font-bold text-gray-900">{tCommon.cancel}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* --- ADD RULE MODAL --- */}
            <Modal visible={ruleModalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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

            {/* --- ADD GOAL MODAL --- */}
            <Modal visible={goalModalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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
