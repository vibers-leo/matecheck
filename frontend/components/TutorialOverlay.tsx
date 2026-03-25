import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { translations } from '../constants/I18n';

const { width, height } = Dimensions.get('window');

export interface TutorialStep {
    target: {
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius?: number;
    };
    title: string;
    description: string;
    position: 'top' | 'bottom';
}

interface TutorialOverlayProps {
    steps: TutorialStep[];
    visible: boolean;
    onComplete: () => void;
}

export default function TutorialOverlay({ steps, visible, onComplete }: TutorialOverlayProps) {
    const { language } = useUserStore();
    const t = (translations[language as keyof typeof translations] as any).tutorial;
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (visible) {
            setCurrentStepIndex(0);
        }
    }, [visible]);

    if (!visible) return null;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;

    const { target, title, description, position } = currentStep;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    // Calculate overlay rectangles
    // Top
    const topStyle = {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: target.y,
        backgroundColor: 'rgba(0,0,0,0.7)',
    };
    // Bottom
    const bottomStyle = {
        position: 'absolute' as const,
        top: target.y + target.height,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
    };
    // Left
    const leftStyle = {
        position: 'absolute' as const,
        top: target.y,
        left: 0,
        width: target.x,
        height: target.height,
        backgroundColor: 'rgba(0,0,0,0.7)',
    };
    // Right
    const rightStyle = {
        position: 'absolute' as const,
        top: target.y,
        left: target.x + target.width,
        right: 0,
        height: target.height,
        backgroundColor: 'rgba(0,0,0,0.7)',
    };

    // Tooltip Position
    const tooltipTop = position === 'bottom'
        ? target.y + target.height + 20
        : target.y - 150; // Approximated for simple text height

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 z-[9999] w-full h-full">
            {/* Mask Parts */}
            <View style={topStyle} />
            <View style={bottomStyle} />
            <View style={leftStyle} />
            <View style={rightStyle} />

            {/* Spotlight Border (Optional) */}
            <View
                style={{
                    position: 'absolute',
                    top: target.y - 4,
                    left: target.x - 4,
                    width: target.width + 8,
                    height: target.height + 8,
                    borderRadius: target.borderRadius || 12,
                    borderWidth: 2,
                    borderColor: 'white',
                    borderStyle: 'dashed'
                }}
            />

            {/* Tooltip */}
            <View
                className="absolute left-6 right-6 bg-white p-6 rounded-2xl shadow-xl"
                style={{ top: tooltipTop }}
            >
                <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-gray-900 font-primary">{title}</Text>
                    <Text className="text-sm font-bold text-orange-500">{currentStepIndex + 1} / {steps.length}</Text>
                </View>
                <Text className="text-gray-600 mb-6 leading-6">{description}</Text>

                <View className="flex-row justify-end gap-3">
                    <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
                        <Text className="text-gray-400 font-bold">{t.skip}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleNext}
                        className="bg-orange-500 px-6 py-2 rounded-xl active:bg-orange-600"
                    >
                        <Text className="text-white font-bold">{currentStepIndex === steps.length - 1 ? t.finish : t.next}</Text>
                    </TouchableOpacity>
                </View>

                {/* Arrow (Simple) */}
                <View
                    style={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: -10,
                        ...(position === 'bottom'
                            ? { top: -10, borderBottomWidth: 10, borderBottomColor: 'white', borderLeftWidth: 10, borderLeftColor: 'transparent', borderRightWidth: 10, borderRightColor: 'transparent' }
                            : { bottom: -10, borderTopWidth: 10, borderTopColor: 'white', borderLeftWidth: 10, borderLeftColor: 'transparent', borderRightWidth: 10, borderRightColor: 'transparent' }
                        )
                    }}
                />
            </View>
        </Animated.View>
    );
}
