import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { useUserStore, Todo } from '../../../store/userStore';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import { getThemeColors } from '../../../utils/theme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { translations, Language } from '../../../constants/I18n';
import Avatar from '../../../components/Avatar';
import TutorialOverlay from '../../../components/TutorialOverlay';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
        todos, addTodo, toggleTodo, deleteTodo, members, language, appMode
    } = useUserStore();

    const t = translations[language as Language];
    const tCalendar = t.calendar;
    const tTodo = t.todo;
    const tCommon = t.common;

    const { bg: themeBg, text: themeText, border: themeBorder } = getThemeColors(nestTheme, appMode);
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
    const handleDayPress = (day: DateData) => setSelectedDate(day.dateString);
    const isDateInRange = (target: string, start: string, end?: string) => {
        if (!end) return target === start;
        return target >= start && target <= end;
    };
    const selectedEvents = events.filter((e: any) => isDateInRange(selectedDate, e.date, e.endDate));

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

        addEvent(eventText, selectedDate, selectedImage || undefined, endDate || undefined, timeToSend, budgetInfo);
        setEventText(''); setSelectedImage(null); setEndDate(null); setEventTime('');
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
    const dailyMissions = todos.filter((t: any) => t.repeat !== 'weekly');
    const weeklyMissions = todos.filter((t: any) => t.repeat === 'weekly');

    const getFutureDate = (months: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    const handleAddTodo = () => {
        if (newTodoTitle.trim()) {
            addTodo(newTodoTitle, selectedAssigneeIds, repeatOption, selectedImage || undefined);
            setNewTodoTitle(''); setRepeatOption('none'); setIsRepeatEnabled(false); setSelectedImage(null); setRepeatEndDate(null); setTodoModalVisible(false);
        }
    };

    const toggleAssignee = (id: string) => {
        if (selectedAssigneeIds.includes(id)) {
            if (selectedAssigneeIds.length > 1) setSelectedAssigneeIds(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedAssigneeIds(prev => [...prev, id]);
        }
    };

    {/* 투두 아이템 - Supanova 리스트 스타일 */}
    const TodoItem = ({ item, index }: { item: Todo, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)} layout={Layout.springify()} className={cn("flex-row items-center py-4 px-5", item.isCompleted && "opacity-50")}>
            <TouchableOpacity onPress={() => toggleTodo(item.id, '0')} className={cn("w-6 h-6 rounded-full border-2 mr-3 items-center justify-center", item.isCompleted ? `${themeBg} ${themeBorder}` : "border-gray-300 bg-white")}>
                {item.isCompleted && <Ionicons name="checkmark" size={14} color="white" />}
            </TouchableOpacity>
            <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1.5">
                    {item.repeat === 'daily' && <View className="bg-blue-50 px-1.5 py-0.5 rounded-full"><Text className="text-blue-500 text-[10px] font-bold">{tTodo.daily_badge}</Text></View>}
                    <Text className={cn("text-base font-medium", item.isCompleted ? "text-gray-300 line-through" : "text-gray-900")}>{item.title}</Text>
                </View>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} className="w-14 h-14 rounded-xl mt-2" />}
            </View>
            <View className="items-end justify-center flex-row">
                {item.assignees?.map((assignee, i) => (
                    <Avatar
                        key={assignee.id}
                        source={(AVATARS[assignee.avatarId] || AVATARS[0]).image}
                        size="sm"
                        className="-ml-1.5"
                        borderColor="#FFFFFF"
                        borderWidth={2}
                    />
                ))}
            </View>
            <TouchableOpacity onPress={() => deleteTodo(item.id)} className="ml-3 p-1">
                <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* 헤더 - Supanova 스타일 */}
            <View className="pt-14 pb-5 px-5 bg-white z-20 flex-row justify-between items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }}>
                <View className="flex-row items-center gap-2">
                    <Text className="text-xl font-bold tracking-tight text-gray-900">
                        {tCalendar.title}
                    </Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-0.5">
                        <Ionicons name="help-circle-outline" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 메인 스크롤 */}
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* 캘린더 카드 - Supanova 카드 스타일 */}
                <View className="mx-5 mt-4 bg-white rounded-3xl p-5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                    <Calendar
                        current={today}
                        dayComponent={renderDay}
                        key={JSON.stringify(events)}
                        theme={{ arrowColor: activeColorHex, monthTextColor: '#1F2937', textMonthFontWeight: '700' }}
                    />
                </View>

                {/* 선택 날짜 일정 목록 */}
                <View className="px-5 mt-4">
                    {/* 날짜 헤더 + 추가 버튼 */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xl font-bold tracking-tight text-gray-900">
                            {Number(selectedDate.split('-')[1])}월 {Number(selectedDate.split('-')[2])}일
                        </Text>
                        <TouchableOpacity
                            onPress={() => setCalModalVisible(true)}
                            className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center active:bg-gray-200"
                        >
                            <Ionicons name="add" size={14} color="#6B7280" />
                            <Text className="text-xs font-bold text-gray-500 ml-1">
                                {language === 'ko' ? "추가" : "Add"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedEvents.length === 0 ? (
                        /* 빈 상태 - Supanova 스타일 */
                        <TouchableOpacity
                            onPress={() => setCalModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center active:bg-gray-50"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                        >
                            <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
                            <Text className="text-gray-300 font-bold text-sm mt-3">
                                {language === 'ko' ? "예정된 일정이 없어요" : "No events scheduled"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        /* 일정 카드 - 컬러 도트 + 제목 + 시간 */
                        <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                            {selectedEvents.map((evt: any, idx: number) => {
                                const isVote = evt.type === 'vote';
                                const voteCount = evt.votes[selectedDate]?.length || 0;
                                const hasVoted = evt.votes[selectedDate]?.includes(String(avatarId));
                                return (
                                    <Animated.View key={evt.id} entering={FadeInUp.delay(idx * 80)} className={cn("py-4 px-5", idx !== selectedEvents.length - 1 && "border-b border-gray-100")}>
                                        <View className="flex-row items-center">
                                            {/* 컬러 도트 */}
                                            <View className={cn("w-3 h-3 rounded-full mr-3", themeBg)} />
                                            <View className="flex-1">
                                                <Text className="text-gray-900 font-bold text-base">{evt.title}</Text>
                                                {evt.time && <Text className="text-gray-400 text-sm mt-0.5">{evt.time}</Text>}
                                            </View>
                                            <TouchableOpacity onPress={() => deleteEvent(evt.id)} className="p-1 ml-2">
                                                <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                                            </TouchableOpacity>
                                        </View>
                                        {evt.imageUrl && <Image source={{ uri: evt.imageUrl }} className="w-full h-32 rounded-2xl mt-3 bg-gray-100" resizeMode="cover" />}
                                        {isVote && (
                                            <TouchableOpacity onPress={() => voteEvent(evt.id, selectedDate, String(avatarId))} className={cn("flex-row items-center px-4 py-2.5 rounded-xl mt-3", hasVoted ? themeBg : "bg-gray-50")}>
                                                <Text className={cn("text-sm font-bold mr-2", hasVoted ? "text-white" : "text-gray-500")}>{hasVoted ? "참가 완료" : "참가하기"}</Text>
                                                <View className={cn("px-2 py-0.5 rounded-full", hasVoted ? "bg-white/20" : "bg-white")}><Text className={cn("text-xs font-bold", hasVoted ? "text-white" : "text-gray-500")}>{voteCount}명</Text></View>
                                            </TouchableOpacity>
                                        )}
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* 할 일 섹션 - Supanova 카드 */}
                <View className="px-5 mt-4">
                    <Text className="text-xl font-bold tracking-tight text-gray-900 mb-3">
                        {language === 'ko' ? "할 일" : "Todo"}
                    </Text>

                    {todos.length === 0 ? (
                        /* 빈 상태 */
                        <TouchableOpacity
                            onPress={() => setTodoModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center active:bg-gray-50"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                        >
                            <Ionicons name="checkbox-outline" size={40} color="#D1D5DB" />
                            <Text className="text-gray-300 font-bold text-sm mt-3">{tTodo.empty_list_title}</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            {/* 오늘 할 일 카드 */}
                            <View className="bg-white rounded-3xl mb-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                                <View className="px-5 pt-4 pb-2">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{tTodo.today}</Text>
                                </View>
                                {dailyMissions.length > 0 ? dailyMissions.map((item: any, index: number) => <TodoItem key={item.id} item={item} index={index} />) : <View className="px-5 pb-4"><Text className="text-gray-300 text-sm">{tTodo.empty_today}</Text></View>}
                            </View>

                            {/* 주간 할 일 카드 */}
                            <View className="bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                                <View className="px-5 pt-4 pb-2">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{tTodo.weekly}</Text>
                                </View>
                                {weeklyMissions.length > 0 ? weeklyMissions.map((item: any, index: number) => <TodoItem key={item.id} item={item} index={index} />) : <View className="px-5 pb-4"><Text className="text-gray-300 text-sm">{tTodo.empty_weekly}</Text></View>}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

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
                            onPress={() => handleSelectAction('event')}
                            className="py-4 px-6 flex-row items-center border-b border-gray-100 active:bg-gray-50"
                        >
                            <Text className="text-2xl mr-3">📅</Text>
                            <Text className="text-base font-bold text-gray-900">
                                {language === 'ko' ? "일정 추가하기" : "Add Event"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('todo')}
                            className="py-4 px-6 flex-row items-center border-b border-gray-100 active:bg-gray-50"
                        >
                            <Text className="text-2xl mr-3">✅</Text>
                            <Text className="text-base font-bold text-gray-900">
                                {language === 'ko' ? "할 일 추가하기" : "Add Todo"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('rotation')}
                            className="py-4 px-6 flex-row items-center active:bg-gray-50"
                        >
                            <Text className="text-2xl mr-3">🔄</Text>
                            <Text className="text-base font-bold text-gray-900">
                                {language === 'ko' ? "당번 규칙 정하기" : "Set Rotation"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* FAB 추가 버튼 - Supanova 스타일 */}
            <TouchableOpacity
                onPress={handleAddButtonPress}
                className={cn("absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center z-30", themeBg)}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* 일정 추가 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent={true} visible={calModalVisible} onRequestClose={() => setCalModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-black/40 justify-end"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
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
                                        <Text className="text-sm font-black text-gray-900 mb-4 ml-1">기간을 확인해주세요</Text>
                                        <View className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100 mb-4">
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
                                                    <Text className="text-white font-black">{endDate || "하루 일정"}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {endDate && (
                                            <Text className="text-indigo-600 text-xs text-center font-bold">장기 일정으로 등록됩니다 ✨</Text>
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
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* 할 일 추가 모달 - Supanova 바텀시트 */}
            <Modal animationType="slide" transparent={true} visible={todoModalVisible} onRequestClose={() => setTodoModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-black/40 justify-end"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
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
                    </TouchableWithoutFeedback>
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
