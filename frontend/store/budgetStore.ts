// budgetStore.ts — 가계부 관련 상태 및 액션
// userStore.ts에서 분리된 도메인 store
// 새 코드에서는 이 store를 직접 사용하세요

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccessToast } from '../utils/toast';
import api from '../services/api';

// --- Interfaces ---

export interface BudgetTransaction {
    id: string;
    title: string;
    amount: number;
    category: 'food' | 'housing' | 'living' | 'transport' | 'etc';
    date: string;
    payerId: string;
}

export interface FixedExpense {
    id: string;
    title: string;
    amount: number;
    day: number;
}

export interface BudgetState {
    budgetGoal: number;
    transactions: BudgetTransaction[];
    fixedExpenses: FixedExpense[];
    isLoading: boolean;

    // 액션
    addTransaction: (title: string, amount: number, category: BudgetTransaction['category'], date?: string, nestId?: string, payerId?: string) => Promise<void>;
    setBudgetGoal: (amount: number) => void;
    addFixedExpense: (title: string, amount: number, day: number) => void;
    deleteFixedExpense: (id: string) => void;
    syncTransactions: (nestId: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set, get) => ({
            budgetGoal: 1000000,
            transactions: [] as BudgetTransaction[],
            fixedExpenses: [
                { id: '1', title: '🏠 관리비', amount: 150000, day: 1 }
            ] as FixedExpense[],
            isLoading: false,

            addTransaction: async (title, amount, category, date, nestId, payerId) => {
                const transactionDate = date || new Date().toISOString().split('T')[0];

                if (nestId) {
                    set({ isLoading: true });
                    try {
                        const data = await api.post(`/nests/${nestId}/transactions`, {
                            transaction: {
                                title, amount, category,
                                date: transactionDate,
                                payer_id: payerId
                            }
                        });
                        set((state) => ({
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
                        set({ isLoading: false });
                    }
                } else {
                    set((state) => ({
                        transactions: [
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                title, amount, category,
                                date: transactionDate,
                                payerId: payerId || '0'
                            },
                            ...state.transactions
                        ]
                    }));
                }
            },

            setBudgetGoal: (amount) => set({ budgetGoal: amount }),

            addFixedExpense: (title, amount, day) => set((state) => ({
                fixedExpenses: [
                    ...state.fixedExpenses,
                    { id: Math.random().toString(36).substr(2, 9), title, amount, day }
                ]
            })),

            deleteFixedExpense: (id) => set((state) => ({
                fixedExpenses: state.fixedExpenses.filter(f => f.id !== id)
            })),

            syncTransactions: async (nestId) => {
                if (!nestId) return;

                set({ isLoading: true });
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
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'matecheck-budget-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                budgetGoal: state.budgetGoal,
                fixedExpenses: state.fixedExpenses,
            }),
        }
    )
);
