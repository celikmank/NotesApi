import { useState } from 'react';
import { View, Pressable, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button } from '../../src/components';
import { QUIT_PRESETS } from '../../src/logic/quitTypes';
import { selectType, updateDraft, useOnboardingDraft } from '../../src/state/onboardingDraft';
import { t } from '../../src/i18n';
import { colors, radius, spacing } from '../../src/theme';

export default function Step1() {
  const draft = useOnboardingDraft();
  const [customName, setCustomName] = useState('');

  const onNext = () => {
    if (draft.type === 'custom') {
      updateDraft({ name: customName.trim() || t('quitTypes.custom') });
    } else {
      updateDraft({ name: t(`quitTypes.${draft.type}`) });
    }
    router.push('/onboarding/step2');
  };

  return (
    <Screen scroll>
      <Text variant="label">1 / 3</Text>
      <Text variant="display" style={styles.title}>
        {t('onboarding.step1Title')}
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        {t('onboarding.step1Subtitle')}
      </Text>

      <View style={styles.grid}>
        {QUIT_PRESETS.map((p) => {
          const active = draft.type === p.type;
          return (
            <Pressable
              key={p.type}
              onPress={() => selectType(p.type)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={styles.emoji}>{p.emoji}</Text>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {t(`quitTypes.${p.type}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {draft.type === 'custom' && (
        <TextInput
          value={customName}
          onChangeText={setCustomName}
          placeholder={t('onboarding.customPlaceholder')}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
      )}

      <View style={styles.footer}>
        <Button label={t('common.continue')} onPress={onNext} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  emoji: { fontSize: 28 },
  chipLabel: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  chipLabelActive: { color: colors.text },
  input: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  footer: { marginTop: spacing['2xl'] },
});
