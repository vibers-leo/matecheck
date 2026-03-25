/**
 * Error Boundary Component
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 포착하고
 * 사용자에게 친화적인 폴백 UI를 표시합니다
 *
 * OKR 기여:
 * - KR3 (안정성): 크래시를 방지하고 우아한 에러 처리
 * - KR1 (만족도): 에러 발생 시에도 좋은 사용자 경험 제공
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CONFIG } from '../constants/Config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 state를 업데이트하여 다음 렌더링에서 폴백 UI 표시
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
    if (CONFIG.ENABLE_CRASH_REPORTING) {
      // TODO: Sentry.captureException(error, { extra: errorInfo });
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // 개발 모드에서는 콘솔에 출력
    if (__DEV__) {
      console.error('Error Boundary:', error);
      console.error('Error Info:', errorInfo);
    }

    // 부모 컴포넌트에게 에러 전달 (선택 사항)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공되었으면 그것을 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>앗, 문제가 발생했어요</Text>
            <Text style={styles.message}>
              일시적인 오류가 발생했습니다.{'\n'}
              다시 시도해주세요.
            </Text>

            {/* 개발 모드에서는 에러 상세 정보 표시 */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (DEV):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack} numberOfLines={5}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#0066FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ErrorBoundary;
