/**
 * Button Component with Haptic Feedback
 * Toss Design System 기반 프리미엄 버튼
 *
 * OKR 기여:
 * - KR1 (만족도): 촉각 피드백으로 프리미엄 경험 제공
 * - KR2 (재방문율): 즐거운 인터랙션으로 재방문 유도
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { TDS_COLORS, TDS_TYPOGRAPHY, TDS_ELEVATION } from '../constants/DesignTokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  // 필수
  onPress: () => void;
  children: string | React.ReactNode;

  // 선택
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;

  // 아이콘
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;

  // Haptic
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'none';

  // 스타일
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * 프리미엄 버튼 컴포넌트
 *
 * 특징:
 * - 5가지 variant (primary, secondary, outline, ghost, danger)
 * - 3가지 size (sm, md, lg)
 * - Haptic feedback 통합
 * - 로딩 상태
 * - 아이콘 지원
 * - 접근성 (accessibility)
 *
 * @example
 * <Button onPress={handleSubmit} variant="primary" haptic="medium">
 *   저장하기
 * </Button>
 */
export default function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = 'light',
  style,
  textStyle,
}: ButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;

    // Haptic feedback
    if (haptic !== 'none') {
      triggerHaptic(haptic);
    }

    // Execute callback
    onPress();
  };

  const { backgroundColor, textColor, borderColor, borderWidth } = getVariantStyles(variant, disabled);
  const { paddingVertical, paddingHorizontal, fontSize, iconSize } = getSizeStyles(size);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: 16,
          paddingVertical,
          paddingHorizontal,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && { width: '100%' },
        variant === 'primary' && !disabled && TDS_ELEVATION.card,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <Ionicons name={leftIcon} size={iconSize} color={textColor} />
      )}

      {/* Loading Spinner */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      )}

      {/* Text */}
      {typeof children === 'string' ? (
        <Text
          style={[
            {
              color: textColor,
              fontSize,
              fontWeight: '700',
              letterSpacing: -0.3,
            },
            textStyle,
          ]}
        >
          {loading ? '처리 중...' : children}
        </Text>
      ) : (
        children
      )}

      {/* Right Icon */}
      {rightIcon && !loading && (
        <Ionicons name={rightIcon} size={iconSize} color={textColor} />
      )}
    </TouchableOpacity>
  );
}

/**
 * Variant별 스타일 반환
 */
function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return {
      backgroundColor: TDS_COLORS.grey200,
      textColor: TDS_COLORS.grey500,
      borderColor: 'transparent',
      borderWidth: 0,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: TDS_COLORS.blue,
        textColor: TDS_COLORS.white,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'secondary':
      return {
        backgroundColor: TDS_COLORS.grey100,
        textColor: TDS_COLORS.grey900,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'outline':
      return {
        backgroundColor: TDS_COLORS.white,
        textColor: TDS_COLORS.blue,
        borderColor: TDS_COLORS.blue,
        borderWidth: 2,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        textColor: TDS_COLORS.grey700,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'danger':
      return {
        backgroundColor: TDS_COLORS.red,
        textColor: TDS_COLORS.white,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    default:
      return {
        backgroundColor: TDS_COLORS.blue,
        textColor: TDS_COLORS.white,
        borderColor: 'transparent',
        borderWidth: 0,
      };
  }
}

/**
 * Size별 스타일 반환
 */
function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 14,
        iconSize: 16,
      };

    case 'md':
      return {
        paddingVertical: 14,
        paddingHorizontal: 20,
        fontSize: 16,
        iconSize: 18,
      };

    case 'lg':
      return {
        paddingVertical: 18,
        paddingHorizontal: 24,
        fontSize: 18,
        iconSize: 20,
      };

    default:
      return {
        paddingVertical: 14,
        paddingHorizontal: 20,
        fontSize: 16,
        iconSize: 18,
      };
  }
}

/**
 * Haptic feedback 트리거
 */
function triggerHaptic(type: string) {
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Haptic not supported on device
    console.log('Haptic feedback not supported');
  }
}

/**
 * ButtonGroup 컴포넌트
 * 여러 버튼을 그룹으로 묶어 표시
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: number;
  fullWidth?: boolean;
}

export function ButtonGroup({
  children,
  direction = 'row',
  gap = 12,
  fullWidth = false,
}: ButtonGroupProps) {
  return (
    <View
      style={{
        flexDirection: direction,
        gap,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {children}
    </View>
  );
}

/**
 * IconButton 컴포넌트
 * 아이콘만 있는 버튼 (컴팩트)
 */
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  haptic = 'light',
  style,
}: IconButtonProps) {
  const handlePress = () => {
    if (disabled) return;

    if (haptic !== 'none') {
      triggerHaptic(haptic);
    }

    onPress();
  };

  const { backgroundColor, textColor } = getVariantStyles(variant, disabled);
  const iconSizeMap = { sm: 18, md: 22, lg: 26 };
  const paddingMap = { sm: 10, md: 12, lg: 14 };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor,
          borderRadius: 12,
          padding: paddingMap[size],
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && !disabled && TDS_ELEVATION.card,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={iconSizeMap[size]} color={textColor} />
    </TouchableOpacity>
  );
}
