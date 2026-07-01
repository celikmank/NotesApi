import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Text, Button, Card } from '../src/components';
import { purchasePackage, isPurchasesConfigured } from '../src/services/purchases';
import { usePremium } from '../src/state/PremiumContext';
import { t } from '../src/i18n';
import { colors, spacing, radius, fonts } from '../src/theme';

const FEATURES = [
  'feature_unlimited',
  'feature_milestones',
  'feature_stats',
  'feature_sos',
  'feature_backup',
  'feature_themes',
] as const;

export default function Paywall() {
  const { soft } = useLocalSearchParams<{ soft?: string }>();
  const { refresh, setDevPremium } = usePremium();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [busy, setBusy] = useState(false);

  const close = () => {
    // Soft paywall onboarding sonrası → ana ekrana; değilse geri.
    if (soft) router.replace('/(main)');
    else router.back();
  };

  const onSubscribe = async () => {
    setBusy(true);
    if (!isPurchasesConfigured()) {
      // RevenueCat anahtarı yok (geliştirme) → dev premium aç.
      setDevPremium(true);
      setBusy(false);
      close();
      return;
    }
    const pkgId = plan === 'yearly' ? '$rc_annual' : '$rc_monthly';
    const ok = await purchasePackage(pkgId);
    await refresh();
    setBusy(false);
    if (ok) close();
  };

  return (
    <Screen scroll>
      <Pressable onPress={close} style={styles.closeBtn} hitSlop={12}>
        <Text style={styles.closeX}>✕</Text>
      </Pressable>

      <Text variant="display" style={styles.title}>
        {t('paywall.title')}
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        {t('paywall.subtitle')}
      </Text>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.check}>✓</Text>
            <Text variant="body">{t(`paywall.${f}`)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        <PlanCard
          active={plan === 'yearly'}
          onPress={() => setPlan('yearly')}
          title={t('paywall.yearly')}
          price="$24.99"
          badge={t('paywall.yearlyBadge')}
        />
        <PlanCard
          active={plan === 'monthly'}
          onPress={() => setPlan('monthly')}
          title={t('paywall.monthly')}
          price="$4.99"
        />
      </View>

      <View style={styles.footer}>
        <Button label={t('paywall.cta')} onPress={onSubscribe} loading={busy} />
        <Text variant="muted" style={styles.terms}>
          {t('paywall.trial')} · {t('paywall.terms')}
        </Text>
      </View>
    </Screen>
  );
}

function PlanCard({
  active,
  onPress,
  title,
  price,
  badge,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  price: string;
  badge?: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card style={[styles.plan, active && styles.planActive]}>
        {badge && (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{badge}</Text>
          </View>
        )}
        <Text variant="muted">{title}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeBtn: { alignSelf: 'flex-end', padding: spacing.sm },
  closeX: { color: colors.textMuted, fontSize: 20 },
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  features: { gap: spacing.md, marginBottom: spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { color: colors.success, fontSize: 18, fontFamily: fonts.bodyBold },
  plans: { flexDirection: 'row', gap: spacing.md },
  plan: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  planActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.money,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  planBadgeText: { color: colors.accentText, fontSize: 10, fontFamily: fonts.bodyBold },
  planPrice: { fontFamily: fonts.monoBold, fontSize: 22, color: colors.text },
  footer: { marginTop: spacing['2xl'] },
  terms: { textAlign: 'center', marginTop: spacing.md },
});
