// BudgetScreen.tsx — 가계부
// 거래 목록 + 추가

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Button } from '@toss/tds-react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS } from '../constants/config';
import { useNestStore } from '../store/nestStore';
import api from '../services/api';

// 거래 내역 타입
interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  createdAt: string;
}

export default function BudgetScreen() {
  const { nestId } = useNestStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // 거래 내역 로드
  const loadTransactions = useCallback(async () => {
    if (!nestId) return;
    setIsLoading(true);
    try {
      const data = await api.get(`/nests/${nestId}/transactions`);
      const list = Array.isArray(data) ? data : data.data || [];
      setTransactions(
        list.map((t: any) => ({
          id: String(t.id),
          title: t.title || t.description,
          amount: t.amount,
          category: t.category || '기타',
          paidBy: t.paid_by_name || t.paid_by || '',
          createdAt: t.created_at,
        }))
      );
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nestId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 거래 추가
  const handleAddTransaction = async () => {
    if (!newTitle.trim() || !newAmount.trim()) return;
    if (!nestId) {
      Alert.alert('알림', '보금자리에 먼저 참여해주세요.');
      return;
    }

    try {
      const data = await api.post(`/nests/${nestId}/transactions`, {
        transaction: {
          title: newTitle.trim(),
          amount: parseInt(newAmount, 10),
          category: '기타',
        },
      });
      setTransactions((prev) => [
        {
          id: String(data.id),
          title: data.title || data.description,
          amount: data.amount,
          category: data.category || '기타',
          paidBy: data.paid_by_name || '',
          createdAt: data.created_at,
        },
        ...prev,
      ]);
      setNewTitle('');
      setNewAmount('');
      setIsAdding(false);
    } catch (error) {
      Alert.alert('오류', '거래 추가에 실패했습니다.');
    }
  };

  // 총 지출 계산
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTransactions} />}
      >
        {/* 총 지출 */}
        <View style={styles.totalCard}>
          <Txt typography="t6" color={COLORS.gray500}>
            이번 달 총 지출
          </Txt>
          <Txt typography="t2" fontWeight="bold" color={COLORS.gray900}>
            {formatAmount(totalAmount)}
          </Txt>
        </View>

        {/* 거래 추가 */}
        {isAdding ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="내용 (예: 공과금)"
              placeholderTextColor={COLORS.gray400}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="금액"
              placeholderTextColor={COLORS.gray400}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />
            <View style={styles.addButtons}>
              <Button size="medium" type="light" onPress={() => setIsAdding(false)}>
                취소
              </Button>
              <Button size="medium" type="primary" onPress={handleAddTransaction}>
                추가
              </Button>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Txt typography="t6" color={COLORS.tossBLue}>
              + 거래 추가
            </Txt>
          </TouchableOpacity>
        )}

        {/* 거래 목록 */}
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.transactionRow}>
            <View style={styles.txLeft}>
              <Txt typography="t6" color={COLORS.gray800}>
                {tx.title}
              </Txt>
              <Txt typography="t7" color={COLORS.gray400}>
                {tx.paidBy ? `${tx.paidBy} · ` : ''}
                {tx.category}
              </Txt>
            </View>
            <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
              {formatAmount(tx.amount)}
            </Txt>
          </View>
        ))}

        {/* 빈 상태 */}
        {transactions.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Txt typography="t5" color={COLORS.gray400}>
              아직 거래 내역이 없어요
            </Txt>
            <View style={{ height: 4 }} />
            <Txt typography="t6" color={COLORS.gray300}>
              공과금, 생활비 등을 기록해보세요
            </Txt>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  totalCard: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    gap: 4,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  addForm: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
    gap: 8,
  },
  input: {
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tossBLue,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  txLeft: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
