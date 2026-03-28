// todoStore.ts — 미션/투두 관련 상태 및 액션
// userStore.ts에서 분리된 도메인 store
// 새 코드에서는 이 store를 직접 사용하세요

import { create } from 'zustand';
import { showSuccessToast, showValidationError } from '../utils/toast';
import api from '../services/api';

// --- Interfaces ---

export interface User {
    id: string;
    nickname: string;
    avatarId: number;
    memberType?: 'human' | 'baby' | 'pet' | 'plant' | 'ai';
    role?: 'master' | 'mate';
}

export interface Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    assignees: User[];
    completedBy?: string;
    createdAt: string;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    imageUrl?: string;
}

export interface TodoState {
    todos: Todo[];
    isLoading: boolean;

    // 액션
    addTodo: (title: string, assigneeIds?: string[], repeat?: 'none' | 'daily' | 'weekly' | 'monthly', imageUrl?: string, nestId?: string, members?: User[]) => Promise<void>;
    toggleTodo: (id: string, memberId: string, nestId?: string) => Promise<void>;
    deleteTodo: (id: string, nestId?: string) => Promise<void>;
    syncMissions: (nestId: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>()(
    (set, get) => ({
        todos: [] as Todo[],
        isLoading: false,

        addTodo: async (title, assigneeIds = ['0'], repeat = 'none', imageUrl, nestId, members = []) => {
            if (!title.trim()) {
                showValidationError('할 일 제목을 입력해주세요.');
                return;
            }

            if (nestId) {
                try {
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

                    set((state) => ({
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
                    console.error('할 일 추가 실패:', error);
                }
            } else {
                const selectedMembers = members.filter((m) => assigneeIds.includes(m.id));
                set((state) => ({
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

        toggleTodo: async (id, memberId, nestId) => {
            const { todos } = get();
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            const nextStatus = !todo.isCompleted;

            if (nestId) {
                try {
                    await api.patch(`/nests/${nestId}/missions/${id}`, {
                        mission: { is_completed: nextStatus }
                    });
                    set((state) => ({
                        todos: state.todos.map((t) =>
                            t.id === id
                                ? { ...t, isCompleted: nextStatus, completedBy: memberId }
                                : t
                        ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                    }));
                    showSuccessToast(nextStatus ? '할 일을 완료했습니다!' : '할 일을 다시 활성화했습니다.');
                } catch (error) {
                    console.error('할 일 토글 실패:', error);
                }
            } else {
                set((state) => ({
                    todos: state.todos.map((t) =>
                        t.id === id
                            ? { ...t, isCompleted: nextStatus, completedBy: nextStatus ? memberId : undefined }
                            : t
                    ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                }));
                showSuccessToast(nextStatus ? '할 일을 완료했습니다!' : '할 일을 다시 활성화했습니다.');
            }
        },

        deleteTodo: async (id, nestId) => {
            if (nestId) {
                try {
                    await api.delete(`/nests/${nestId}/missions/${id}`);
                    set((state) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
                    showSuccessToast('할 일이 삭제되었습니다.');
                } catch (error) {
                    console.error('할 일 삭제 실패:', error);
                }
            } else {
                set((state) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
                showSuccessToast('할 일이 삭제되었습니다.');
            }
        },

        syncMissions: async (nestId) => {
            if (!nestId) return;

            set({ isLoading: true });
            try {
                const response = await api.get(`/nests/${nestId}/missions`);
                const data = Array.isArray(response) ? response : (response.data || []);

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
            } finally {
                set({ isLoading: false });
            }
        },
    })
);
