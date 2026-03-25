import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, BackHandler, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TDS_COLORS } from '../constants/DesignTokens';

interface ExitModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitModal({ visible, onClose, onConfirm }: ExitModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>룸메이트체크를 종료할까요?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>종료하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

interface TossNavBarProps {
    title?: string;
    canGoBack?: boolean;
}

export default function TossNavBar({ title, canGoBack }: TossNavBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    const handleExit = () => {
        setModalVisible(true);
    };

    const confirmExit = () => {
        setModalVisible(false);
        BackHandler.exitApp();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.toolbar}>
                <View style={styles.leftContainer}>
                    {canGoBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="chevron-back" size={24} color={TDS_COLORS.grey900} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>{title || 'RoommateCheck'}</Text>
                </View>

                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={TDS_COLORS.grey400} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
                        <Ionicons name="close" size={26} color={TDS_COLORS.grey900} />
                    </TouchableOpacity>
                </View>
            </View>

            <ExitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={confirmExit}
            />
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        backgroundColor: TDS_COLORS.white,
        zIndex: 100,
    },
    toolbar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: TDS_COLORS.grey900,
        letterSpacing: -0.5,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 80,
        gap: 8,
    },
    iconButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.8,
        maxWidth: 320,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }
        })
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TDS_COLORS.grey900,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 26,
        letterSpacing: -0.4,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: TDS_COLORS.grey100,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: TDS_COLORS.grey700,
        fontSize: 16,
        fontWeight: '700',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: TDS_COLORS.blue,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});


