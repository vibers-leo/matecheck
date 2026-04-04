/**
 * Paperlogy 폰트가 기본 적용된 Text 컴포넌트
 *
 * iOS는 fontWeight가 커스텀 폰트에 적용되지 않으므로
 * fontWeight 값을 Paperlogy 폰트 파일명으로 자동 매핑
 */

import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';

const FONT_MAP: Record<string, string> = {
  '100': 'Paperlogy-Regular',
  '200': 'Paperlogy-Regular',
  '300': 'Paperlogy-Regular',
  '400': 'Paperlogy-Regular',
  'normal': 'Paperlogy-Regular',
  '500': 'Paperlogy-Medium',
  '600': 'Paperlogy-SemiBold',
  '700': 'Paperlogy-Bold',
  'bold': 'Paperlogy-Bold',
  '800': 'Paperlogy-ExtraBold',
  '900': 'Paperlogy-ExtraBold',
};

function resolveFontFamily(style?: TextStyle | TextStyle[]): string {
  const flatStyle: TextStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style ?? {});

  // 이미 Paperlogy 폰트가 명시된 경우 그대로 사용
  if (flatStyle.fontFamily?.startsWith('Paperlogy')) {
    return flatStyle.fontFamily;
  }

  const weight = String(flatStyle.fontWeight ?? '400');
  return FONT_MAP[weight] ?? 'Paperlogy-Regular';
}

export default function Text({ style, ...props }: TextProps) {
  const flatStyle: TextStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style ?? {});

  const fontFamily = resolveFontFamily(flatStyle);

  return (
    <RNText
      {...props}
      style={[flatStyle, { fontFamily, fontWeight: undefined }]}
    />
  );
}
