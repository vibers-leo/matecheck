// todoStore.ts — 미션/투두 상태 관리
// 기존 todoStore에서 이식

import { create } from 'zustand';
import api from '../services/api';

// --- 인터페이스 ---

export interface User {
  id: string;
  nickname: string;
  avatarId: number;
  memberType?: 'human' | 'baby' | 'pet' | 'plant' | 'ai';
}

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  assignees: User[];
  completedBy?: string;
  createdAt: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface TodoState {
  todos: Todo[];
  isLoading: boolean;

  // 액션
  addTodo: (title: string, nestId: string, assigneeIds?: string[]) => Promise<void>;
  toggleTodo: (id: string, memberId: string, nestId: string) => Promise<void>;
  deleteTodo: (id: string, nestId: string) => Promise<void>;
  syncMissions: (nestId: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>()(
  (set, get) => ({
    todos: [],
    isLoading: false,

    // 할 일 추가
    addTodo: async (title, nestId, assigneeIds = []) => {
      if (!title.trim()) return;

      try {
        const data = await api.post(`/nests/${nestId}/missions`, {
          mission: {
            title,
            assignee_ids: assigneeIds,
            repeat: 'none',
            is_completed: false,
          },
        });

        set((state) => ({
          todos: [
            {
              id: String(data.id),
              title: data.title,
              isCompleted: data.is_completed,
              assignees: data.assignees
                ? data.assignees.map((a: any) => ({
                    id: String(a.id),
                    nickname: a.nickname,
                    avatarId: a.avatar_id,
                    memberType: a.member_type,
                  }))
                : [],
              createdAt: data.created_at,
              repeat: data.repeat || 'none',
            },
            ...state.todos,
          ],
        }));
      } catch (error) {
        console.error('할 일 추가 실패:', error);
        throw error;
      }
    },

    // 할 일 토글 (완료/미완료)
    toggleTodo: async (id, memberId, nestId) => {
      const { todos } = get();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const nextStatus = !todo.isCompleted;

      try {
        await api.patch(`/nests/${nestId}/missions/${id}`, {
          mission: { is_completed: nextStatus },
        });

        set((state) => ({
          todos: state.todos
            .map((t) =>
              t.id === id
                ? { ...t, isCompleted: nextStatus, completedBy: nextStatus ? memberId : undefined }
                : t
            )
            .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)),
        }));
      } catch (error) {
        console.error('할 일 토글 실패:', error);
      }
    },

    // 할 일 삭제
    deleteTodo: async (id, nestId) => {
      try {
        await api.delete(`/nests/${nestId}/missions/${id}`);
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      } catch (error) {
        console.error('할 일 삭제 실패:', error);
      }
    },

    // 미션 동기화
    syncMissions: async (nestId) => {
      if (!nestId) return;

      set({ isLoading: true });
      try {
        const response = await api.get(`/nests/${nestId}/missions`);
        const data = Array.isArray(response) ? response : response.data || [];

        const mapped = data.map((m: any) => ({
          id: String(m.id),
          title: m.title,
          isCompleted: m.is_completed,
          assignees: m.assignees
            ? m.assignees.map((a: any) => ({
                id: String(a.id),
                nickname: a.nickname,
                avatarId: a.avatar_id,
                memberType: a.member_type,
              }))
            : [],
          repeat: m.repeat || 'none',
          createdAt: m.created_at,
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
