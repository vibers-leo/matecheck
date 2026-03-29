// authStore.ts — 토스 미니앱 인증 상태 관리
// 기존 authStore에서 이식, 토스 인증 방식에 맞게 수정

import { create } from 'zustand';
import api, { setAuthToken } from '../services/api';

// --- 인터페이스 ---

export interface AuthState {
  // 프로필
  userId: string;
  nickname: string;
  avatarId: number;
  gender: 'male' | 'female' | '';
  isLoggedIn: boolean;
  isMaster: boolean;

  // 토큰
  token: string;

  // 액션
  setProfile: (nickname: string, avatarId: number, id?: string) => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsMaster: (value: boolean) => void;

  // 토스 로그인
  loginWithToss: (tossUserId: string, tossNickname: string) => Promise<boolean>;

  // 로그아웃
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    // 초기 상태
    userId: '',
    nickname: '',
    avatarId: 0,
    gender: '' as 'male' | 'female' | '',
    isLoggedIn: false,
    isMaster: false,
    token: '',

    // 액션
    setProfile: (nickname, avatarId, id = '') =>
      set({
        nickname,
        avatarId,
        userId: id || get().userId,
      }),

    setIsLoggedIn: (value) => set({ isLoggedIn: value }),
    setIsMaster: (value) => set({ isMaster: value }),

    // 토스 로그인 — 토스 프로필 정보로 서버 인증
    loginWithToss: async (tossUserId: string, tossNickname: string) => {
      try {
        const data = await api.post('/login', {
          toss_user_id: tossUserId,
          nickname: tossNickname,
          provider: 'toss',
        });

        if (data.token) {
          setAuthToken(data.token);
          set({
            userId: String(data.user?.id || tossUserId),
            nickname: data.user?.nickname || tossNickname,
            avatarId: data.user?.avatar_id || 0,
            token: data.token,
            isLoggedIn: true,
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error('토스 로그인 실패:', error);
        return false;
      }
    },

    // 로그아웃
    logout: () => {
      setAuthToken(null);
      set({
        userId: '',
        nickname: '',
        avatarId: 0,
        isLoggedIn: false,
        isMaster: false,
        token: '',
      });
    },
  })
);
