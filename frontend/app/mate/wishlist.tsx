import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import { translations } from '../../constants/I18n';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface WishlistItem {
    id: number;
    title: string;
    quantity: string;
    price: number;
    status: 'pending' | 'bought';
    requester_id: number;
}

export default function WishlistScreen() {
    const router = useRouter();
    const { nestId, userId, language, members } = useUserStore();
    const t = (translations[language as keyof typeof translations] as any).wishlist;

    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/wishlist_items`);
            if (response.ok) {
                const json = await response.json();
                const data = Array.isArray(json) ? json : (json.data || []);
                setItems(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async () => {
        if (!title.trim()) return;

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/wishlist_items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wishlist_item: {
                        title,
                        quantity,
                        price: parseInt(price) || 0,
                        requester_id: userId,
                        status: 'pending'
                    }
                })
            });

            if (response.ok) {
                const newItem = await response.json();
                setItems([newItem, ...items]);
                setModalVisible(false);
                resetForm();
            }
        } catch (error) {
            Alert.alert('오류', '아이템 추가에 실패했습니다.');
        }
    };

    const markBought = async (item: WishlistItem) => {
        Alert.alert(
            t.buy_confirm_title,
            t.buy_confirm_msg,
            [
                {
                    text: t.just_bought,
                    onPress: () => updateStatus(item, 'bought')
                },
                {
                    text: t.to_split_bill,
                    className: "font-bold",
                    onPress: () => {
                        updateStatus(item, 'bought');
                        router.push({
                            pathname: '/split_bills',
                            params: {
                                action: 'add',
                                title: item.title,
                                amount: item.price > 0 ? item.price : ''
                            }
                        });
                    }
                }
            ]
        );
    };

    const updateStatus = async (item: WishlistItem, status: string) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/wishlist_items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wishlist_item: { status } })
            });
            if (response.ok) {
                setItems(items.map(i => i.id === item.id ? { ...i, status: status as any } : i));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/wishlist_items/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setItems(items.filter(i => i.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setQuantity('');
        setPrice('');
        setStep(1);
    };

    const getRequesterName = (id: number) => {
        const member = members.find(m => m.id === String(id));
        return member ? member.nickname : 'Unknown';
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-50 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-gray-900">공용물품 🛒</Text>
                        <Text className="text-xs text-gray-400 font-bold">우리 집에 필요한 물건들</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="w-10 h-10 bg-teal-500 rounded-full items-center justify-center shadow-lg shadow-teal-100"
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#14B8A6" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                    {items.length === 0 ? (
                        <View className="items-center justify-center pt-24">
                            <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                                <Ionicons name="cart-outline" size={48} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-400 font-black text-lg mb-2">{t.empty_desc}</Text>
                            <Text className="text-gray-300 font-bold">{t.empty_hint}</Text>
                        </View>
                    ) : (
                        items.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(index * 50)}
                                layout={Layout.springify()}
                                className={`mb-4 p-5 rounded-[28px] border-2 ${item.status === 'bought' ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-50 shadow-sm shadow-gray-100'}`}
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${item.status === 'bought' ? 'bg-gray-200' : 'bg-teal-50'}`}>
                                            <Ionicons name={item.status === 'bought' ? 'checkmark' : 'basket'} size={24} color={item.status === 'bought' ? '#94A3B8' : '#14B8A6'} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-lg font-black ${item.status === 'bought' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.title}</Text>
                                            <Text className="text-xs text-gray-400 font-bold">{item.quantity || '수량 미지정'} • {t.requester.replace('{name}', getRequesterName(item.requester_id))}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => deleteItem(item.id)}
                                        className="w-8 h-8 items-center justify-center"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                {item.status === 'pending' && (
                                    <TouchableOpacity
                                        onPress={() => markBought(item)}
                                        className="bg-teal-500 py-4 rounded-2xl items-center justify-center shadow-md shadow-teal-100"
                                    >
                                        <Text className="text-white font-black">구매했어요 👋</Text>
                                    </TouchableOpacity>
                                )}
                                {item.status === 'bought' && (
                                    <View className="flex-row items-center justify-center py-2">
                                        <Text className="text-gray-400 font-black text-xs">쇼핑 완료 ✨</Text>
                                    </View>
                                )}
                            </Animated.View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Add Item Modal */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center px-6">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-[40px] p-8 shadow-2xl relative">
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} className="absolute top-6 right-6 w-10 h-10 items-center justify-center bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <View className="mb-8 items-center">
                                <View className="w-16 h-16 rounded-3xl bg-teal-500 items-center justify-center mb-4 shadow-lg shadow-teal-100">
                                    <Ionicons name="cart" size={32} color="white" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">{t.add_item}</Text>
                                <Text className="text-gray-400 font-bold mt-1">Step {step} of 2</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[300px] mb-8">
                                {step === 1 ? (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.item_name_label}</Text>
                                        <TextInput
                                            value={title}
                                            onChangeText={setTitle}
                                            autoFocus
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold mb-4"
                                            placeholder={t.item_name_placeholder}
                                        />
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.quantity_label}</Text>
                                        <TextInput
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-gray-900 text-lg font-bold"
                                            placeholder={t.quantity_placeholder}
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm font-black text-gray-900 mb-3 ml-1">{t.price_label}</Text>
                                        <TextInput
                                            value={price}
                                            onChangeText={setPrice}
                                            autoFocus
                                            keyboardType="numeric"
                                            className="bg-gray-50 border-2 border-teal-100 rounded-2xl p-5 text-gray-900 text-3xl font-black"
                                            placeholder="0"
                                        />
                                        <Text className="text-[10px] text-gray-400 text-right mt-2 font-bold uppercase tracking-widest">Est. Price (KRW)</Text>
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
                                        else addItem();
                                    }}
                                    disabled={step === 1 && !title.trim()}
                                    className={`flex-[2] py-5 rounded-3xl items-center justify-center shadow-lg ${step === 1 && !title.trim() ? "bg-gray-200" : "bg-teal-500"}`}
                                >
                                    <Text className="text-white font-black">{step === 2 ? t.add_btn : "다음 단계"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
