// nestStore.ts — 보금자리(Nest) 관련 상태 및 액션
// userStore.ts에서 분리된 도메인 store
// 새 코드에서는 이 store를 직접 사용하세요

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccessToast } from '../utils/toast';
import api from '../services/api';

// --- Interfaces ---

export interface User {
    id: string;
    nickname: string;
    avatarId: number;
    memberType?: 'human' | 'baby' | 'pet' | 'plant' | 'ai';
    role?: 'master' | 'mate';
    region?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    occupation?: string;
}

export interface NestState {
    // 보금자리 정보
    nestId: string;
    nestName: string;
    nestTheme: number;
    nestAvatarId: number;
    nestImage: string;
    inviteCode: string;
    nestType: 'dormitory' | 'couple' | 'family' | null;

    // 멤버
    members: User[];
    pendingRequests: User[];

    // 로딩
    isLoading: boolean;

    // 액션
    setNest: (nestName: string, nestTheme: number, inviteCode?: string, nestId?: string, nestImage?: string, nestAvatarId?: number) => void;
    setNestType: (type: 'dormitory' | 'couple' | 'family') => void;
    setMembers: (members: User[], currentUserId: string) => { isMaster: boolean };
    addMember: (nickname: string, avatarId: number) => void;
    addManagedMember: (nickname: string, avatarId: number, memberType: string) => Promise<void>;
    fetchJoinRequests: () => Promise<void>;
    approveJoinRequest: (userId: string) => Promise<void>;
    syncMembers: (currentUserId?: string) => Promise<void>;
    resetNest: () => void;
}

export const useNestStore = create<NestState>()(
    persist(
        (set, get) => ({
            // 초기 상태
            nestId: '',
            nestName: '',
            nestTheme: 0,
            nestAvatarId: 100,
            nestImage: '',
            inviteCode: '',
            nestType: null as 'dormitory' | 'couple' | 'family' | null,
            members: [] as User[],
            pendingRequests: [] as User[],
            isLoading: false,

            // 액션
            setNest: (nestName, nestTheme, inviteCode = '', nestId = '', nestImage = '', nestAvatarId = 100) =>
                set({ nestName, nestTheme, inviteCode, nestId, nestImage, nestAvatarId }),

            setNestType: (type) => set({ nestType: type }),

            setMembers: (members, currentUserId) => {
                const currentMember = members.find((m) => m.id === currentUserId);
                const isOnlyMember = members.length === 1 && !!currentMember;
                const isMaster = !!isOnlyMember || currentMember?.role === 'master';
                set({ members });
                return { isMaster };
            },

            addMember: (nickname, avatarId) => set((state) => ({
                members: [...state.members, { id: Math.random().toString(36).substr(2, 9), nickname, avatarId }]
            })),

            addManagedMember: async (nickname, avatarId, memberType) => {
                const { nestId } = get();
                if (!nestId) return;
                try {
                    const data = await api.post(`/nests/${nestId}/members`, {
                        nickname,
                        avatar_id: avatarId,
                        member_type: memberType
                    });
                    set({
                        members: data.members.map((m: any) => ({
                            id: String(m.id),
                            nickname: m.nickname,
                            avatarId: m.avatar_id,
                            memberType: m.member_type
                        }))
                    });
                    showSuccessToast('멤버가 추가되었습니다!');
                } catch (error) {
                    console.error('멤버 추가 실패:', error);
                }
            },

            fetchJoinRequests: async () => {
                const { nestId } = get();
                if (!nestId) return;
                try {
                    const data = await api.get(`/nests/${nestId}/requests`);
                    set({
                        pendingRequests: data.map((u: any) => ({
                            id: String(u.id),
                            nickname: u.nickname,
                            avatarId: u.avatar_id
                        }))
                    });
                } catch (error) {
                    console.error('가입 요청 조회 실패:', error);
                }
            },

            approveJoinRequest: async (userId) => {
                const { nestId } = get();
                if (!nestId) return;
                try {
                    const data = await api.patch(`/nests/${nestId}/approve/${userId}`);
                    set((state) => ({
                        pendingRequests: state.pendingRequests.filter(u => u.id !== userId),
                        members: data.members.map((m: any) => ({
                            id: String(m.id),
                            nickname: m.nickname,
                            avatarId: m.avatar_id
                        }))
                    }));
                    showSuccessToast('멤버 승인이 완료되었습니다!');
                } catch (error) {
                    console.error('멤버 승인 실패:', error);
                }
            },

            syncMembers: async (currentUserId) => {
                const { nestId } = get();
                if (!nestId) return;

                set({ isLoading: true });
                try {
                    const data = await api.get(`/nests/${nestId}`);
                    if (data.members) {
                        const mapped = data.members.map((m: any) => ({
                            id: String(m.id),
                            nickname: m.nickname,
                            avatarId: m.avatar_id,
                            role: m.role || 'mate',
                            memberType: m.member_type
                        }));
                        set({ members: mapped });
                    }
                } catch (error) {
                    console.error('멤버 동기화 실패:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            resetNest: () => set({
                nestId: '',
                nestName: '',
                nestTheme: 0,
                nestAvatarId: 100,
                nestImage: '',
                inviteCode: '',
                nestType: null,
                members: [],
                pendingRequests: [],
            }),
        }),
        {
            name: 'matecheck-nest-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                nestId: state.nestId,
                nestName: state.nestName,
                nestTheme: state.nestTheme,
                nestAvatarId: state.nestAvatarId,
            }),
        }
    )
);
