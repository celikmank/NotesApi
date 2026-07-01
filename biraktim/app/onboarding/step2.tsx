import { View, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button } from '../../src/components';
import { updateDraft, useOnboardingDraft } from '../../src/state/onboardingDraft';
import { t } from '../../src/i18n';
import { colors, radius, spacing } from '../../src/theme';

export default function Step2() {
  const draft = useOnboardingDraft();
  const isSmoking = draft.type === 'smoking';

  const dailyLabel = isSmoking
    ? t('onboarding.cigarettesPerDay')
    : t('onboarding.dailyAmount');
  const costLabel = isSmoking ? t('onboarding.perPack') : t('onboarding.unitCost');

  // Sigara için birim fiyat = paket fiyatı / 20 (paket başı 20 sigara).
  const onCostChange = (raw: string) => {
    const v = parseFloat(raw.replace(',', '.')) || 0;
    updateDraft({ unitCost: isSmoking ? v / 20 : v });
  };

  const costFieldValue = isSmoking ? draft.unitCost * 20 : draft.unitCost;

  return (
    <Screen scroll>
      <Text variant="label">2 / 3</Text>
      <Text variant="display" style={styles.title}>
        {t('onboarding.step2Title')}
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        {t('onboarding.step2Subtitle')}
      </Text>

      <View style={styles.field}>
        <Text variant="label">{dailyLabel}</Text>
        <TextInput
          keyboardType="numeric"
          defaultValue={String(draft.dailyAmount)}
          onChangeText={(v) => updateDraft({ dailyAmount: parseFloat(v.replace(',', '.')) || 0 })}
          style={styles.input}
          placeholderTextColor={colors.textFaint}
        />
      </View>

      <View style={styles.field}>
        <Text variant="label">{costLabel} (₺)</Text>
        <TextInput
          keyboardType="numeric"
          defaultValue={String(costFieldValue)}
          onChangeText={onCostChange}
          style={styles.input}
          placeholderTextColor={colors.textFaint}
        />
      </View>

      <View style={styles.footer}>
        <Button label={t('common.continue')} onPress={() => router.push('/onboarding/step3')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg, gap: spacing.sm },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 18,
  },
  footer: { marginTop: spacing.xl },
});
