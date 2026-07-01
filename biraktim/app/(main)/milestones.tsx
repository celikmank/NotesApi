import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Button } from '../../src/components';
import { useActiveQuit } from '../../src/hooks/useActiveQuit';
import { getMilestones } from '../../src/db/milestones';
import { FREE_MILESTONE_LIMIT, timeMilestoneLabel } from '../../src/logic/milestones';
import { formatMoney } from '../../src/logic/calculations';
import type { Milestone } from '../../src/db/types';
import { usePremium } from '../../src/state/PremiumContext';
import { t, currentLocale } from '../../src/i18n';
import { colors, spacing, radius } from '../../src/theme';

export default function Milestones() {
  const { quit } = useActiveQuit();
  const { isPremium } = usePremium();
  const [items, setItems] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!quit) return;
    void getMilestones(quit.id).then(setItems);
  }, [quit]);

  const locale = currentLocale();
  const timeItems = items.filter((m) => m.kind === 'time');
  const moneyItems = items.filter((m) => m.kind === 'money');

  const renderRow = (m: Milestone, index: number, currency: string) => {
    const locked = !isPremium && index >= FREE_MILESTONE_LIMIT;
    const achieved = m.achieved_at !== null;
    const label =
      m.kind === 'time'
        ? timeMilestoneLabel(m.threshold)
        : formatMoney(m.threshold, currency, locale === 'tr' ? 'tr-TR' : 'en-US');

    return (
      <Card key={m.id} style={[styles.row, achieved && styles.achieved, locked && styles.locked]}>
        <View style={styles.rowLeft}>
          <Text style={styles.badge}>{achieved ? '🏆' : locked ? '🔒' : '•'}</Text>
          <Text variant="body">{label}</Text>
        </View>
        <Text variant="muted">
          {locked ? t('milestones.locked') : achieved ? t('milestones.achieved') : ''}
        </Text>
      </Card>
    );
  };

  return (
    <Screen scroll>
      <Text variant="display" style={styles.title}>
        {t('milestones.title')}
      </Text>

      <Text variant="label" style={styles.section}>
        {t('milestones.time')}
      </Text>
      {timeItems.map((m, i) => renderRow(m, i, quit?.currency ?? 'TRY'))}

      <Text variant="label" style={styles.section}>
        {t('milestones.money')}
      </Text>
      {moneyItems.map((m, i) => renderRow(m, i, quit?.currency ?? 'TRY'))}

      {!isPremium && (
        <View style={styles.cta}>
          <Button label={t('common.premium')} onPress={() => router.push('/paywall')} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.lg },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: { fontSize: 18 },
  achieved: { borderColor: colors.money, backgroundColor: colors.moneySoft },
  locked: { opacity: 0.55 },
  cta: { marginTop: spacing.xl },
});
