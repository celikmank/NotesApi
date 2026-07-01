import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen, Text, Card, ProgressRing } from '../../src/components';
import { useActiveQuit } from '../../src/hooks/useActiveQuit';
import { useNow } from '../../src/hooks/useNow';
import { getElapsed, getMoneySaved, getUnitsAvoided, formatMoney } from '../../src/logic/calculations';
import { nextTimeMilestone, timeMilestoneLabel } from '../../src/logic/milestones';
import { getMilestones, markAchievedMilestones } from '../../src/db/milestones';
import { healthCards } from '../../src/logic/health';
import { presetFor } from '../../src/logic/quitTypes';
import type { Milestone } from '../../src/db/types';
import { usePremium } from '../../src/state/PremiumContext';
import { t, currentLocale } from '../../src/i18n';
import { colors, spacing, fonts, radius } from '../../src/theme';

export default function Home() {
  const { quit, reload } = useActiveQuit();
  const now = useNow(1000);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { isPremium } = usePremium();

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  useEffect(() => {
    if (!quit) return;
    void getMilestones(quit.id).then(setMilestones);
  }, [quit]);

  // Ulaşılan milestone'ları arka planda işaretle (kutlama için).
  useEffect(() => {
    if (!quit) return;
    const { totalSeconds } = getElapsed(quit, now);
    const money = getMoneySaved(quit, now);
    void markAchievedMilestones(quit.id, totalSeconds, money).then((newly) => {
      if (newly.length) void getMilestones(quit.id).then(setMilestones);
    });
  }, [quit, Math.floor(now / 10000)]);

  if (!quit) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text variant="title">🔥</Text>
          <Text variant="muted">—</Text>
        </View>
      </Screen>
    );
  }

  const elapsed = getElapsed(quit, now);
  const money = getMoneySaved(quit, now);
  const avoided = getUnitsAvoided(quit, now);
  const preset = presetFor(quit.type);
  const next = nextTimeMilestone(milestones, elapsed.totalSeconds);
  const locale = currentLocale();
  const unitLabel = quit.type === 'smoking' ? t('home.unitsCigarettes') : t('home.unitsGeneric');

  return (
    <Screen scroll>
      <Text variant="label">{t('home.quitFor')}</Text>
      <Text variant="display" style={styles.quitName}>
        {quit.name}
      </Text>

      {/* Progress ring + canlı süre */}
      <View style={styles.ringWrap}>
        <ProgressRing progress={next ? next.progress : 1} size={240} strokeWidth={16}>
          <Text style={styles.counterDays}>{elapsed.days}</Text>
          <Text variant="muted">{t('home.days')}</Text>
          <Text style={styles.counterTime}>
            {pad(elapsed.hours)}:{pad(elapsed.minutes)}:{pad(elapsed.seconds)}
          </Text>
        </ProgressRing>
      </View>

      {/* Para — en güçlü dopamin unsuru, altın renkte öne çıkar */}
      <Card style={styles.moneyCard}>
        <Text variant="label">{t('home.saved')}</Text>
        <Text style={styles.moneyValue}>{formatMoney(money, quit.currency, locale === 'tr' ? 'tr-TR' : 'en-US')}</Text>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{avoided}</Text>
          <Text variant="muted">{t('home.avoided')} {unitLabel}</Text>
        </Card>
        {next && (
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{timeMilestoneLabel(next.milestone.threshold)}</Text>
            <Text variant="muted">{t('home.nextMilestone')}</Text>
          </Card>
        )}
      </View>

      {/* Kriz anı butonu — her zaman görünür */}
      <Pressable
        style={styles.sos}
        onPress={() => router.push(isPremium ? '/sos' : '/paywall')}
      >
        <Text style={styles.sosLabel}>🆘 {t('home.craving')}</Text>
      </Pressable>

      {/* Relapse akışı — yargılamayan giriş */}
      <Pressable style={styles.relapse} onPress={() => router.push('/relapse')}>
        <Text style={styles.relapseLabel}>{t('relapse.button')}</Text>
      </Pressable>

      {/* Sigara nişi için sağlık zaman çizelgesi */}
      {preset.hasHealthTimeline && (
        <View style={styles.health}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            {t('home.healthTitle')}
          </Text>
          {healthCards(elapsed.totalSeconds).slice(0, 4).map((h, i) => (
            <Card key={i} style={[styles.healthCard, h.reached && styles.healthReached]}>
              <Text style={{ opacity: h.reached ? 1 : 0.5 }}>
                {h.reached ? '✅ ' : '⏳ '}
                {locale === 'tr' ? h.milestone.tr : h.milestone.en}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  quitName: { marginTop: spacing.xs, marginBottom: spacing.lg },
  ringWrap: { alignItems: 'center', marginVertical: spacing.lg },
  counterDays: { fontFamily: fonts.display, fontSize: 64, color: colors.text, lineHeight: 68 },
  counterTime: { fontFamily: fonts.monoBold, fontSize: 18, color: colors.textMuted, marginTop: spacing.sm },
  moneyCard: { alignItems: 'center', backgroundColor: colors.moneySoft, borderColor: colors.money, gap: spacing.xs },
  moneyValue: { fontFamily: fonts.monoBold, fontSize: 40, color: colors.money },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statCard: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  sos: {
    marginTop: spacing.lg,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  relapse: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  relapseLabel: { color: colors.textFaint, fontFamily: fonts.body, fontSize: 14 },
  health: { marginTop: spacing.xl },
  healthCard: { marginBottom: spacing.sm, paddingVertical: spacing.md },
  healthReached: { borderColor: colors.success },
});
