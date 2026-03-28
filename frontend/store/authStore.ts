// authStore.ts — 인증/프로필 관련 상태 및 액션
// userStore.ts에서 분리된 도메인 store
// 새 코드에서는 이 store를 직접 사용하세요

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import api from '../services/api';

// --- Interfaces ---

export interface AuthState {
    // 프로필
    userId: string;
    userEmail: string;
    nickname: string;
    avatarId: number;
    gender: 'male' | 'female' | '';
    birthDate: string;
    occupation: string;
    region: string;
    isLoggedIn: boolean;
    isMaster: boolean;

    // 로컬 설정
    language: 'ko' | 'en';
    appMode: 'matecheck' | 'roommatecheck';
    hasSeenTutorial: boolean;
    hasSeenMasterTutorial: boolean;

    // 액션
    setProfile: (nickname: string, avatarId: number, id?: string) => void;
    setDetailedProfile: (region: string, birthDate: string, gender: 'male' | 'female' | '', occupation: string) => void;
    setEmail: (email: string) => void;
    setLanguage: (lang: 'ko' | 'en') => void;
    setAppMode: (mode: 'matecheck' | 'roommatecheck') => void;
    setIsLoggedIn: (value: boolean) => void;
    setIsMaster: (value: boolean) => void;
    completeTutorial: () => void;
    completeMasterTutorial: () => void;

    // 계정 액션
    updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;

    // 로그아웃
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // 초기 상태
            userId: '',
            userEmail: '',
            nickname: '',
            avatarId: 0,
            gender: '' as 'male' | 'female' | '',
            birthDate: '',
            occupation: '',
            region: '',
            isLoggedIn: false,
            isMaster: false,
            language: 'ko' as 'ko' | 'en',
            appMode: 'matecheck' as 'matecheck' | 'roommatecheck',
            hasSeenTutorial: false,
            hasSeenMasterTutorial: false,

            // 액션
            setProfile: (nickname, avatarId, id = '') => set({
                nickname,
                avatarId,
                userId: id || get().userId
            }),

            setDetailedProfile: (region, birthDate, gender, occupation) => set({
                region, birthDate, gender, occupation
            }),

            setEmail: (userEmail) => set({ userEmail }),
            setLanguage: (lang) => set({ language: lang }),
            setAppMode: (mode) => set({ appMode: mode }),
            setIsLoggedIn: (value) => set({ isLoggedIn: value }),
            setIsMaster: (value) => set({ isMaster: value }),
            completeTutorial: () => set({ hasSeenTutorial: true }),
            completeMasterTutorial: () => set({ hasSeenMasterTutorial: true }),

            updatePassword: async (currentPassword, newPassword, confirmPassword) => {
                const { userEmail } = get();
                try {
                    await api.put(`/users/password`, {
                        email: userEmail,
                        current_password: currentPassword,
                        new_password: newPassword,
                        new_password_confirmation: confirmPassword
                    });
                    showSuccessToast('비밀번호가 변경되었습니다.');
                    return { success: true };
                } catch (error: any) {
                    console.error('비밀번호 변경 실패:', error);
                    const errorMessage = error.response?.data?.errors?.join(", ") || error.response?.data?.error || "비밀번호 변경에 실패했습니다.";
                    return { success: false, error: errorMessage };
                }
            },

            deleteAccount: async (password) => {
                const { userEmail, logout } = get();
                try {
                    const response = await fetch(`${API_URL}/users`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail, password })
                    });

                    if (response.ok) {
                        logout();
                        showSuccessToast('계정이 삭제되었습니다.');
                        return { success: true };
                    }

                    const data = await response.json();
                    return { success: false, error: data.error || "계정 삭제에 실패했습니다." };
                } catch (error: any) {
                    console.error('계정 삭제 실패:', error);
                    return { success: false, error: "네트워크 오류가 발생했습니다." };
                }
            },

            logout: () => set({
                nickname: '',
                avatarId: 0,
                userEmail: '',
                isLoggedIn: false,
                hasSeenTutorial: false,
                language: 'ko',
            }),
        }),
        {
            name: 'matecheck-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                userId: state.userId,
                userEmail: state.userEmail,
                nickname: state.nickname,
                avatarId: state.avatarId,
                isLoggedIn: state.isLoggedIn,
                isMaster: state.isMaster,
                hasSeenTutorial: state.hasSeenTutorial,
                hasSeenMasterTutorial: state.hasSeenMasterTutorial,
                language: state.language,
                appMode: state.appMode,
            }),
        }
    )
);
