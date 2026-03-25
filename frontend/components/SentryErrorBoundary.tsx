// Sentry stub — @sentry/react-native 미설치 상태, ErrorBoundary로 대체
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_ELEVATION } from '../constants/DesignTokens';

interface Props { children: ReactNode; }
interface State { hasError: boolean; errorInfo: string; }

export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorInfo: error.message || '알 수 없는 오류가 발생했습니다' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) console.error('🚨 Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorInfo: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={[styles.card, TDS_ELEVATION.cardFloating]}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={64} color={TDS_COLORS.red} />
            </View>
            <Text style={styles.title}>앗! 문제가 발생했어요</Text>
            <Text style={styles.description}>
              일시적인 오류가 발생했습니다.{'\n'}잠시 후 다시 시도해주세요.
            </Text>
            {__DEV__ && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.errorInfo}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={this.handleReload} activeOpacity={0.8}>
              <Ionicons name="refresh" size={20} color={TDS_COLORS.white} />
              <Text style={styles.primaryButtonText}>다시 시도</Text>
            </TouchableOpacity>
            <Text style={styles.footer}>문제가 계속되면 앱을 재시작해주세요</Text>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TDS_COLORS.grey100, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: TDS_COLORS.white, borderRadius: 32, padding: 32, maxWidth: 400, width: '100%', alignItems: 'center' },
  iconContainer: { marginBottom: 24 },
  title: { ...TDS_TYPOGRAPHY.display2, color: TDS_COLORS.grey900, marginBottom: 12, textAlign: 'center' },
  description: { ...TDS_TYPOGRAPHY.body1, color: TDS_COLORS.grey600, marginBottom: 24, textAlign: 'center', lineHeight: 24 },
  errorBox: { backgroundColor: TDS_COLORS.grey100, borderRadius: 12, padding: 12, marginBottom: 24, width: '100%' },
  errorText: { ...TDS_TYPOGRAPHY.caption2, color: TDS_COLORS.red, fontFamily: 'monospace' },
  primaryButton: { backgroundColor: TDS_COLORS.blue, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
  primaryButtonText: { ...TDS_TYPOGRAPHY.h3, color: TDS_COLORS.white },
  footer: { ...TDS_TYPOGRAPHY.caption1, color: TDS_COLORS.grey500, marginTop: 24, textAlign: 'center' },
});

export function withSentryErrorBoundary<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return (props: P) => (
    <SentryErrorBoundary>
      <Component {...props} />
    </SentryErrorBoundary>
  );
}
