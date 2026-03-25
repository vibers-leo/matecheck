import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { useUserStore, Todo, BudgetTransaction } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import { THEMES, AVATARS } from '../../../constants/data';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { translations, Language } from '../../../constants/I18n';
import Avatar from '../../../components/Avatar';
import TutorialOverlay from '../../../components/TutorialOverlay';
import { SkeletonCalendar, SkeletonTodoItem } from '../../../components/Skeleton';
import { Dimensions } from 'react-native';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_ELEVATION } from '../../../constants/DesignTokens';
import { suggestFairTaskAssignment, generateAssignmentMessage, analyzeTeamBalance } from '../../../utils/taskAI';

const { width, height } = Dimensions.get('window');

// Create Animated TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// --- CALENDAR LOCALE SETUP ---
LocaleConfig.locales['kr'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function PlanScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ action?: string }>();
    const {
        nestTheme, events, addEvent, voteEvent, deleteEvent, avatarId,
        todos, addTodo, toggleTodo, deleteTodo, members, language, isLoading
    } = useUserStore();

    const t = translations[language as Language];
    const tCalendar = t.calendar;
    const tTodo = t.todo;
    const tCommon = t.common;

    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeBorder = THEMES[nestTheme]?.color?.replace('bg-', 'border-') || 'border-orange-500';
    const activeColorHex = themeBg.includes('orange') ? '#FF7F50' : '#FF7F50';

    // --- SELECTION MODAL STATE ---
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);

    // --- CALENDAR STATE ---
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [calModalVisible, setCalModalVisible] = useState(false);
    const [eventText, setEventText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [eventTime, setEventTime] = useState<string>('');
    const [isTimeEnabled, setIsTimeEnabled] = useState(false);
    const [eventBudgetAmount, setEventBudgetAmount] = useState('');
    const [eventBudgetCategory, setEventBudgetCategory] = useState<BudgetTransaction['category']>('etc');
    const [isBudgetEnabled, setIsBudgetEnabled] = useState(false);
    const [eventRepeat, setEventRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

    // --- TODO STATE ---
    const [todoModalVisible, setTodoModalVisible] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([members[0]?.id || '0']);
    const [repeatOption, setRepeatOption] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
    const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);

    // --- STEP-BY-STEP UI STATE ---
    const [calStep, setCalStep] = useState(1);
    const [todoStep, setTodoStep] = useState(1);

    // Handle Deep Linking / Params
    React.useEffect(() => {
        if (params.action === 'add') {
            setCalModalVisible(true); // Default to calendar add if general add
            router.setParams({ action: '' });
        }
    }, [params.action]);

    // --- ACTIONS ---
    const handleAddButtonPress = () => {
        setSelectionModalVisible(true);
    };

    const handleSelectAction = (action: 'event' | 'todo' | 'rotation') => {
        setSelectionModalVisible(false);
        setTimeout(() => {
            if (action === 'event') setCalModalVisible(true);
            else if (action === 'todo') setTodoModalVisible(true);
            else if (action === 'rotation') router.push('/chore_rotation');
        }, 300);
    };

    // --- CALENDAR LOGIC ---
    const handleDayPress = useCallback((day: DateData) => setSelectedDate(day.dateString), []);
    const isDateInRange = useCallback((target: string, start: string, end?: string) => {
        if (!end) return target === start;
        return target >= start && target <= end;
    }, []);
    const selectedEvents = useMemo(() =>
        events.filter((e: any) => isDateInRange(selectedDate, e.date, e.endDate)),
        [events, selectedDate, isDateInRange]
    );

    const renderDay = ({ date, state }: any) => {
        if (!date) return <View />;
        const dayEvents = events.filter((e: any) => isDateInRange(date.dateString, e.date, e.endDate));
        const isSelected = selectedDate === date.dateString;
        const isToday = today === date.dateString;

        return (
            <TouchableOpacity onPress={() => handleDayPress(date)} className="w-[100%] h-16 items-center pt-1">
                <View className={cn("w-6 h-6 rounded-full items-center justify-center mb-0.5", isSelected ? themeBg : "bg-transparent")}>
                    <Text className={cn("font-medium text-xs", isSelected ? "text-white font-bold" : (state === 'disabled' ? "text-gray-300" : "text-gray-800"), !isSelected && isToday ? "text-blue-600 font-bold" : "")}>{date.day}</Text>
                </View>
                <View className="w-full px-0.5 gap-0.5">
                    {dayEvents.slice(0, 2).map((evt: any, i: number) => (
                        <View key={i} className={cn("rounded px-1 py-0.5 flex-row items-center", isSelected ? "bg-gray-800" : themeBg)}>
                            <Text className="text-[8px] text-white font-bold" numberOfLines={1}>{evt.title}</Text>
                        </View>
                    ))}
                    {dayEvents.length > 2 && <Text className="text-[8px] text-gray-400 text-center">+{dayEvents.length - 2}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const addDays = (dateStr: string, days: number) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    const onAddEvent = () => {
        if (!eventText.trim()) return;
        const timeToSend = isTimeEnabled && eventTime.trim() ? eventTime.trim() : undefined;
        const budgetInfo = isBudgetEnabled && eventBudgetAmount.trim()
            ? { amount: parseInt(eventBudgetAmount.replace(/[^0-9]/g, '')), category: eventBudgetCategory }
            : undefined;

        addEvent(eventText, selectedDate, selectedImage || undefined, endDate || undefined, timeToSend, budgetInfo, eventRepeat);
        setEventText(''); setSelectedImage(null); setEndDate(null); setEventTime(''); setEventRepeat('none');
        setIsTimeEnabled(false); setEventBudgetAmount(''); setEventBudgetCategory('etc'); setIsBudgetEnabled(false);
        setCalModalVisible(false);
    };

    const pickImage = async (forTodo = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5,
        });
        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    // --- TODO LOGIC ---
    const dailyMissions = useMemo(() =>
        todos.filter((t: any) => t.repeat !== 'weekly'),
        [todos]
    );
    const weeklyMissions = useMemo(() =>
        todos.filter((t: any) => t.repeat === 'weekly'),
        [todos]
    );

    // AI 공평한 일 분배 추천
    const taskAssignmentScores = useMemo(() =>
        suggestFairTaskAssignment(members, todos, 30),
        [members, todos]
    );

    const teamBalance = useMemo(() =>
        analyzeTeamBalance(members, todos),
        [members, todos]
    );

    const getFutureDate = (months: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    const handleAddTodo = useCallback(() => {
        if (newTodoTitle.trim()) {
            addTodo(newTodoTitle, selectedAssigneeIds, repeatOption, selectedImage || undefined);
            setNewTodoTitle(''); setRepeatOption('none'); setIsRepeatEnabled(false); setSelectedImage(null); setRepeatEndDate(null); setTodoModalVisible(false);
        }
    }, [newTodoTitle, selectedAssigneeIds, repeatOption, selectedImage, addTodo]);

    const toggleAssignee = (id: string) => {
        if (selectedAssigneeIds.includes(id)) {
            if (selectedAssigneeIds.length > 1) setSelectedAssigneeIds(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedAssigneeIds(prev => [...prev, id]);
        }
    };

    const TodoItem = React.memo(({ item, index }: { item: Todo, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)} layout={Layout.springify()} className={cn("flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border", item.isCompleted ? "border-gray-100 opacity-60" : "border-gray-100")}>
            <TouchableOpacity onPress={() => toggleTodo(item.id, '0')} className={cn("w-6 h-6 rounded-md border-2 mr-3 items-center justify-center", item.isCompleted ? `${themeBg} ${themeBorder}` : "border-gray-300 bg-white")}>
                {item.isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>
            <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1 mb-1">
                    {item.repeat === 'daily' && <View className="bg-blue-100 px-1.5 py-0.5 rounded text-xs"><Text className="text-blue-600 text-[10px] font-bold">{tTodo.daily_badge}</Text></View>}
                    <Text className={cn("text-lg font-medium", item.isCompleted ? "text-gray-400 line-through" : "text-gray-800")}>{item.title}</Text>
                </View>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-lg mb-1" />}
            </View>
            <View className="items-end justify-center">
                <View className="flex-row pl-2">
                    {item.assignees?.map((assignee, i) => (
                        <Avatar
                            key={assignee.id}
                            source={(AVATARS[assignee.avatarId] || AVATARS[0]).image}
                            size="sm"
                            className="-ml-2"
                            borderColor="#FFFFFF"
                            borderWidth={2}
                        />
                    ))}
                </View>
            </View>
            <TouchableOpacity onPress={() => deleteTodo(item.id)} className="ml-2 pl-2 border-l border-gray-100">
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </Animated.View>
    ), (prevProps, nextProps) => {
        return prevProps.item.id === nextProps.item.id &&
               prevProps.item.isCompleted === nextProps.item.isCompleted &&
               prevProps.item.title === nextProps.item.title;
    });

    return (
        <View className="flex-1 bg-[#F2F4F6]">
            {/* Header */}
            {/* Header (Modern Simple Style) */}
            {/* Header (Toss Style) */}
            <View className="pt-4 pb-4 px-6 z-10" style={{ backgroundColor: TDS_COLORS.grey100 }}>
                <View className="flex-row items-center justify-between">
                    <Text className="font-bold" style={{ fontSize: TDS_TYPOGRAPHY.display1.fontSize, color: TDS_COLORS.grey900, letterSpacing: TDS_TYPOGRAPHY.display1.letterSpacing }}>
                        {tCalendar.title}
                    </Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="bg-white p-2 rounded-full shadow-sm">
                        <Ionicons name="help" size={20} color={TDS_COLORS.grey500} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Single Page ScrollView */}
            <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Calendar Section - Clean Card */}
                {isLoading.events ? (
                    <View className="mx-4 mt-2 mb-6">
                        <SkeletonCalendar />
                    </View>
                ) : (
                    <View className="mx-4 mt-2 bg-white rounded-[24px] p-4 mb-6" style={TDS_ELEVATION.card}>
                        <Calendar
                            current={today}
                            dayComponent={renderDay}
                            key={JSON.stringify(events)}
                            theme={{ arrowColor: activeColorHex, monthTextColor: '#1F2937', textMonthFontWeight: '800' }}
                        />
                    </View>
                )}

                {/* Selected Date Events */}
                <View className="px-6 mb-8">
                    {/* Date Header + Inline Add Button */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-800 flex-row items-center">
                            📅 {Number(selectedDate.split('-')[1])}월 {Number(selectedDate.split('-')[2])}일
                        </Text>
                        <TouchableOpacity
                            onPress={() => setCalModalVisible(true)}
                            className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex-row items-center shadow-sm active:bg-gray-50"
                        >
                            <Ionicons name="add" size={14} color="#374151" />
                            <Text className="text-xs font-bold text-gray-700 ml-1">
                                {language === 'ko' ? "이 날짜에 추가" : "Add to this date"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedEvents.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setCalModalVisible(true)}
                            className="bg-gray-50 rounded-2xl p-8 items-center justify-center border-2 border-dashed border-gray-200 active:bg-gray-100"
                        >
                            <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-3 shadow-sm">
                                <Ionicons name="add" size={24} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-500 font-medium text-sm">
                                {language === 'ko' ? "예정된 일정이 없어요" : "No events scheduled"}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-1">
                                {language === 'ko' ? "터치해서 일정을 추가해보세요" : "Tap to add a new event"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        selectedEvents.map((evt: any, idx: number) => {
                            const isVote = evt.type === 'vote';
                            const voteCount = evt.votes[selectedDate]?.length || 0;
                            const hasVoted = evt.votes[selectedDate]?.includes(String(avatarId));
                            return (
                                <Animated.View key={evt.id} entering={FadeInUp.delay(idx * 100)} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
                                    <View className="flex-row items-start gap-3">
                                        <View className={cn("w-1 h-full rounded-full absolute left-0 top-0 bottom-0", themeBg)} />
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row justify-between items-start">
                                                <View>
                                                    <Text className="text-gray-800 font-bold text-lg">{evt.title} {evt.time && <Text className={cn("text-base font-medium", themeText)}> {evt.time}</Text>}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => deleteEvent(evt.id)}><Ionicons name="trash-outline" size={20} color="#9CA3AF" /></TouchableOpacity>
                                            </View>
                                            {evt.imageUrl && <Image source={{ uri: evt.imageUrl }} className="w-full h-32 rounded-lg my-2 bg-gray-100" resizeMode="cover" />}
                                            {isVote && (
                                                <TouchableOpacity onPress={() => voteEvent(evt.id, selectedDate, String(avatarId))} className={cn("flex-row items-center px-4 py-2 rounded-xl mt-2 border", hasVoted ? `${themeBg} border-transparent` : "bg-gray-50 border-gray-200")}>
                                                    <Text className={cn("text-sm font-bold mr-2", hasVoted ? "text-white" : "text-gray-500")}>{hasVoted ? "참가 완료" : "참가하기"}</Text>
                                                    <View className={cn("px-2 py-0.5 rounded-full", hasVoted ? "bg-white/20" : "bg-white border border-gray-200")}><Text className={cn("text-xs font-bold", hasVoted ? "text-white" : "text-gray-500")}>{voteCount}명</Text></View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </View>

                {/* Todos Section */}
                <View className="px-6">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">✅ {language === 'ko' ? "할 일" : "Todo"}</Text>
                    </View>

                    {isLoading.todos ? (
                        <>
                            <SkeletonTodoItem />
                            <SkeletonTodoItem />
                            <SkeletonTodoItem />
                        </>
                    ) : todos.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setTodoModalVisible(true)}
                            className="bg-gray-50 rounded-2xl p-8 items-center justify-center border-2 border-dashed border-gray-200 active:bg-gray-100"
                        >
                            <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-3 shadow-sm">
                                <Ionicons name="add" size={24} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-500 text-sm font-medium">{tTodo.empty_list_title}</Text>
                            <Text className="text-gray-400 text-xs mt-1">
                                {language === 'ko' ? "터치해서 할 일을 추가해보세요" : "Tap to add a new task"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <Text className="text-sm font-bold text-gray-500 mb-2 ml-1">{tTodo.today}</Text>
                            {dailyMissions.length > 0 ? dailyMissions.map((item: any, index: number) => <TodoItem key={item.id} item={item} index={index} />) : <Text className="text-gray-400 ml-1 mb-6 text-xs">{tTodo.empty_today}</Text>}

                            <View className="h-4" />

                            <Text className="text-sm font-bold text-gray-500 mb-2 ml-1">{tTodo.weekly}</Text>
                            {weeklyMissions.length > 0 ? weeklyMissions.map((item: any, index: number) => <TodoItem key={item.id} item={item} index={index} />) : <Text className="text-gray-400 ml-1 text-xs">{tTodo.empty_weekly}</Text>}
                        </>
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
                            onPress={() => handleSelectAction('event')}
                            className="p-5 border-b border-gray-100 flex-row items-center justify-center bg-gray-50 active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">📅</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "일정 추가하기" : "Add Event"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('todo')}
                            className="p-5 border-b border-gray-100 flex-row items-center justify-center bg-white active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">✅</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "할 일 추가하기" : "Add Todo"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('rotation')}
                            className="p-5 flex-row items-center justify-center bg-white active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">🔄</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "당번 규칙 정하기" : "Set Rotation"}
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

            {/* Calendar Modal */}
            <Modal animationType="fade" transparent={true} visible={calModalVisible} onRequestClose={() => setCalModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-black/60 justify-center px-6"
                >
                    <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => { setCalModalVisible(false); setCalStep(1); }}
                            className="absolute top-6 right-6 z-10 w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>

                        {/* Header / Info */}
                        <View className="mb-8 items-center">
                            <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4", themeBg)}>
                                <Ionicons name="calendar-sharp" size={32} color="white" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900">{tCalendar.add_event}</Text>
                            <Text className="text-gray-400 font-bold mt-1">Step {calStep} of 3</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                            {calStep === 1 && (
                                <View>
                                    <Text className="text-sm font-black text-gray-900 mb-3 ml-1">제목을 입력해주세요</Text>
                                    <TextInput
                                        value={eventText}
                                        onChangeText={setEventText}
                                        placeholder={tCalendar.event_title_placeholder}
                                        className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                        autoFocus
                                    />

                                    <View className="flex-row items-center justify-between px-1 mb-2">
                                        <Text className="text-sm font-black text-gray-900">시간 설정</Text>
                                        <TouchableOpacity onPress={() => setIsTimeEnabled(!isTimeEnabled)}>
                                            <Ionicons name={isTimeEnabled ? "checkbox" : "square-outline"} size={24} color={isTimeEnabled ? "#6366F1" : "#D1D5DB"} />
                                        </TouchableOpacity>
                                    </View>

                                    {isTimeEnabled && (
                                        <TextInput
                                            value={eventTime}
                                            onChangeText={setEventTime}
                                            placeholder={language === 'ko' ? "예: 오후 2시" : "e.g. 2:00 PM"}
                                            className="bg-gray-50 border-2 border-indigo-100 rounded-2xl p-5 text-gray-900 text-lg font-bold"
                                        />
                                    )}
                                </View>
                            )}

                            {calStep === 2 && (
                                <View>
                                    <Text className="text-sm font-black text-gray-900 mb-4 ml-1">일정 반복</Text>
                                    <View className="flex-row flex-wrap gap-2 mb-6">
                                        {(['none', 'weekly', 'monthly'] as const).map((opt) => (
                                            <TouchableOpacity
                                                key={opt}
                                                onPress={() => setEventRepeat(opt)}
                                                className={cn(
                                                    "flex-1 min-w-[30%] py-4 rounded-2xl border-2 items-center justify-center",
                                                    eventRepeat === opt ? themeBg + " " + themeBorder : "bg-gray-50 border-gray-100"
                                                )}
                                            >
                                                <Text className={cn("font-black text-sm", eventRepeat === opt ? "text-white" : "text-gray-400")}>
                                                    {opt === 'none' ? "반복 없음" : opt === 'weekly' ? "매주" : "매월 (월세 등)"}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {!eventRepeat || eventRepeat === 'none' ? (
                                        <View>
                                            <Text className="text-sm font-black text-gray-900 mb-4 ml-1">기간 (선택)</Text>
                                            <View className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
                                                <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                    <Text className="text-gray-400 font-bold">시작일</Text>
                                                    <Text className="text-gray-900 font-black text-lg">{selectedDate}</Text>
                                                </View>
                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-gray-400 font-bold">종료일</Text>
                                                    <TouchableOpacity
                                                        onPress={() => setEndDate(endDate ? null : addDays(selectedDate, 1))}
                                                        className={cn("px-4 py-2 rounded-xl", endDate ? themeBg : "bg-gray-200")}
                                                    >
                                                        <Text className="text-white font-black">{endDate || "단기 일정"}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="bg-indigo-50 p-4 rounded-xl items-center">
                                            <Text className="text-indigo-600 font-bold text-center">
                                                {eventRepeat === 'monthly' ? "매월 자동으로 일정이 생성되고,\n공금 지출을 설정하면 '고정 지출'에도 등록됩니다!" : "매주 반복되는 일정입니다."}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {calStep === 3 && (
                                <View>
                                    <View className="flex-row items-center justify-between mb-4">
                                        <Text className="text-sm font-black text-gray-900 ml-1">공금 지출 연동</Text>
                                        <TouchableOpacity onPress={() => setIsBudgetEnabled(!isBudgetEnabled)}>
                                            <Ionicons name={isBudgetEnabled ? "checkbox" : "square-outline"} size={24} color={isBudgetEnabled ? "#F59E0B" : "#D1D5DB"} />
                                        </TouchableOpacity>
                                    </View>

                                    {isBudgetEnabled ? (
                                        <View className="bg-orange-50 rounded-3xl p-6 border-2 border-orange-100">
                                            <TextInput
                                                value={eventBudgetAmount}
                                                onChangeText={setEventBudgetAmount}
                                                placeholder="금액 입력"
                                                keyboardType="numeric"
                                                className="bg-white border-2 border-orange-200 rounded-2xl p-4 text-gray-900 text-lg font-bold mb-4"
                                                autoFocus
                                            />
                                            <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl border-2 border-orange-200">
                                                <Text className="text-orange-600 font-bold">카테고리</Text>
                                                <TouchableOpacity onPress={() => {
                                                    const categories: BudgetTransaction['category'][] = ['food', 'housing', 'living', 'transport', 'etc'];
                                                    const idx = categories.indexOf(eventBudgetCategory);
                                                    setEventBudgetCategory(categories[(idx + 1) % categories.length]);
                                                }}>
                                                    <Text className="text-gray-900 font-black uppercase">{eventBudgetCategory}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="bg-gray-50 rounded-3xl p-8 items-center border-2 border-dashed border-gray-200">
                                            <Ionicons name="wallet-outline" size={32} color="#94A3B8" />
                                            <Text className="text-gray-400 font-bold mt-3">지출 정보가 없습니다</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            {calStep > 1 && (
                                <TouchableOpacity
                                    onPress={() => setCalStep(calStep - 1)}
                                    className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200"
                                >
                                    <Text className="text-gray-600 font-black">이전</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    if (calStep < 3) setCalStep(calStep + 1);
                                    else onAddEvent();
                                }}
                                disabled={calStep === 1 && !eventText.trim()}
                                className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (calStep === 1 && !eventText.trim()) ? "bg-gray-200 shadow-none" : themeBg)}
                            >
                                <Text className="text-white font-black">{calStep === 3 ? "일정 완성! ✨" : "계속하기"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Todo Modal */}
            <Modal animationType="fade" transparent={true} visible={todoModalVisible} onRequestClose={() => setTodoModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-black/60 justify-center px-6"
                >
                    <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => { setTodoModalVisible(false); setTodoStep(1); }}
                            className="absolute top-6 right-6 z-10 w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View className="mb-8 items-center">
                            <View className={cn("w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg", themeBg)}>
                                <Ionicons name="checkbox" size={32} color="white" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900">{tTodo.add_modal}</Text>
                            <Text className="text-gray-400 font-bold mt-1">Step {todoStep} of 2</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                            {todoStep === 1 ? (
                                <View>
                                    <Text className="text-sm font-black text-gray-900 mb-3 ml-1">집안일 제목</Text>
                                    <TextInput
                                        value={newTodoTitle}
                                        onChangeText={setNewTodoTitle}
                                        placeholder={tTodo.placeholder_input}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-800 text-lg font-bold mb-6"
                                        autoFocus
                                    />

                                    {/* AI 추천 배너 */}
                                    {taskAssignmentScores.length > 0 && (
                                        <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl mb-4 border-2 border-blue-200">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                                                    <Text className="text-lg">🤖</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-xs font-bold text-blue-900">AI 공평 추천</Text>
                                                    <Text className="text-[10px] text-blue-600">{teamBalance.message}</Text>
                                                </View>
                                            </View>
                                            <View className="flex-row flex-wrap gap-2">
                                                {taskAssignmentScores.slice(0, 3).map((score, idx) => (
                                                    <TouchableOpacity
                                                        key={score.memberId}
                                                        onPress={() => {
                                                            if (!selectedAssigneeIds.includes(score.memberId)) {
                                                                setSelectedAssigneeIds([...selectedAssigneeIds, score.memberId]);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 rounded-xl border-2 flex-row items-center",
                                                            idx === 0 ? "bg-blue-500 border-blue-600" : "bg-white border-blue-200"
                                                        )}
                                                    >
                                                        <Text className={cn("text-xs font-bold mr-1", idx === 0 ? "text-white" : "text-blue-900")}>
                                                            {idx === 0 ? "👍 " : ""}{score.memberName}
                                                        </Text>
                                                        <Text className={cn("text-[10px]", idx === 0 ? "text-blue-100" : "text-blue-600")}>
                                                            {score.reason}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    <Text className="text-sm font-black text-gray-900 mb-3 ml-1">담당 메이트 선택</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                        {members.map(m => (
                                            <TouchableOpacity
                                                key={m.id}
                                                onPress={() => {
                                                    if (selectedAssigneeIds.includes(m.id)) {
                                                        setSelectedAssigneeIds(selectedAssigneeIds.filter(id => id !== m.id));
                                                    } else {
                                                        setSelectedAssigneeIds([...selectedAssigneeIds, m.id]);
                                                    }
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl border-2 mb-2 mr-2",
                                                    selectedAssigneeIds.includes(m.id) ? "bg-indigo-600 border-indigo-600" : "bg-gray-50 border-gray-100"
                                                )}
                                            >
                                                <Text className={cn("font-bold", selectedAssigneeIds.includes(m.id) ? "text-white" : "text-gray-400")}>{m.nickname}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-sm font-black text-gray-900 mb-4 ml-1">반복 일정 설정</Text>
                                    <View className="flex-row flex-wrap gap-2 mb-6">
                                        {(['none', 'daily', 'weekly', 'monthly'] as const).map((opt) => (
                                            <TouchableOpacity
                                                key={opt}
                                                onPress={() => setRepeatOption(opt)}
                                                className={cn(
                                                    "flex-1 min-w-[45%] py-4 rounded-2xl border-2 items-center justify-center",
                                                    repeatOption === opt ? themeBg + " " + themeBorder : "bg-gray-50 border-gray-100"
                                                )}
                                            >
                                                <Text className={cn("font-black", repeatOption === opt ? "text-white" : "text-gray-400")}>
                                                    {opt === 'none' ? "반복 안함" : opt === 'daily' ? "매일" : opt === 'weekly' ? "매주" : "매월"}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {repeatOption !== 'none' && (
                                        <View className="bg-indigo-50 p-6 rounded-[32px] border-2 border-indigo-100">
                                            <Text className="text-indigo-600 font-bold mb-3">반복 기한</Text>
                                            <View className="flex-row gap-2">
                                                {[1, 3, 6].map(month => (
                                                    <TouchableOpacity
                                                        key={month}
                                                        onPress={() => setRepeatEndDate(getFutureDate(month))}
                                                        className={cn("flex-1 py-3 rounded-xl border-2", repeatEndDate === getFutureDate(month) ? "bg-white border-indigo-500" : "bg-white border-white")}
                                                    >
                                                        <Text className={cn("text-center font-bold", repeatEndDate === getFutureDate(month) ? "text-indigo-600" : "text-gray-400")}>{month}개월</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            {todoStep > 1 && (
                                <TouchableOpacity
                                    onPress={() => setTodoStep(todoStep - 1)}
                                    className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200"
                                >
                                    <Text className="text-gray-600 font-black">이전</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    if (todoStep < 2) setTodoStep(2);
                                    else handleAddTodo();
                                }}
                                disabled={todoStep === 1 && (!newTodoTitle.trim() || selectedAssigneeIds.length === 0)}
                                className={cn("flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg", (todoStep === 1 && (!newTodoTitle.trim() || selectedAssigneeIds.length === 0)) ? "bg-gray-200 shadow-none" : themeBg)}
                            >
                                <Text className="text-white font-black">{todoStep === 2 ? "할 일 등록! ✨" : "다음 단계"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 150, width: width - 40, height: 320, borderRadius: 24 },
                        title: language === 'ko' ? "우리 집 공유 달력 📅" : "Shared Calendar 📅",
                        description: language === 'ko' ? "룸메이트와 공유해야 할 외박, 친구 방문, 청소일 등을 달력에 기록하세요." : "Record events like sleepover plans, guest visits, and cleaning days.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 500, width: width - 40, height: 120, borderRadius: 24 },
                        title: language === 'ko' ? "해야 할 일 (Todo) ✅" : "Todo List ✅",
                        description: language === 'ko' ? "설거지, 쓰레기 분리수거 등 매일 또는 매주 반복되는 할 일을 등록하고 관리하세요." : "Register daily or weekly recurring chores like dishes and trash.",
                        position: "top"
                    },
                    {
                        target: { x: width - 60, y: 65, width: 44, height: 44, borderRadius: 22 },
                        title: language === 'ko' ? "빠른 추가하기" : "Quick Add",
                        description: language === 'ko' ? "플러스 버튼을 눌러 일정이나 할 일을 즉시 추가할 수 있습니다." : "Press the + button to instantly add events or tasks.",
                        position: "bottom"
                    }
                ]}
            />
        </View >
    );
}
