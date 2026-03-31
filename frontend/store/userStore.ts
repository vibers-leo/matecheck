// ===========================================================================
// 마이그레이션 진행 중 — 새 코드에서는 개별 도메인 store 사용 권장:
//
// import { useAuthStore } from './authStore';     // 인증, 프로필, 언어, 앱모드
// import { useNestStore } from './nestStore';      // 보금자리, 멤버, 가입요청
// import { useTodoStore } from './todoStore';      // 미션/투두
// import { useBudgetStore } from './budgetStore';  // 가계부, 거래내역, 고정지출
//
// 이 파일(useUserStore)은 기존 40+ 파일의 하위 호환을 위해 유지됩니다.
// 새 기능 개발 시에는 위 개별 store를 직접 import하세요.
// ===========================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { AVATARS } from '../constants/data';
import { showSuccessToast, showErrorToast, showApiError, showValidationError } from '../utils/toast';
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

export interface Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    assignees: User[]; // Full user objects
    completedBy?: string; // memberId
    createdAt: string;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    imageUrl?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: 'event' | 'vote';
    votes: { [date: string]: string[] }; // date -> array of userIds who voted
    creatorId: string;
    imageUrl?: string;
    endDate?: string; // Optional end date for events
    time?: string; // Optional time (e.g. "19:00")
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly'; // Recurring pattern
}

export interface BudgetTransaction {
    id: string;
    title: string;
    amount: number;
    category: 'food' | 'housing' | 'living' | 'transport' | 'etc';
    date: string;
    payerId: string; // memberId
}

export interface FixedExpense {
    id: string;
    title: string;
    amount: number;
    day: number; // Day of month (1-31)
}
export interface Goal {
    id: string;
    type: 'vision' | 'year' | 'month' | 'week';
    title: string;
    current: number;
    target: number;
    unit: string;
}

export interface HouseRule {
    id: number;
    title: string;
    description: string;
    rule_type: string;
    priority: number;
    created_at?: string;
}

export interface Anniversary {
    id: number;
    title: string;
    anniversary_date: string;
    is_recurring: boolean;
    category: string;
    created_at?: string;
}

interface UserState {
    // Profile
    nickname: string;
    avatarId: number;
    userId: string;
    userEmail: string;
    isMaster: boolean;
    region: string;
    birthDate: string;
    gender: 'male' | 'female' | '';
    occupation: string;

    // Nest
    nestName: string;
    nestTheme: number;
    nestAvatarId: number;
    nestImage: string;
    nestId: string;
    inviteCode: string;
    isLoggedIn: boolean;
    hasSeenTutorial: boolean;
    hasSeenMasterTutorial: boolean;

    // Features - Todo
    todos: Todo[];

    // Features - Calendar
    events: CalendarEvent[];

    // Features - Budget
    budgetGoal: number;
    transactions: BudgetTransaction[];
    fixedExpenses: FixedExpense[];

    // Features - Goals
    goals: Goal[];

    // Features - House Rules
    rules: HouseRule[];

    // Features - Anniversaries
    anniversaries: Anniversary[];

    // Features - Members
    members: User[];

    // Localization
    language: 'ko' | 'en';

    // Application Mode
    appMode: 'matecheck' | 'roommatecheck';

    // Nest Type (보금자리 유형)
    nestType: 'dormitory' | 'couple' | 'family' | null;

    // Loading States
    isLoading: {
        todos: boolean;
        events: boolean;
        transactions: boolean;
        goals: boolean;
        rules: boolean;
        members: boolean;
        anniversaries: boolean;
    };

    // Actions
    setLoading: (key: keyof UserState['isLoading'], value: boolean) => void;
    setProfile: (nickname: string, avatarId: number, id?: string) => void;
    setDetailedProfile: (region: string, birthDate: string, gender: 'male' | 'female' | '', occupation: string) => void;
    setEmail: (email: string) => void;
    setNest: (nestName: string, nestTheme: number, inviteCode?: string, nestId?: string, nestImage?: string, nestAvatarId?: number, isMaster?: boolean) => void;
    setMembers: (members: User[]) => void;
    logout: () => void;
    completeTutorial: () => void;
    completeMasterTutorial: () => void;
    addMember: (nickname: string, avatarId: number) => void;
    addManagedMember: (nickname: string, avatarId: number, memberType: string) => Promise<void>;

