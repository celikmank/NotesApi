import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Screen, Text, Button, Card } from '../src/components';
import { useActiveQuit } from '../src/hooks/useActiveQuit';
import { useNow } from '../src/hooks/useNow';
import { getElapsed, getMoneySaved, formatMoney } from '../src/logic/calculations';
import { logCraving } from '../src/db/cravings';
import { t, currentLocale } from '../src/i18n';
import { colors, spacing, fonts, radius } from '../src/theme';

/** Kriz anı (SOS) — 4-7-8 nefes egzersizi + motivasyon + dikkat dağıtma sayacı. */
export default function Sos() {
  const { quit } = useActiveQuit();
  const now = useNow(1000);
  const scale = useSharedValue(1);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [distractLeft, setDistractLeft] = useState<number | null>(null);

  // 4-7-8: 4s nefes al, 7s tut, 8s ver.
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.6, { duration: 7000 }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    const cycle = setInterval(() => {
      setPhase((p) => (p === 'in' ? 'hold' : p === 'hold' ? 'out' : 'in'));
    }, 6333);
    return () => clearInterval(cycle);
  }, [scale]);

  // 5 dakikalık dikkat dağıtma sayacı.
  useEffect(() => {
    if (distractLeft === null) return;
    if (distractLeft <= 0) return;
    const id = setTimeout(() => setDistractLeft((n) => (n ?? 0) - 1), 1000);
    return () => clearTimeout(id);
  }, [distractLeft]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onResisted = async () => {
    if (quit) await logCraving(quit.id, true);
    router.back();
  };

  const locale = currentLocale();
  const days = quit ? getElapsed(quit, now).days : 0;
  const money = quit ? getMoneySaved(quit, now) : 0;
  const phaseLabel = phase === 'in' ? t('sos.breatheIn') : phase === 'hold' ? t('sos.hold') : t('sos.breatheOut');

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.close} hitSlop={12}>
        <Text style={styles.closeX}>✕</Text>
      </Pressable>

      <Text variant="title" style={styles.header}>
        {t('sos.title')}
      </Text>

      <View style={styles.breatheWrap}>
        <Animated.View style={[styles.circle, circleStyle]} />
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      </View>

      <Card style={styles.motivation}>
        <Text style={styles.motivationText}>
          {t('sos.motivation', {
            days: String(days),
            money: formatMoney(money, quit?.currency ?? 'TRY', locale === 'tr' ? 'tr-TR' : 'en-US'),
          })}
        </Text>
      </Card>

      {distractLeft !== null && distractLeft > 0 && (
        <Text style={styles.timer}>
          {Math.floor(distractLeft / 60)}:{(distractLeft % 60).toString().padStart(2, '0')}
        </Text>
      )}

      <View style={styles.footer}>
        <Button label={t('sos.resisted')} onPress={onResisted} />
        <Pressable onPress={() => setDistractLeft(300)} style={styles.distract}>
          <Text style={styles.distractText}>{t('sos.distract')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: 'flex-end', padding: spacing.sm },
  closeX: { color: colors.textMuted, fontSize: 20 },
  header: { textAlign: 'center', marginBottom: spacing.lg },
  breatheWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  circle: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseLabel: { fontFamily: fonts.displaySemi, fontSize: 22, color: colors.text, marginTop: spacing['2xl'] },
  motivation: { alignItems: 'center', marginBottom: spacing.md },
  motivationText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text, textAlign: 'center' },
  timer: { fontFamily: fonts.monoBold, fontSize: 28, color: colors.money, textAlign: 'center', marginBottom: spacing.md },
  footer: { gap: spacing.md },
  distract: { alignItems: 'center', paddingVertical: spacing.md },
  distractText: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 16 },
});
