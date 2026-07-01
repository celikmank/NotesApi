import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button, Card } from '../src/components';
import { useActiveQuit } from '../src/hooks/useActiveQuit';
import { relapse as doRelapse, getLongestStreakDays } from '../src/db/streaks';
import { t } from '../src/i18n';
import { colors, spacing, fonts } from '../src/theme';

/**
 * Relapse akışı — yargılamayan dil. Sayaç sıfırlanır ama geçmiş seriler saklanır.
 * Bu, churn'ü azaltan kritik detay: kullanıcı utançla uygulamayı silmesin.
 */
export default function Relapse() {
  const { quit, reload } = useActiveQuit();
  const [longest, setLongest] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!quit) return;
    void getLongestStreakDays(quit.id).then(setLongest);
  }, [quit]);

  const onConfirm = async () => {
    if (!quit) return;
    setBusy(true);
    await doRelapse(quit.id);
    await reload();
    setBusy(false);
    router.replace('/(main)');
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.emoji}>🌱</Text>
        <Text variant="display" style={styles.title}>
          {t('relapse.title')}
        </Text>
        <Text variant="muted" style={styles.body}>
          {t('relapse.body')}
        </Text>

        <Card style={styles.streakCard}>
          <Text variant="label">{t('relapse.longestStreak')}</Text>
          <Text style={styles.streakValue}>
            {longest} {t('home.days')}
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button label={t('relapse.confirm')} onPress={onConfirm} variant="danger" loading={busy} />
        <Pressable onPress={() => router.back()} style={styles.keep}>
          <Text style={styles.keepText}>{t('relapse.keepGoing')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 48 },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', paddingHorizontal: spacing.lg },
  streakCard: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs, alignSelf: 'stretch' },
  streakValue: { fontFamily: fonts.display, fontSize: 32, color: colors.text },
  footer: { gap: spacing.md },
  keep: { alignItems: 'center', paddingVertical: spacing.md },
  keepText: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 16 },
});
