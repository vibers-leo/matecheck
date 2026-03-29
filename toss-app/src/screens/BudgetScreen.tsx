// BudgetScreen.tsx — 가계부
// 카드 기반 UI: 이번 달 총 지출 카드 + 일별 거래 목록 + 하단 추가 버튼

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Txt from '@toss/tds-react-native/dist/esm/components/txt/Txt';
import { COLORS, CARD_STYLE } from '../constants/config';
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

// 카테고리별 이모지 매핑
const CATEGORY_EMOJI: Record<string, string> = {
  '식비': '🍚',
  '교통': '🚌',
  '생활': '🏠',
  '공과금': '💡',
  '통신': '📱',
  '문화': '🎬',
  '의료': '🏥',
  '쇼핑': '🛍️',
  '기타': '📦',
};

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
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 날짜별 그룹핑
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      const dateKey = tx.createdAt ? tx.createdAt.split('T')[0] : '날짜 없음';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return Object.entries(groups);
  }, [transactions]);

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    if (dateStr === '날짜 없음') return dateStr;
    try {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      return `${month}월 ${day}일 (${weekday})`;
    } catch {
      return dateStr;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTransactions} />}
      >
        {/* 상단 총 지출 카드 */}
        <View style={styles.totalCard}>
          <Txt typography="t6" color={COLORS.gray500}>
            이번 달 총 지출
          </Txt>
          <View style={styles.spacer8} />
          <Txt typography="t1" fontWeight="bold" color={COLORS.gray900}>
            {formatAmount(totalExpense)}
          </Txt>
        </View>

        {/* 날짜별 거래 목록 */}
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([date, txList]) => (
            <View key={date}>
              {/* 날짜 구분선 */}
              <View style={styles.dateDivider}>
                <Txt typography="t7" fontWeight="bold" color={COLORS.gray400}>
                  {formatDate(date)}
                </Txt>
              </View>

              {/* 거래 카드 */}
              <View style={styles.txCard}>
                {txList.map((tx, index) => (
                  <View
                    key={tx.id}
                    style={[
                      styles.txRow,
                      index < txList.length - 1 && styles.txRowBorder,
                    ]}
                  >
                    {/* 카테고리 이모지 */}
                    <View style={styles.txIconContainer}>
                      <Txt typography="t4">
                        {CATEGORY_EMOJI[tx.category] || '📦'}
                      </Txt>
                    </View>

                    {/* 내용 */}
                    <View style={styles.txContent}>
                      <Txt typography="t5" color={COLORS.gray800}>
                        {tx.title}
                      </Txt>
                      <Txt typography="t7" color={COLORS.gray400}>
                        {tx.paidBy ? `${tx.paidBy} · ` : ''}{tx.category}
                      </Txt>
                    </View>

                    {/* 금액 (지출은 빨간색, 수입은 파란색) */}
                    <Txt
                      typography="t5"
                      fontWeight="bold"
                      color={tx.amount >= 0 ? COLORS.red : COLORS.tossBLue}
                    >
                      {tx.amount >= 0 ? '-' : '+'}{formatAmount(Math.abs(tx.amount))}
                    </Txt>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          !isLoading && (
            <View style={styles.emptyCard}>
              <Txt typography="t2">💳</Txt>
              <View style={styles.spacer12} />
              <Txt typography="t5" color={COLORS.gray400}>
                아직 거래 내역이 없어요
              </Txt>
              <View style={styles.spacer4} />
              <Txt typography="t6" color={COLORS.gray300}>
                공과금, 생활비 등을 기록해보세요
              </Txt>
            </View>
          )
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 하단 고정: 추가 버튼 / 입력 폼 */}
      <View style={styles.bottomArea}>
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
              returnKeyType="done"
            />
            <View style={styles.addFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewAmount('');
                }}
              >
                <Txt typography="t6" color={COLORS.gray500}>
                  취소
                </Txt>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!newTitle.trim() || !newAmount.trim()) && styles.saveButtonDisabled,
                ]}
                onPress={handleAddTransaction}
                disabled={!newTitle.trim() || !newAmount.trim()}
              >
                <Txt typography="t6" fontWeight="bold" color={COLORS.white}>
                  저장
                </Txt>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
            activeOpacity={0.8}
          >
            <Txt typography="t5" fontWeight="bold" color={COLORS.white}>
              + 거래 추가
            </Txt>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  totalCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 24,
  },
  spacer12: {
    height: 12,
  },
  spacer8: {
    height: 8,
  },
  spacer4: {
    height: 4,
  },
  dateDivider: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  txCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    padding: 0,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  txRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txContent: {
    flex: 1,
    gap: 2,
  },
  emptyCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 48,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: COLORS.pageBg,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray200,
  },
  addButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addForm: {
    gap: 10,
  },
  input: {
    fontSize: 16,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.tossBLue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
});
