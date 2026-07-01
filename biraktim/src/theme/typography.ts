/**
 * Yazı tipleri:
 *  - Bricolage Grotesque → başlıklar / büyük sayaç
 *  - Space Grotesk       → gövde / arayüz
 *  - Space Mono          → sayısal vurgular (para, süre rakamları)
 */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodyBold: 'SpaceGrotesk_700Bold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  '4xl': 44,
  counter: 60,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.35,
  relaxed: 1.6,
} as const;
