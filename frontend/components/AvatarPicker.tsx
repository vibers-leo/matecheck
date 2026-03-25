import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { AVATARS } from '../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import { Image } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface AvatarPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (avatarId: number) => void;
    selectedId: number;
    avatars?: any[];
}

export default function AvatarPicker({ visible, onClose, onSelect, selectedId, avatars = AVATARS }: AvatarPickerProps) {
    if (!visible) return null;

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-center items-center px-4">
                    <TouchableWithoutFeedback>
                        <Animated.View
                            entering={FadeInDown.springify()}
                            className="bg-white w-full max-h-[80%] rounded-3xl p-6 shadow-2xl"
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-gray-900">캐릭터 선택</Text>
                                <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                                    <Ionicons name="close" size={20} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View className="flex-row flex-wrap gap-4 justify-between">
                                    {avatars.map((avatar) => (
                                        <TouchableOpacity
                                            key={avatar.id}
                                            onPress={() => {
                                                onSelect(avatar.id);
                                                onClose();
                                            }}
                                            className="w-[47%] bg-gray-50 rounded-2xl p-4 items-center border border-gray-100 relative"
                                        >
                                            <Image
                                                source={
                                                    typeof avatar.image === 'number'
                                                        ? avatar.image
                                                        : { uri: avatar.image.uri }
                                                }
                                                style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', marginBottom: 12 }}
                                                resizeMode="contain"
                                            />
                                            <Text className="text-2xl absolute top-2 right-2">{avatar.emoji}</Text>

                                            <Text className="font-bold text-gray-800 mb-1">{avatar.label}</Text>

                                            {selectedId === avatar.id && (
                                                <View className="absolute inset-0 bg-orange-500/10 rounded-2xl border-2 border-orange-500 items-center justify-center">
                                                    <View className="absolute top-2 left-2 bg-orange-500 rounded-full p-1">
                                                        <Ionicons name="checkmark" size={12} color="white" />
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
