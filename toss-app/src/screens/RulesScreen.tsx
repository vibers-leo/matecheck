// RulesScreen.tsx — 규칙 관리
// 규칙 목록 + 추가

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

// 규칙 타입
interface Rule {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function RulesScreen() {
  const { nestId } = useNestStore();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 규칙 로드
  const loadRules = useCallback(async () => {
    if (!nestId) return;
    setIsLoading(true);
    try {
      const data = await api.get(`/nests/${nestId}/rules`);
      const list = Array.isArray(data) ? data : data.data || [];
      setRules(
        list.map((r: any) => ({
          id: String(r.id),
          title: r.title,
          description: r.description || '',
          createdAt: r.created_at,
        }))
      );
    } catch (error) {
      console.error('규칙 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nestId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // 규칙 추가
  const handleAddRule = async () => {
    if (!newTitle.trim()) return;
    if (!nestId) {
      Alert.alert('알림', '보금자리에 먼저 참여해주세요.');
      return;
    }

    try {
      const data = await api.post(`/nests/${nestId}/rules`, {
        rule: {
          title: newTitle.trim(),
          description: newDesc.trim(),
        },
      });
      setRules((prev) => [
        {
          id: String(data.id),
          title: data.title,
          description: data.description || '',
          createdAt: data.created_at,
        },
        ...prev,
      ]);
      setNewTitle('');
      setNewDesc('');
      setIsAdding(false);
    } catch (error) {
      Alert.alert('오류', '규칙 추가에 실패했습니다.');
    }
  };

  // 규칙 삭제
  const handleDelete = (ruleId: string, title: string) => {
    Alert.alert('삭제 확인', `"${title}" 규칙을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/nests/${nestId}/rules/${ruleId}`);
            setRules((prev) => prev.filter((r) => r.id !== ruleId));
          } catch (error) {
            Alert.alert('오류', '규칙 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRules} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Txt typography="t4" fontWeight="bold" color={COLORS.gray900}>
            우리의 규칙
          </Txt>
          <Txt typography="t6" color={COLORS.gray500}>
            {rules.length}개
          </Txt>
        </View>

        {/* 규칙 추가 */}
        {isAdding ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="규칙 제목 (예: 설거지는 당일에)"
              placeholderTextColor={COLORS.gray400}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.descInput]}
              placeholder="설명 (선택)"
              placeholderTextColor={COLORS.gray400}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={styles.addButtons}>
              <Button size="medium" type="light" onPress={() => setIsAdding(false)}>
                취소
              </Button>
              <Button size="medium" type="primary" onPress={handleAddRule}>
                추가
              </Button>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Txt typography="t6" color={COLORS.tossBLue}>
              + 규칙 추가
            </Txt>
          </TouchableOpacity>
        )}

        {/* 규칙 목록 */}
        {rules.map((rule, index) => (
          <TouchableOpacity
            key={rule.id}
            style={styles.ruleRow}
            onLongPress={() => handleDelete(rule.id, rule.title)}
          >
            <View style={styles.ruleNumber}>
              <Txt typography="t6" fontWeight="bold" color={COLORS.tossBLue}>
                {index + 1}
              </Txt>
            </View>
            <View style={styles.ruleContent}>
              <Txt typography="t5" fontWeight="bold" color={COLORS.gray800}>
                {rule.title}
              </Txt>
              {rule.description ? (
                <Txt typography="t6" color={COLORS.gray500}>
                  {rule.description}
                </Txt>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        {/* 빈 상태 */}
        {rules.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Txt typography="t5" color={COLORS.gray400}>
              아직 규칙이 없어요
            </Txt>
            <View style={{ height: 4 }} />
            <Txt typography="t6" color={COLORS.gray300}>
              함께 지킬 규칙을 만들어보세요
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
  descInput: {
    minHeight: 40,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  ruleNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.tossBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleContent: {
    flex: 1,
    gap: 4,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
