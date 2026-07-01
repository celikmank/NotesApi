import { colors } from './colors';
import { fonts, fontSize, lineHeight } from './typography';
import { spacing, radius } from './spacing';

export const theme = {
  colors,
  fonts,
  fontSize,
  lineHeight,
  spacing,
  radius,
} as const;

export { colors, fonts, fontSize, lineHeight, spacing, radius };
export type Theme = typeof theme;
