/**
 * Mixtape — warm dark palette.
 * Sıcak, koyu, reklamsız hisli. Para/dopamin unsuru için amber accent öne çıkar.
 */
export const colors = {
  // Yüzeyler
  bg: '#17130F', // en koyu, ana arka plan
  surface: '#211B15', // kart
  surfaceRaised: '#2C241C', // yükseltilmiş kart / basılı hal
  border: '#3A2F25',

  // Metin
  text: '#F5EDE3', // ana metin
  textMuted: '#B7A794', // ikincil
  textFaint: '#7C6F60', // üçüncül / placeholder

  // Accent — sıcak amber/terracotta (para + motivasyon)
  accent: '#E8926B',
  accentSoft: '#3A2A20',
  accentText: '#17130F',

  // Para vurgusu (canlı artan tutar) — altın
  money: '#F2C14E',
  moneySoft: '#3A2F17',

  // Durum
  success: '#7FB77E',
  successSoft: '#233024',
  danger: '#D9705E', // relapse / uyarı ama yargılamayan ton
  dangerSoft: '#33211D',

  // Progress ring
  ringTrack: '#2C241C',
  ringFill: '#E8926B',

  // Overlay
  overlay: 'rgba(10, 8, 6, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
