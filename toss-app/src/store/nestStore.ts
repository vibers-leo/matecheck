// nestStore.ts — 보금자리(Nest) 상태 관리
// 기존 nestStore에서 이식

import { create } from 'zustand';
import api from '../services/api';

// --- 인터페이스 ---

export interface User {
  id: string;
  nickname: string;
  avatarId: number;
  memberType?: 'human' | 'baby' | 'pet' | 'plant' | 'ai';
  role?: 'master' | 'mate';
}

export interface NestState {
  // 보금자리 정보
  nestId: string;
  nestName: string;
  nestTheme: number;
  nestAvatarId: number;
  inviteCode: string;
  nestType: 'dormitory' | 'couple' | 'family' | null;

  // 멤버
  members: User[];

  // 로딩
  isLoading: boolean;

  // 액션
  setNest: (nestName: string, nestTheme: number, inviteCode?: string, nestId?: string) => void;
  setNestType: (type: 'dormitory' | 'couple' | 'family') => void;
  setMembers: (members: User[], currentUserId: string) => { isMaster: boolean };
  syncMembers: (currentUserId?: string) => Promise<void>;
  fetchNest: (nestId: string) => Promise<void>;
  resetNest: () => void;
}

export const useNestStore = create<NestState>()(
  (set, get) => ({
    // 초기 상태
    nestId: '',
    nestName: '',
    nestTheme: 0,
    nestAvatarId: 100,
    inviteCode: '',
    nestType: null,
    members: [],
    isLoading: false,

    // 액션
    setNest: (nestName, nestTheme, inviteCode = '', nestId = '') =>
      set({ nestName, nestTheme, inviteCode, nestId }),

    setNestType: (type) => set({ nestType: type }),

    setMembers: (members, currentUserId) => {
      const currentMember = members.find((m) => m.id === currentUserId);
      const isOnlyMember = members.length === 1 && !!currentMember;
      const isMaster = isOnlyMember || currentMember?.role === 'master';
      set({ members });
      return { isMaster: !!isMaster };
    },

    // 보금자리 정보 가져오기
    fetchNest: async (nestId: string) => {
      set({ isLoading: true });
      try {
        const data = await api.get(`/nests/${nestId}`);
        set({
          nestId: String(data.id),
          nestName: data.name,
          nestTheme: data.theme || 0,
          inviteCode: data.invite_code || '',
          nestType: data.nest_type || null,
        });

        if (data.members) {
          const mapped = data.members.map((m: any) => ({
            id: String(m.id),
            nickname: m.nickname,
            avatarId: m.avatar_id,
            role: m.role || 'mate',
            memberType: m.member_type,
          }));
          set({ members: mapped });
        }
      } catch (error) {
        console.error('보금자리 조회 실패:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    // 멤버 동기화
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
            memberType: m.member_type,
          }));
          set({ members: mapped });
        }
      } catch (error) {
        console.error('멤버 동기화 실패:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    // 보금자리 초기화
    resetNest: () =>
      set({
        nestId: '',
        nestName: '',
        nestTheme: 0,
        nestAvatarId: 100,
        inviteCode: '',
        nestType: null,
        members: [],
      }),
  })
);
