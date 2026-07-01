import { useEffect, useState } from 'react';
import { View, StyleSheet, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card } from '../../src/components';
import {
  getBoolSetting,
  setBoolSetting,
  getSetting,
  setSetting,
  SETTINGS_KEYS,
} from '../../src/db/settings';
import {
  scheduleDailyMotivation,
  cancelAllReminders,
} from '../../src/services/notifications';
import { restorePurchases } from '../../src/services/purchases';
import { usePremium } from '../../src/state/PremiumContext';
import { setLocale, t, currentLocale } from '../../src/i18n';
import { colors, spacing, radius } from '../../src/theme';

export default function Settings() {
  const { isPremium, refresh } = usePremium();
  const [dailyMotivation, setDaily] = useState(false);
  const [lang, setLang] = useState<'tr' | 'en'>(currentLocale());

  useEffect(() => {
    void getBoolSetting(SETTINGS_KEYS.dailyMotivation, false).then(setDaily);
  }, []);

  const toggleDaily = async (value: boolean) => {
    setDaily(value);
    await setBoolSetting(SETTINGS_KEYS.dailyMotivation, value);
    if (value) {
      const hour = parseInt((await getSetting(SETTINGS_KEYS.dailyMotivationHour)) ?? '9', 10);
      await scheduleDailyMotivation(hour);
    } else {
      await cancelAllReminders();
    }
  };

  const switchLang = async (next: 'tr' | 'en') => {
    setLang(next);
    setLocale(next);
    await setSetting(SETTINGS_KEYS.language, next);
  };

  return (
    <Screen scroll>
      <Text variant="display" style={styles.title}>
        {t('settings.title')}
      </Text>

      {/* Dil */}
      <Text variant="label" style={styles.section}>
        {t('settings.language')}
      </Text>
      <Card style={styles.langRow}>
        {(['tr', 'en'] as const).map((l) => (
          <Pressable
            key={l}
            onPress={() => switchLang(l)}
            style={[styles.langChip, lang === l && styles.langActive]}
          >
            <Text style={{ color: lang === l ? colors.accentText : colors.text }}>
              {l === 'tr' ? 'Türkçe' : 'English'}
            </Text>
          </Pressable>
        ))}
      </Card>

      {/* Bildirimler */}
      <Text variant="label" style={styles.section}>
        {t('settings.notifications')}
      </Text>
      <Card style={styles.rowBetween}>
        <Text>{t('settings.dailyMotivation')}</Text>
        <Switch
          value={dailyMotivation}
          onValueChange={toggleDaily}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor={colors.text}
        />
      </Card>

      {/* Premium / geri yükleme */}
      <Text variant="label" style={styles.section}>
        {t('common.premium')}
      </Text>
      {!isPremium ? (
        <Pressable onPress={() => router.push('/paywall')}>
          <Card style={styles.rowBetween}>
            <Text>{t('paywall.cta')}</Text>
            <Text variant="muted">›</Text>
          </Card>
        </Pressable>
      ) : (
        <Card style={styles.rowBetween}>
          <Text>✅ Premium</Text>
        </Card>
      )}
      <Pressable
        onPress={async () => {
          await restorePurchases();
          await refresh();
        }}
      >
        <Card style={[styles.rowBetween, { marginTop: spacing.sm }]}>
          <Text>{t('settings.restore')}</Text>
        </Card>
      </Pressable>

      {/* Tıbbi uyarı */}
      <Text variant="label" style={styles.section}>
        ⚕️
      </Text>
      <Card>
        <Text variant="muted">{t('settings.medicalDisclaimer')}</Text>
      </Card>

      <Text variant="muted" style={styles.version}>
        {t('settings.version')} 1.0.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.lg },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  langRow: { flexDirection: 'row', gap: spacing.sm },
  langChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  langActive: { backgroundColor: colors.accent },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  version: { textAlign: 'center', marginTop: spacing.xl },
});
