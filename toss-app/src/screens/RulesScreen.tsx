// RulesScreen.tsx — 규칙 관리
// 카드 기반 UI: 번호 뱃지 + 카드 안 리스트 + 하단 추가 버튼

import React, { useState, useEffect, useCallback } from 'react';
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
        ...prev,
        {
          id: String(data.id),
          title: data.title,
          description: data.description || '',
          createdAt: data.created_at,
        },
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRules} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Txt typography="t5" fontWeight="bold" color={COLORS.gray900}>
            우리의 규칙
          </Txt>
          <Txt typography="t6" color={COLORS.gray500}>
            {rules.length}개
          </Txt>
        </View>

        {/* 규칙 카드 */}
        {rules.length > 0 ? (
          <View style={styles.rulesCard}>
            {rules.map((rule, index) => (
              <TouchableOpacity
                key={rule.id}
                style={[
                  styles.ruleRow,
                  index < rules.length - 1 && styles.ruleRowBorder,
                ]}
                onLongPress={() => handleDelete(rule.id, rule.title)}
                activeOpacity={0.6}
              >
                {/* 번호 뱃지 */}
                <View style={styles.ruleNumber}>
                  <Txt typography="t6" fontWeight="bold" color={COLORS.tossBLue}>
                    {index + 1}
                  </Txt>
                </View>

                {/* 규칙 내용 */}
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
          </View>
        ) : (
          !isLoading && (
            <View style={styles.emptyCard}>
              <Txt typography="t2">📋</Txt>
              <View style={styles.spacer12} />
              <Txt typography="t5" color={COLORS.gray400}>
                아직 규칙이 없어요
              </Txt>
              <View style={styles.spacer4} />
              <Txt typography="t6" color={COLORS.gray300}>
                함께 지킬 규칙을 만들어보세요
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
            <View style={styles.addFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDesc('');
                }}
              >
                <Txt typography="t6" color={COLORS.gray500}>
                  취소
                </Txt>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !newTitle.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleAddRule}
                disabled={!newTitle.trim()}
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
              + 규칙 추가
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  rulesCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    padding: 0,
    overflow: 'hidden',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  ruleRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  ruleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.tossBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ruleContent: {
    flex: 1,
    gap: 4,
  },
  emptyCard: {
    ...CARD_STYLE,
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 48,
  },
  spacer12: {
    height: 12,
  },
  spacer4: {
    height: 4,
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
  descInput: {
    minHeight: 60,
    textAlignVertical: 'top',
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
