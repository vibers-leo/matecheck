import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
// import { useUserStore } from '../../../store/userStore'; // Removed duplicate
import { API_URL } from '../../../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { translations, Language } from '../../../constants/I18n';

// Anniversary interface is now imported from store
import { useUserStore } from '../../../store/userStore';

export default function AnniversaryScreen() {
    const { nestId, language, anniversaries, addAnniversary, deleteAnniversary, syncAnniversaries } = useUserStore();
    const t = translations[language as Language].anniversary;

    // Local UI state
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [dateString, setDateString] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [category, setCategory] = useState('etc');

    // --- STEP-BY-STEP UI STATE ---
    const [step, setStep] = useState(1);

    // Category Keys for internal logic
    const categoryKeys = ['birthday', 'wedding', 'love', 'work', 'etc'];

    useEffect(() => {
        if (nestId) {
            syncAnniversaries();
        }
    }, [nestId]);

    const handleAddAnniversary = async () => {
        if (!title.trim()) {
            Alert.alert(translations[language as Language].common.error, t.form_title_placeholder);
            return;
        }

        await addAnniversary(title, dateString, isRecurring, category);
        setModalVisible(false);
        resetForm();
    };

    // deleteAnniversary is imported from store and used directly in Alert callbacks

    const resetForm = () => {
        setTitle('');
        setDateString('');
        setIsRecurring(false);
        setCategory('etc');
    };

    const calculateDday = (anniversaryDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(anniversaryDate);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t.d_day;
        if (diffDays > 0) return t.d_minus.replace('{days}', diffDays.toString());
        return t.d_plus.replace('{days}', Math.abs(diffDays).toString());
    };

    const getCategoryEmoji = (cat: string) => {
        // Supports both English keys and Legacy Korean values
        const emojiMap: { [key: string]: string } = {
            'birthday': '🎂', '생일': '🎂',
            'wedding': '💍', '결혼기념일': '💍',
            'love': '❤️', '연애기념일': '❤️',
            'work': '💼', '입사기념일': '💼',
            'etc': '📅', '기타': '📅'
        };
        return emojiMap[cat] || '📅';
    };

    const getCategoryColor = (cat: string) => {
        const colorMap: { [key: string]: string } = {
            'birthday': 'bg-pink-500', '생일': 'bg-pink-500',
            'wedding': 'bg-purple-500', '결혼기념일': 'bg-purple-500',
            'love': 'bg-red-500', '연애기념일': 'bg-red-500',
            'work': 'bg-blue-500', '입사기념일': 'bg-blue-500',
            'etc': 'bg-gray-500', '기타': 'bg-gray-500'
        };
        return colorMap[cat] || 'bg-gray-500';
    };

    const getCategoryLabel = (cat: string) => {
        // If it's a known key, use translation. If not (legacy data), show as is.
        return (t.categories as any)[cat] || cat;
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* 헤더 - Supanova 스타일 */}
            <View className="pt-14 pb-5 px-5 bg-white z-20 flex-row justify-between items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }}>
                <Text className="text-xl font-bold tracking-tight text-gray-900">{t.title}</Text>
            </View>

            {/* 기념일 목록 */}
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                {anniversaries.length === 0 ? (
                    /* 빈 상태 - Supanova 스타일 */
                    <View className="bg-white rounded-3xl p-10 items-center justify-center mt-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}>
                        <Ionicons name="gift-outline" size={40} color="#D1D5DB" />
                        <Text className="text-gray-300 font-bold text-sm mt-3">{t.empty_desc}</Text>
                    </View>
                ) : (
                    anniversaries.map((anniversary, index) => {
                        const ddayText = calculateDday(anniversary.anniversary_date);
                        const isToday = ddayText === t.d_day;
                        return (
                            <Animated.View
                                key={anniversary.id}
                                entering={FadeInDown.delay(index * 80)}
                                className={cn("bg-white rounded-3xl p-5 mb-4", isToday && "border-2 border-orange-200")}
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
                            >
                                {/* D-day 뱃지 - 크게 표시 */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center gap-2">
                                        <View className={`${getCategoryColor(anniversary.category)} w-8 h-8 rounded-lg items-center justify-center`}>
                                            <Text className="text-sm">{getCategoryEmoji(anniversary.category)}</Text>
                                        </View>
                                        <Text className="text-xs font-bold text-gray-400">{getCategoryLabel(anniversary.category)}</Text>
                                        {anniversary.is_recurring && (
                                            <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                                                <Text className="text-blue-500 text-[10px] font-bold">반복</Text>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                t.delete_title,
                                                t.delete_msg,
                                                [
                                                    { text: translations[language].common.cancel, style: 'cancel' },
                                                    { text: translations[language].common.delete, style: 'destructive', onPress: () => deleteAnniversary(anniversary.id) }
                                                ]
                                            );
                                        }}
                                        className="p-1"
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row items-end justify-between">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">
                                            {anniversary.title}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {new Date(anniversary.anniversary_date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                                        </Text>
                                    </View>
                                    {/* D-day 강조 */}
                                    <View className={cn("px-4 py-2 rounded-2xl", isToday ? "bg-orange-500" : "bg-gray-50")}>
                                        <Text className={cn("text-xl font-bold", isToday ? "text-white" : "text-gray-900")}>
                                            {ddayText}
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>

            {/* FAB 추가 버튼 - Supanova 스타일 */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center z-30 bg-orange-500"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* 기념일 추가 모달 - Supanova 바텀시트 */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-[32px] p-6 relative" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                            {/* 핸들바 */}
                            <View className="items-center mb-4 -mt-2">
                                <View className="w-10 h-1 rounded-full bg-gray-200" />
                            </View>
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); setStep(1); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className="w-16 h-16 rounded-3xl bg-pink-500 items-center justify-center mb-4 shadow-lg shadow-pink-100">
                                    <Ionicons name="gift" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">{t.add_modal_title}</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {step} of 2</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                                {step === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.form_title}</Text>
                                        <TextInput
                                            value={title}
                                            onChangeText={setTitle}
                                            autoFocus
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-6"
                                            placeholder={t.form_title_placeholder}
                                        />

                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.form_category}</Text>
                                        <View className="flex-row flex-wrap gap-2 mb-4">
                                            {categoryKeys.map((catKey) => (
                                                <TouchableOpacity
                                                    key={catKey}
                                                    onPress={() => setCategory(catKey)}
                                                    className={`px-4 py-3 rounded-xl border-2 ${category === catKey ? getCategoryColor(catKey) + " border-transparent shadow-sm" : 'bg-gray-50 border-gray-100'
                                                        }`}
                                                >
                                                    <Text className={`font-black ${category === catKey ? 'text-white' : 'text-gray-400'}`}>
                                                        {getCategoryEmoji(catKey)} {(t.categories as any)[catKey]}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.form_date}</Text>
                                        <TextInput
                                            value={dateString}
                                            onChangeText={setDateString}
                                            autoFocus
                                            className="bg-gray-100 border-2 border-orange-200 rounded-2xl p-6 text-orange-600 text-3xl font-black text-center mb-6"
                                            placeholder={t.form_date_placeholder}
                                        />

                                        <TouchableOpacity
                                            onPress={() => setIsRecurring(!isRecurring)}
                                            className="flex-row items-center justify-between bg-gray-50 border-2 border-gray-100 rounded-2xl p-5"
                                        >
                                            <View>
                                                <Text className="text-gray-900 font-black mb-0.5">{t.form_recurring}</Text>
                                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Repeat Every Year</Text>
                                            </View>
                                            <View className={`w-12 h-7 rounded-full ${isRecurring ? 'bg-green-500' : 'bg-gray-200'} justify-center px-1`}>
                                                <View className={`w-5 h-5 rounded-full bg-white shadow-sm ${isRecurring ? 'self-end' : 'self-start'}`} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>

                            <View className="flex-row gap-3">
                                {step > 1 && (
                                    <TouchableOpacity onPress={() => setStep(1)} className="flex-1 py-5 rounded-3xl bg-gray-100 items-center justify-center border-2 border-gray-200">
                                        <Text className="text-gray-600 font-black">이전</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (step === 1) setStep(2);
                                        else handleAddAnniversary();
                                    }}
                                    disabled={step === 1 && !title.trim()}
                                    className={`flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg ${step === 1 && !title.trim() ? "bg-gray-100 shadow-none" : "bg-orange-500"}`}
                                >
                                    <Text className="text-white font-black">{step === 2 ? t.add_confirm : "다음 단계"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