    // Join Requests
    pendingRequests: User[];
    fetchJoinRequests: () => Promise<void>;
    approveJoinRequest: (userId: string) => Promise<void>;
    setLanguage: (lang: 'ko' | 'en') => void;
    setAppMode: (mode: 'matecheck' | 'roommatecheck') => void;
    setNestType: (type: 'dormitory' | 'couple' | 'family') => void;

    // Todo Actions
    addTodo: (title: string, assigneeIds?: string[], repeat?: 'none' | 'daily' | 'weekly' | 'monthly', imageUrl?: string) => Promise<void>;
    toggleTodo: (id: string, memberId: string) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;

    // Account Actions
    updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean, error?: string }>;
    deleteAccount: (password: string) => Promise<{ success: boolean, error?: string }>;

    // Calendar Actions
    addEvent: (title: string, date: string, imageUrl?: string, endDate?: string, time?: string, budgetInfo?: { amount: number, category: BudgetTransaction['category'] }, repeat?: 'none' | 'daily' | 'weekly' | 'monthly') => Promise<void>;
    voteEvent: (eventId: string, date: string, userId: string) => void;
    deleteEvent: (id: string) => Promise<void>;

    // Budget Actions
    addTransaction: (title: string, amount: number, category: BudgetTransaction['category'], date?: string) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    setBudgetGoal: (amount: number) => void;
    addFixedExpense: (title: string, amount: number, day: number) => void;
    deleteFixedExpense: (id: string) => void;

    // Goal Actions
    addGoal: (type: Goal['type'], title: string, target: number, unit: string) => Promise<void>;
    incrementGoalProgress: (id: string) => Promise<void>;
    decrementGoalProgress: (id: string) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;

    // House Rule Actions
    addRule: (title: string, description: string, rule_type: string) => Promise<void>;
    deleteRule: (id: number) => Promise<void>;

    // Anniversary Actions
    addAnniversary: (title: string, date: string, isRecurring: boolean, category: string) => Promise<void>;
    deleteAnniversary: (id: number) => Promise<void>;

    // Sync Actions
    syncMissions: () => Promise<void>;
    syncEvents: () => Promise<void>;
    syncGoals: () => Promise<void>;
    syncTransactions: () => Promise<void>;
    syncRules: () => Promise<void>;
    syncAnniversaries: () => Promise<void>;
    syncMembers: () => Promise<void>;
    syncAll: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // Initial State
            nickname: '',
            avatarId: 0,
            userId: '',
            userEmail: '',
            isMaster: false,
            region: '',
            birthDate: '',
            gender: '' as 'male' | 'female' | '',
            occupation: '',
            nestName: '',
            nestTheme: 0,
            nestAvatarId: 100, // Default to House line art
            nestImage: '',
            nestId: '',
            inviteCode: '',
            isLoggedIn: false,
            hasSeenTutorial: false,
            hasSeenMasterTutorial: false,

            members: [] as User[],
            todos: [] as Todo[],
            events: [] as CalendarEvent[],
            budgetGoal: 1000000,
            transactions: [] as BudgetTransaction[],
            fixedExpenses: [
                { id: '1', title: '🏠 관리비', amount: 150000, day: 1 }
            ] as FixedExpense[],
            goals: [] as Goal[],
            rules: [] as HouseRule[],
            anniversaries: [] as Anniversary[],

            pendingRequests: [] as User[],
            language: 'ko' as 'ko' | 'en',
            appMode: 'matecheck' as 'matecheck' | 'roommatecheck',
            nestType: null as 'dormitory' | 'couple' | 'family' | null,

            isLoading: {
                todos: false,
                events: false,
                transactions: false,
                goals: false,
                rules: false,
                members: false,
                anniversaries: false,
            },

            // Actions
            setLoading: (key, value) => set((state) => ({
                isLoading: { ...state.isLoading, [key]: value }
            })),
            setProfile: (nickname, avatarId, id = '') => set({ nickname, avatarId, userId: id || useUserStore.getState().userId }),
            setDetailedProfile: (region: string, birthDate: string, gender: 'male' | 'female' | '', occupation: string) => set({ region, birthDate, gender, occupation }),
            setEmail: (userEmail) => set({ userEmail }),
            setNest: (nestName, nestTheme, inviteCode = '', nestId = '', nestImage = '', nestAvatarId = 100, isMaster = false) =>
                set({ nestName, nestTheme, inviteCode, nestId, nestImage, nestAvatarId, isLoggedIn: true, isMaster }),
            setMembers: (members: User[]) => {
                const { userId } = useUserStore.getState();
                const currentMember = members.find((m: User) => m.id === userId);
                // If there's only 1 member, they should be the leader (manager)
                const isOnlyMember = members.length === 1 && !!currentMember;
                set({
                    members,
                    isMaster: !!isOnlyMember || currentMember?.role === 'master'
                });
            },
            completeTutorial: () => set({ hasSeenTutorial: true }),
            completeMasterTutorial: () => set({ hasSeenMasterTutorial: true }),

            fetchJoinRequests: async () => {
                const { nestId } = useUserStore.getState();
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
                const { nestId } = useUserStore.getState();
                if (!nestId) return;
                try {
                    const data = await api.patch(`/nests/${nestId}/approve/${userId}`);
                    set((state: UserState) => ({
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

            setLanguage: (lang) => set({ language: lang }),
            setAppMode: (mode) => set({ appMode: mode }),
            setNestType: (type: 'dormitory' | 'couple' | 'family') => set({ nestType: type }),

            logout: () => {
                // SecureStore에서 JWT 토큰 삭제
                import('../services/api').then(({ clearToken }) => clearToken());
                set({
                    nickname: '', avatarId: 0, userEmail: '', nestName: '', nestTheme: 0, nestId: '', inviteCode: '', isLoggedIn: false,
                    todos: [],
                    events: [],
                    transactions: [],
                    fixedExpenses: [],
                    goals: [],
                    pendingRequests: [],
                    members: [],
                    rules: [],
                    anniversaries: [],
                    nestType: null,
                    language: 'ko',
                    hasSeenTutorial: false
                });
            },
            addMember: (nickname, avatarId) => set((state: UserState) => ({
                members: [...state.members, { id: Math.random().toString(36).substr(2, 9), nickname, avatarId }]
            })),

            updatePassword: async (currentPassword, newPassword, confirmPassword): Promise<{ success: boolean; error?: string }> => {
                const { userEmail } = useUserStore.getState();
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

            deleteAccount: async (password: string): Promise<{ success: boolean; error?: string }> => {
                const { userEmail } = useUserStore.getState();
                try {
                    // DELETE with body - use fetch directly since api.delete doesn't support body
                    const response = await fetch(`${API_URL}/users`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail, password })
                    });

                    if (response.ok) {
                        useUserStore.getState().logout();
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

            addManagedMember: async (nickname, avatarId, memberType) => {
                const { nestId } = useUserStore.getState();
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

            // Type-safe Todo Actions
            addTodo: async (title: string, assigneeIds: string[] = ['0'], repeat: 'none' | 'daily' | 'weekly' | 'monthly' = 'none', imageUrl?: string) => {
                // 유효성 검사
                if (!title.trim()) {
                    showValidationError('할 일 제목을 입력해주세요.');
                    return;
                }

                const { nestId, members } = useUserStore.getState();
                if (nestId) {
                    try {
                        // ✅ 새로운 API 클라이언트 사용 (리팩토링 완료)
                        const data = await api.post(`/nests/${nestId}/missions`, {
                            mission: {
                                title,
                                assigned_to: null,
                                assignee_ids: assigneeIds,
                                repeat,
                                image_url: imageUrl,
                                is_completed: false
                            }
                        });

                        set((state: UserState) => ({
                            todos: [
                                {
                                    id: String(data.id),
                                    title: data.title,
                                    isCompleted: data.is_completed,
                                    assignees: data.assignees ? data.assignees.map((a: any) => ({
                                        id: String(a.id), nickname: a.nickname, avatarId: a.avatar_id, memberType: a.member_type
                                    })) : [],
                                    createdAt: data.created_at,
                                    repeat: data.repeat,
                                    imageUrl: data.image_url
                                },
                                ...state.todos
                            ]
                        }));
                        showSuccessToast('할 일이 추가되었습니다!');
                    } catch (error) {
                        // API 클라이언트가 자동으로 에러 Toast 표시
                        console.error('할 일 추가 실패:', error);
                    }
                } else {
                    // Fallback to local
                    const selectedMembers = members.filter((m: any) => assigneeIds.includes(m.id));
                    set((state: UserState) => ({
                        todos: [
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                title,
                                isCompleted: false,
                                assignees: selectedMembers,
                                createdAt: new Date().toISOString(),
                                repeat,
                                imageUrl
                            },
                            ...state.todos
                        ]
                    }));
                    showSuccessToast('할 일이 추가되었습니다!');
                }
            },

            toggleTodo: async (id, memberId) => {
                const { nestId, todos } = useUserStore.getState();
                const todo = todos.find(t => t.id === id);
                if (!todo) return;

                const nextStatus = !todo.isCompleted;

                if (nestId) {
                    try {
                        await api.patch(`/nests/${nestId}/missions/${id}`, {
                            mission: { is_completed: nextStatus }
                        });
                        // ✅ api.ts가 자동으로 에러 Toast 표시 + 재시도
                        set((state: UserState) => ({
                            todos: state.todos.map((t: any) =>
                                t.id === id
                                    ? { ...t, isCompleted: nextStatus, completedBy: memberId }
                                    : t
                            ).sort((a: any, b: any) => Number(a.isCompleted) - Number(b.isCompleted))
                        }));
                        showSuccessToast(nextStatus ? '할 일을 완료했습니다!' : '할 일을 다시 활성화했습니다.');
                    } catch (error) {
                        console.error('할 일 토글 실패:', error);
                        // api.ts에서 이미 showApiError() 호출했으므로 추가 Toast 불필요
                    }
                } else {
                    set((state: UserState) => ({
                        todos: state.todos.map((t) =>
                            t.id === id
                                ? { ...t, isCompleted: nextStatus, completedBy: nextStatus ? memberId : undefined }
                                : t
                        ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                    }));
                    showSuccessToast(nextStatus ? '할 일을 완료했습니다!' : '할 일을 다시 활성화했습니다.');
                }
            },

            deleteTodo: async (id) => {
                const { nestId } = useUserStore.getState();
                if (nestId) {
                    try {
                        await api.delete(`/nests/${nestId}/missions/${id}`);
                        // ✅ api.ts가 자동으로 에러 Toast 표시 + 재시도
                        set((state: UserState) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
                        showSuccessToast('할 일이 삭제되었습니다.');
                    } catch (error) {
                        console.error('할 일 삭제 실패:', error);
                        // api.ts에서 이미 showApiError() 호출했으므로 추가 Toast 불필요
                    }
                } else {
                    set((state: UserState) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
                    showSuccessToast('할 일이 삭제되었습니다.');
                }
            },

            // Calendar Actions
            addEvent: async (title: string, date: string, imageUrl?: string, endDate?: string, time?: string, budgetInfo?: { amount: number, category: BudgetTransaction['category'] }, repeat: 'none' | 'daily' | 'weekly' | 'monthly' = 'none') => {
                const { nestId, avatarId, addTransaction, addFixedExpense, setLoading } = useUserStore.getState();

                // 1. Add Calendar Event
                if (nestId) {
                    setLoading('events', true);
                    try {
                        const data = await api.post(`/nests/${nestId}/calendar_events`, {
                            calendar_event: {
                                title, date, end_date: endDate,
                                creator_id: avatarId, image_url: imageUrl,
                                event_type: 'event',
                                time,
                                repeat
                            }
                        });
                        // ✅ api.ts가 자동으로 에러 Toast 표시 + 재시도

                        set((state: UserState) => ({
                            events: [...state.events, {
                                id: String(data.id),
                                title: data.title,
                                date: data.date,
                                endDate: data.end_date,
                                type: data.event_type || 'event',
                                votes: {},
                                creatorId: String(data.creator_id),
                                imageUrl: data.image_url,
                                time: data.time,
                                repeat: data.repeat
                            }]
                        }));
                        showSuccessToast('일정이 추가되었습니다!');
                    } catch (error) {
                        console.error('일정 추가 실패:', error);
                        // api.ts에서 이미 showApiError() 호출했으므로 추가 Toast 불필요
                    } finally {
                        setLoading('events', false);
                    }
                } else {
                    // Local fallback
                    set((state: UserState) => ({
                        events: [...state.events, {
                            id: Math.random().toString(36).substr(2, 9),
                            title, date, endDate, type: 'event', // Force type event
                            votes: {},
                            creatorId: String(state.avatarId),
                            imageUrl,
                            time,
                            repeat
                        }]
                    }));
                }

                // 2. Budget Integration Logic
                if (budgetInfo && budgetInfo.amount > 0) {
                    const { amount, category } = budgetInfo;

                    if (repeat === 'monthly') {
                        // If Monthly Recurring -> Add to Fixed Expenses
                        // Extract 'day' from date string (YYYY-MM-DD)
                        const day = parseInt(date.split('-')[2]);
                        addFixedExpense(title, amount, day);
                        // Also add one-time transaction for THIS month immediately? 
                        // Let's add it so user sees it right away in calculations
                        addTransaction(`${title} (자동이체)`, amount, category, date);
                    } else {
                        // If One-time -> Add to Transactions
                        addTransaction(`${title} (일정 연동)`, amount, category, date);
                    }
                }
            },

            voteEvent: (eventId, date, userId) => set((state: UserState) => ({
                events: state.events.map(evt => {
                    if (evt.id !== eventId) return evt;
                    const currentVotes = evt.votes[date] || [];
                    const hasVoted = currentVotes.includes(userId);

                    return {
                        ...evt,
                        votes: {
                            ...evt.votes,
                            [date]: hasVoted
                                ? currentVotes.filter(id => id !== userId) // Toggle off
                                : [...currentVotes, userId] // Toggle on
                        }
                    };
                })
            })),

            deleteEvent: async (id) => {
                const { nestId } = useUserStore.getState();
                if (nestId) {
                    try {
                        await api.delete(`/nests/${nestId}/calendar_events/${id}`);
                        set((state: UserState) => ({ events: state.events.filter(e => e.id !== id) }));
                        showSuccessToast('일정이 삭제되었습니다.');
                    } catch (error) {
                        console.error('일정 삭제 실패:', error);
                    }
                } else {
                    set((state: UserState) => ({ events: state.events.filter(e => e.id !== id) }));
                    showSuccessToast('일정이 삭제되었습니다.');
                }
            },

            // Budget Actions
            addTransaction: async (title, amount, category, date?: string) => {
                const { nestId, avatarId, setLoading } = useUserStore.getState();
                const transactionDate = date || new Date().toISOString().split('T')[0];
                if (nestId) {
                    setLoading('transactions', true);
                    try {
                        const data = await api.post(`/nests/${nestId}/transactions`, {
                            transaction: {
                                title, amount, category,
                                date: transactionDate,
                                payer_id: avatarId
                            }
                        });
                        set((state: UserState) => ({
                            transactions: [
                                {
                                    id: String(data.id),
                                    title: data.title,
                                    amount: Number(data.amount),
                                    category: data.category,
                                    date: data.date,
                                    payerId: String(data.payer_id)
                                },
                                ...state.transactions
                            ]
                        }));
                        showSuccessToast('거래 내역이 추가되었습니다!');
                    } catch (error) {
                        console.error('거래 내역 추가 실패:', error);
                    } finally {
                        setLoading('transactions', false);
                    }
                } else {
                    set((state: UserState) => ({
                        transactions: [
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                title, amount, category,
                                date: transactionDate,
                                payerId: String(state.avatarId)
                            },
                            ...state.transactions
                        ]
                    }));
                }
            },

            deleteTransaction: async (id) => {
                const { nestId } = useUserStore.getState();
                if (nestId) {
                    try {
                        await api.delete(`/nests/${nestId}/transactions/${id}`);
                        set((state: UserState) => ({
                            transactions: state.transactions.filter(t => t.id !== id)
                        }));
                        showSuccessToast('거래 내역이 삭제되었습니다.');
                    } catch (error) {
                        console.error('거래 내역 삭제 실패:', error);
                    }
                } else {
                    set((state: UserState) => ({
                        transactions: state.transactions.filter(t => t.id !== id)
                    }));
                    showSuccessToast('거래 내역이 삭제되었습니다.');
                }
            },

            setBudgetGoal: (amount) => {
                set({ budgetGoal: amount });
            },

            addFixedExpense: (title, amount, day) => {
                set((state: UserState) => ({
                    fixedExpenses: [
                        ...state.fixedExpenses,
                        { id: Math.random().toString(36).substr(2, 9), title, amount, day }
                    ]
                }));
            },

            deleteFixedExpense: (id) => {
                set((state: UserState) => ({
                    fixedExpenses: state.fixedExpenses.filter(f => f.id !== id)
                }));
            },

            // Goal Actions
            addGoal: async (type, title, target, unit) => {
                const { nestId, setLoading } = useUserStore.getState();
                if (nestId) {
                    setLoading('goals', true);
                    try {
                        const data = await api.post(`/nests/${nestId}/goals`, {
                            goal: { goal_type: type, title, target, unit, current: 0 }
                        });
                        set((state: UserState) => ({
                            goals: [
                                ...state.goals,
                                {
                                    id: String(data.id),
                                    type: data.goal_type,
                                    title: data.title,
                                    current: data.current,
                                    target: data.target,
                                    unit: data.unit
                                }
                            ]
                        }));
                        showSuccessToast('목표가 추가되었습니다!');
                    } catch (error) {
                        console.error('목표 추가 실패:', error);
                    } finally {
                        setLoading('goals', false);
                    }
                } else{
                    set((state: UserState) => ({
                        goals: [
                            ...state.goals,
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                type, title, current: 0, target, unit
                            }
                        ]
                    }));
                }
            },

            incrementGoalProgress: async (id) => {
                const { nestId, goals } = useUserStore.getState();
                const goal = goals.find(g => g.id === id);
                if (!goal || goal.current >= goal.target) return;

                const nextVal = goal.current + 1;

                if (nestId) {
                    try {
                        await api.patch(`/nests/${nestId}/goals/${id}`, {
                            goal: { current: nextVal }
                        });
                        set((state: UserState) => ({
                            goals: state.goals.map((g: any) => g.id === id ? { ...g, current: nextVal } : g)
                        }));
                        showSuccessToast('목표 진행도가 증가했습니다!');
                    } catch (error) {
                        console.error('목표 진행도 증가 실패:', error);
                    }
                } else {
                    set((state: UserState) => ({
                        goals: state.goals.map((g: Goal) => g.id === id ? { ...g, current: nextVal } : g)
                    }));
                }
            },

            decrementGoalProgress: async (id) => {
                const { nestId, goals } = useUserStore.getState();
                const goal = goals.find(g => g.id === id);
                if (!goal || goal.current <= 0) return;

                const nextVal = goal.current - 1;

                if (nestId) {
                    try {
                        await api.patch(`/nests/${nestId}/goals/${id}`, {
                            goal: { current: nextVal }
                        });
                        set((state: UserState) => ({
                            goals: state.goals.map((g: any) => g.id === id ? { ...g, current: nextVal } : g)
                        }));
                        showSuccessToast('목표 진행도가 감소했습니다.');
                    } catch (error) {
                        console.error('목표 진행도 감소 실패:', error);
                    }
                } else {
                    set((state: UserState) => ({
                        goals: state.goals.map(g => g.id === id ? { ...g, current: nextVal } : g)
                    }));
                }
            },

            deleteGoal: async (id) => {
                const { nestId } = useUserStore.getState();
                if (nestId) {
                    try {
                        await api.delete(`/nests/${nestId}/goals/${id}`);
                        set((state: UserState) => ({ goals: state.goals.filter(g => g.id !== id) }));
                        showSuccessToast('목표가 삭제되었습니다.');
                    } catch (error) {
                        console.error('목표 삭제 실패:', error);
                    }
                } else {
                    set((state: UserState) => ({ goals: state.goals.filter(g => g.id !== id) }));
                    showSuccessToast('목표가 삭제되었습니다.');
                }
            },

            // House Rule Actions Implementation
            addRule: async (title, description, rule_type) => {
                const { nestId, rules, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('rules', true);
                try {
                    const newRule = await api.post(`/nests/${nestId}/house_rules`, {
                        house_rule: {
                            title,
                            description,
                            rule_type,
                            priority: rules.length + 1
                        }
                    });
                    set((state: UserState) => ({
                        rules: [...state.rules, newRule]
                    }));
                    showSuccessToast('룰이 추가되었습니다!');
                } catch (error) {
                    console.error('룰 추가 실패:', error);
                } finally {
                    setLoading('rules', false);
                }
            },

            deleteRule: async (id) => {
                const { nestId } = useUserStore.getState();
                if (!nestId) return;

                try {
                    await api.delete(`/nests/${nestId}/house_rules/${id}`);
                    set((state: UserState) => ({
                        rules: state.rules.filter(r => r.id !== id)
                    }));
                    showSuccessToast('룰이 삭제되었습니다.');
                } catch (error) {
                    console.error('룰 삭제 실패:', error);
                }
            },

            // Anniversary Actions Implementation
            addAnniversary: async (title, date, isRecurring, category) => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('anniversaries', true);
                try {
                    const newAnniversary = await api.post(`/nests/${nestId}/anniversaries`, {
                        anniversary: {
                            title,
                            anniversary_date: date,
                            is_recurring: isRecurring,
                            category
                        }
                    });
                    set((state: UserState) => ({
                        anniversaries: [...state.anniversaries, newAnniversary]
                    }));
                    showSuccessToast('기념일이 추가되었습니다!');
                } catch (error) {
                    console.error('기념일 추가 실패:', error);
                } finally {
                    setLoading('anniversaries', false);
                }
            },

            deleteAnniversary: async (id) => {
                const { nestId } = useUserStore.getState();
                if (!nestId) return;

                try {
                    await api.delete(`/nests/${nestId}/anniversaries/${id}`);
                    set((state: UserState) => ({
                        anniversaries: state.anniversaries.filter(a => a.id !== id)
                    }));
                    showSuccessToast('기념일이 삭제되었습니다.');
                } catch (error) {
                    console.error('기념일 삭제 실패:', error);
                }
            },

            // Sync Implementations
            syncMissions: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('todos', true);
                try {
                    const response = await api.get(`/nests/${nestId}/missions`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    // ✅ api.ts가 자동으로 에러 Toast 표시 + 재시도

                    // Map backend to frontend keys
                    const mapped = data.map((m: any) => ({
                        id: String(m.id),
                        title: m.title,
                        isCompleted: m.is_completed,
                        assignees: m.assignees ? m.assignees.map((a: any) => ({
                            id: String(a.id), nickname: a.nickname, avatarId: a.avatar_id, memberType: a.member_type
                        })) : [],
                        repeat: m.repeat || 'none',
                        imageUrl: m.image_url,
                        createdAt: m.created_at
                    }));
                    set({ todos: mapped });
                } catch (error) {
                    console.error('할 일 동기화 실패:', error);
                    // api.ts에서 이미 showApiError() 호출했으므로 추가 Toast 불필요
                } finally {
                    setLoading('todos', false);
                }
            },

            syncEvents: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('events', true);
                try {
                    const response = await api.get(`/nests/${nestId}/calendar_events`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    const mapped = data.map((e: any) => ({
                        id: String(e.id),
                        title: e.title,
                        date: e.date,
                        endDate: e.end_date,
                        time: e.time,
                        type: e.event_type || 'event',
                        creatorId: String(e.creator_id),
                        imageUrl: e.image_url,
                        votes: {} // Voting logic needs dedicated table later
                    }));
                    set({ events: mapped });
                } catch (error) {
                    console.error('일정 동기화 실패:', error);
                } finally {
                    setLoading('events', false);
                }
            },

            syncGoals: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('goals', true);
                try {
                    const response = await api.get(`/nests/${nestId}/goals`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    const mapped = data.map((g: any) => ({
                        id: String(g.id),
                        type: g.goal_type,
                        title: g.title,
                        current: g.current,
                        target: g.target,
                        unit: g.unit
                    }));
                    set({ goals: mapped });
                } catch (error) {
                    console.error('목표 동기화 실패:', error);
                } finally {
                    setLoading('goals', false);
                }
            },

            syncAll: async () => {
                const { syncMissions, syncEvents, syncGoals, syncTransactions, syncRules, syncAnniversaries, syncMembers } = useUserStore.getState();
                await Promise.all([
                    syncMissions(),
                    syncEvents(),
                    syncGoals(),
                    syncTransactions(),
                    syncRules(),
                    syncAnniversaries(),
                    syncMembers()
                ]);
            },

            syncMembers: async () => {
                const { nestId, setMembers, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('members', true);
                try {
                    const data = await api.get(`/nests/${nestId}`);
                    if (data.members) {
                        setMembers(data.members.map((m: any) => ({
                            id: String(m.id),
                            nickname: m.nickname,
                            avatarId: m.avatar_id,
                            role: m.role || 'mate',
                            memberType: m.member_type
                        })));
                    }
                } catch (error) {
                    console.error('멤버 동기화 실패:', error);
                } finally {
                    setLoading('members', false);
                }
            },

            syncTransactions: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('transactions', true);
                try {
                    const response = await api.get(`/nests/${nestId}/transactions`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    const mapped = data.map((t: any) => ({
                        id: String(t.id),
                        title: t.title,
                        amount: Number(t.amount),
                        category: t.category,
                        date: t.date,
                        payerId: String(t.payer_id)
                    }));
                    set({ transactions: mapped });
                } catch (error) {
                    console.error('거래 내역 동기화 실패:', error);
                } finally {
                    setLoading('transactions', false);
                }
            },

            syncRules: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('rules', true);
                try {
                    const response = await api.get(`/nests/${nestId}/house_rules`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    set({ rules: data });
                } catch (error) {
                    console.error('룰 동기화 실패:', error);
                } finally {
                    setLoading('rules', false);
                }
            },

            syncAnniversaries: async () => {
                const { nestId, setLoading } = useUserStore.getState();
                if (!nestId) return;

                setLoading('anniversaries', true);
                try {
                    const response = await api.get(`/nests/${nestId}/anniversaries`);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    set({ anniversaries: data });
                } catch (error) {
                    console.error('기념일 동기화 실패:', error);
                } finally {
                    setLoading('anniversaries', false);
                }
            }
        }),
        {
            name: 'matecheck-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist critical session data to avoid bloat
            partialize: (state) => ({
                userId: state.userId,
                userEmail: state.userEmail,
                nickname: state.nickname,
                avatarId: state.avatarId,
                nestId: state.nestId,
                nestName: state.nestName,
                nestTheme: state.nestTheme,
                nestAvatarId: state.nestAvatarId,
                isLoggedIn: state.isLoggedIn,
                hasSeenTutorial: state.hasSeenTutorial,
                hasSeenMasterTutorial: state.hasSeenMasterTutorial,
                isMaster: state.isMaster,
                language: state.language,
                appMode: state.appMode
            }),
        }
    )
);
