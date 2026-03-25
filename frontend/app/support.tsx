import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Linking } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { translations } from '../constants/I18n';
import { API_URL } from '../constants/Config';
import { cn } from '../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SupportScreen() {
    const router = useRouter();
    const { language, userEmail, avatarId } = useUserStore();
    const t = translations[language].support || {
        // Fallback or defined here if not in I18n yet (I'll assume I need to add them or use hardcoded first)
        title: "지원센터",
        subtitle: "메이트체크는 여러분과 함께 만들어갑니다.",
        bug_report: { title: "오류 제보하기", desc: "불편을 드려 죄송합니다.\n오류를 알려주시면 빠르게 고칠게요!", btn: "제보하기" },
        idea: { title: "아이디어 제안하기", desc: "더 좋은 기능이 생각나셨나요?\n소중한 의견을 들려주세요.", btn: "제안하기" },
        sponsor: { title: "개발자 후원하기", desc: "커피 한 잔은 큰 힘이 됩니다!\n응원해주시는 모든 분들께 감사드려요.", btn: "후원하기" },
        form: { title_label: "제목", content_label: "내용", submit: "보내기", cancel: "취소", success: "소중한 의견 감사합니다!", error: "전송 실패" }
    };

    // Check if translations exist, otherwise use fallback (implemented above roughly, but cleaner to rely on hardcoded for this new feature until added to I18n)
    const labels = language === 'ko' ? {
        header_title: "함께 만드는 MateCheck",
        header_desc: "여러분의 참여가 메이트체크를 더 멋지게 만듭니다.",
        cards: [
            { id: 'bug', title: "오류 제보하기", desc: "앱 사용 중 버그나 오류를 발견하셨나요? \n상세한 내용을 제보해주시면 빠르게 수정하겠습니다.", icon: "bug-outline", color: "text-red-500", bg: "bg-red-50", btn: "Report Bug ->" },
            { id: 'idea', title: "아이디어 제안하기", desc: "더 재미있는 앱을 위한 아이디어가 있으신가요? \n여러분의 소중한 의견을 들려주세요.", icon: "bulb-outline", color: "text-yellow-500", bg: "bg-yellow-50", btn: "Share Idea ->" },
            { id: 'sponsor', title: "개발자 후원하기", desc: "앱 개발자에게 커피 한 잔은 큰 힘이 됩니다. \n후원해주시는 모든 분들께 감사드립니다.", icon: "cafe-outline", color: "text-pink-500", bg: "bg-pink-50", btn: "Buy Me a Coffee ->" },
        ],
        form: { title_pl: "제목을 입력해주세요", content_pl: "내용을 입력해주세요", cancel: "취소", submit: "보내기" }
    } : {
        header_title: "Build Together",
        header_desc: "Your participation makes MateCheck better.",
        cards: [
            { id: 'bug', title: "Report Bug", desc: "Found a bug? Let us know.", icon: "bug-outline", color: "text-red-500", bg: "bg-red-50", btn: "Report Bug ->" },
            { id: 'idea', title: "Share Idea", desc: "Any cool ideas? Share with us.", icon: "bulb-outline", color: "text-yellow-500", bg: "bg-yellow-50", btn: "Share Idea ->" },
            { id: 'sponsor', title: "Support Dev", desc: "Buy me a coffee!", icon: "cafe-outline", color: "text-pink-500", bg: "bg-pink-50", btn: "Buy Me a Coffee ->" },
        ],
        form: { title_pl: "Title", content_pl: "Content", cancel: "Cancel", submit: "Send" }
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'bug' | 'idea' | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCardPress = (id: string) => {
        if (id === 'sponsor') {
            Linking.openURL('https://buymeacoffee.com/bababapet');
        } else {
            setModalType(id as 'bug' | 'idea');
            setTitle('');
            setContent('');
            setModalVisible(true);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/support_tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    support_ticket: {
                        category: modalType,
                        title,
                        content,
                        email: userEmail,
                        user_id: avatarId // using avatarId as user identifier roughly
                    }
                })
            });

            if (response.ok) {
                Alert.alert("전송 완료", "소중한 의견 감사합니다!");
                setModalVisible(false);
            } else {
                Alert.alert("오류", "전송에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-8 px-6 bg-gray-900">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">지원센터</Text>
                </View>

                <View className="items-center py-4">
                    <Ionicons name="build-outline" size={48} color="#4B5563" className="mb-4" />
                    {/* The icon color in dark bg might need to be lighter. Using gray-600 for subtle 'background' icon feel or white. Let's make it subtle. */}
                    <Text className="text-2xl font-bold text-white text-center mb-2">{labels.header_title}</Text>
                    <Text className="text-gray-400 text-center">{labels.header_desc}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="gap-4">
                    {labels.cards.map((card, index) => (
                        <Animated.View
                            key={card.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                        >
                            <TouchableOpacity
                                onPress={() => handleCardPress(card.id)}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <View className={cn("w-12 h-12 rounded-full items-center justify-center mb-4", card.bg)}>
                                    <Ionicons name={card.icon as any} size={24} color={card.color.replace('text-', '').replace('-500', '') === 'black' ? 'black' : undefined} style={{ color: card.color === 'text-red-500' ? '#EF4444' : card.color === 'text-yellow-500' ? '#EAB308' : '#EC4899' }} />
                                </View>
                                <Text className={cn("text-xl font-bold mb-2", card.color)}>{card.title}</Text>
                                <Text className="text-gray-500 mb-6 leading-5">{card.desc}</Text>

                                <View className="flex-row items-center justify-end">
                                    <Text className={cn("font-bold mr-2", card.color)}>{card.btn}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {modalType === 'bug' ? labels.cards[0].title : labels.cards[1].title}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-gray-500 mb-2">{labels.form.title_pl}</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder={labels.form.title_pl}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-base mb-4"
                        />

                        <Text className="text-sm font-bold text-gray-500 mb-2">{labels.form.content_pl}</Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder={labels.form.content_pl}
                            multiline
                            numberOfLines={5}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-base mb-8 h-32"
                            style={{ textAlignVertical: 'top' }}
                        />

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center shadow-lg",
                                title.trim() && content.trim() ? "bg-gray-900" : "bg-gray-300 shadow-none"
                            )}
                        >
                            {isSubmitting ? (
                                <Text className="text-white font-bold text-lg">Thinking...</Text>
                            ) : (
                                <Text className="text-white font-bold text-lg">{labels.form.submit}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
