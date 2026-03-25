import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DevGateway() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 40 }}>🛠️</Text>
                </View>
                <Text style={styles.title}>개발자 게이트웨이</Text>
                <Text style={styles.subtitle}>확인할 버전을 선택해 주세요</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => router.push('/toss')}
                    activeOpacity={0.8}
                    style={styles.card}
                >
                    <View style={[styles.cardIconBox, { backgroundColor: '#EBF4FF' }]}>
                        <Ionicons name="apps-sharp" size={32} color="#0064FF" />
                    </View>
                    <View style={styles.cardTextBox}>
                        <Text style={[styles.cardTitle, { color: '#0064FF' }]}>App In Toss</Text>
                        <Text style={styles.cardSubtitle}>룸메이트체크 (토스 미니앱)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/mate')}
                    activeOpacity={0.8}
                    style={styles.card}
                >
                    <View style={[styles.cardIconBox, { backgroundColor: '#FFF4ED' }]}>
                        <Ionicons name="home-sharp" size={32} color="#FF7F50" />
                    </View>
                    <View style={styles.cardTextBox}>
                        <Text style={[styles.cardTitle, { color: '#FF7F50' }]}>MateCheck</Text>
                        <Text style={styles.cardSubtitle}>오리지널 버전</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerLabel}>Environment</Text>
                <Text style={styles.footerValue}>LOCAL DEVELOPMENT</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 },
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
        })
    },
    title: {
        color: '#191F28',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
    },
    subtitle: {
        color: '#6B7684',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 400,
        gap: 16,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F4F6',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
        })
    },
    cardIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    cardTextBox: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 2,
    },
    cardSubtitle: {
        color: '#8B95A1',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 48,
        alignItems: 'center',
    },
    footerLabel: {
        color: '#ADB5BD',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 1,
    },
    footerValue: {
        color: '#8B95A1',
        fontSize: 14,
        fontWeight: '900',
    }
});
