import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../../store/userStore';

const { width } = Dimensions.get('window');

export default function TossLanding() {
    const router = useRouter();
    const { setAppMode, isLoggedIn } = useUserStore();

    const handleStart = () => {
        setAppMode('roommatecheck');
        if (isLoggedIn) {
            router.replace('/toss/(tabs)/home');
        } else {
            router.push('/toss/(auth)/login');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.emoji}>🏠</Text>
                    <Text style={styles.title}>룸메이트체크</Text>
                    <Text style={styles.subtitle}>토스에서 시작하는{"\n"}가장 쉬운 공동 생활 관리</Text>
                </View>

                <View style={styles.imageContainer}>
                    {/* Placeholder for local assets if any, or a stylized card */}
                    <View style={styles.previewCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.dot} />
                            <Text style={styles.cardTitle}>오늘의 할 일</Text>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.check} />
                            <View style={styles.line} />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.check, { borderColor: '#3182F6' }]} />
                            <View style={[styles.line, { width: '40%' }]} />
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleStart}
                    activeOpacity={0.8}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>토스로 계속하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#191F28',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4E5968',
        lineHeight: 26,
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    previewCard: {
        width: width * 0.7,
        height: 180,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F2F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3182F6',
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B95A1',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    check: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E5E8EB',
        marginRight: 10,
    },
    line: {
        height: 8,
        width: '60%',
        backgroundColor: '#E5E8EB',
        borderRadius: 4,
    },
    footer: {
        padding: 24,
        paddingBottom: 48,
    },
    button: {
        backgroundColor: '#3182F6',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    }
});
