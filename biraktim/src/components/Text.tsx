import React from 'react';
import { Text as RNText, type TextProps, StyleSheet } from 'react-native';
import { colors, fonts, fontSize } from '../theme';

type Variant = 'display' | 'title' | 'body' | 'muted' | 'mono' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

const variantStyle: Record<Variant, object> = {
  display: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: colors.text },
  title: { fontFamily: fonts.displaySemi, fontSize: fontSize.xl, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  mono: { fontFamily: fonts.monoBold, fontSize: fontSize.base, color: colors.text },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textMuted },
};

export function Text({ variant = 'body', color, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[variantStyle[variant], color ? { color } : null, style]}
      allowFontScaling
    />
  );
}

export const textStyles = StyleSheet.create({});
