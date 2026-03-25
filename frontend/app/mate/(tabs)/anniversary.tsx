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
            {/* Header (Modern Simple Style) */}
            <View className="pt-12 pb-6 px-6 bg-white shadow-sm rounded-b-[40px] z-20 mb-6 flex-row justify-between items-center">
                <Text className="text-2xl font-black text-gray-900">{t.title}</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-orange-200 bg-orange-500"
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Anniversary List */}
            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
                {anniversaries.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">📅</Text>
                        <Text className="text-gray-400 text-lg">{t.empty_desc}</Text>
                        <Text className="text-gray-300 text-sm mt-2">{t.empty_hint}</Text>
                    </View>
                ) : (
                    anniversaries.map((anniversary, index) => (
                        <Animated.View
                            key={anniversary.id}
                            entering={FadeInDown.delay(index * 100)}
                            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className={`${getCategoryColor(anniversary.category)} px-3 py-1 rounded-full mr-2`}>
                                            <Text className="text-white text-xs font-bold">
                                                {getCategoryEmoji(anniversary.category)} {getCategoryLabel(anniversary.category)}
                                            </Text>
                                        </View>
                                        {anniversary.is_recurring && (
                                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                                                <Text className="text-blue-600 text-xs font-bold">🔄 {t.form_recurring}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {anniversary.title}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">
                                        {new Date(anniversary.anniversary_date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <View className="bg-orange-50 px-4 py-2 rounded-xl mb-2">
                                        <Text className="text-orange-600 text-xl font-bold">
                                            {calculateDday(anniversary.anniversary_date)}
                                        </Text>
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
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                )}
            </ScrollView>

            {/* Add Anniversary Modal */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
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
