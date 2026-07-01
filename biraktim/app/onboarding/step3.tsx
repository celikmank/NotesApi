import { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button } from '../../src/components';
import { getDraft, updateDraft, useOnboardingDraft, resetDraft } from '../../src/state/onboardingDraft';
import { createQuit } from '../../src/db/quits';
import { setBoolSetting, SETTINGS_KEYS } from '../../src/db/settings';
import { requestNotificationPermission, scheduleMilestoneReminder } from '../../src/services/notifications';
import { t } from '../../src/i18n';
import { colors, radius, spacing } from '../../src/theme';

export default function Step3() {
  const draft = useOnboardingDraft();
  const [mode, setMode] = useState<'now' | 'past'>('now');
  const [saving, setSaving] = useState(false);

  const onFinish = async () => {
    setSaving(true);
    const d = getDraft();
    const quit = await createQuit({
      type: d.type,
      name: d.name || t(`quitTypes.${d.type}`),
      quit_date: d.quitDate,
      daily_amount: d.dailyAmount,
      unit_cost: d.unitCost,
      currency: d.currency,
    });

    await setBoolSetting(SETTINGS_KEYS.onboardingDone, true);

    // Bildirim izni + ilk milestone hatırlatıcısı.
    const granted = await requestNotificationPermission();
    if (granted) await scheduleMilestoneReminder(quit);

    resetDraft();
    // Onboarding sonunda soft paywall (X ile kapatılabilir).
    router.replace('/paywall?soft=1');
  };

  return (
    <Screen>
      <Text variant="label">3 / 3</Text>
      <Text variant="display" style={styles.title}>
        {t('onboarding.step3Title')}
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        {t('onboarding.step3Subtitle')}
      </Text>

      <View style={styles.options}>
        <Pressable
          onPress={() => {
            setMode('now');
            updateDraft({ quitDate: new Date().toISOString() });
          }}
          style={[styles.option, mode === 'now' && styles.optionActive]}
        >
          <Text style={styles.optionEmoji}>⏱️</Text>
          <Text variant="title">{t('onboarding.now')}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode('past');
            // Basitlik için: 1 gün öncesi. Gerçek uygulamada DateTimePicker.
            const d = new Date();
            d.setDate(d.getDate() - 1);
            updateDraft({ quitDate: d.toISOString() });
          }}
          style={[styles.option, mode === 'past' && styles.optionActive]}
        >
          <Text style={styles.optionEmoji}>📅</Text>
          <Text variant="title">{t('onboarding.pickDate')}</Text>
          {mode === 'past' && (
            <Text variant="muted">
              {new Date(draft.quitDate).toLocaleDateString(
                Platform.OS === 'ios' ? undefined : 'tr-TR'
              )}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button label={t('onboarding.finish')} onPress={onFinish} loading={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  options: { gap: spacing.md, flex: 1 },
  option: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionEmoji: { fontSize: 32 },
  footer: { marginTop: spacing.xl },
});
