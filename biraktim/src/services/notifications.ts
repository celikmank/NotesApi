import * as Notifications from 'expo-notifications';
import type { Quit } from '../db/types';
import { nextTimeMilestone } from '../logic/milestones';
import { getMilestones } from '../db/milestones';
import { getElapsed } from '../logic/calculations';
import { t } from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Milestone yaklaşınca bildirim planlar ("Yarın 1 haftayı deviriyorsun 🔥").
 * Spam yok: yalnızca bir sonraki süre milestone'u için tek bildirim.
 */
export async function scheduleMilestoneReminder(quit: Quit): Promise<void> {
  const milestones = await getMilestones(quit.id);
  const { totalSeconds } = getElapsed(quit);
  const next = nextTimeMilestone(milestones, totalSeconds);
  if (!next) return;

  // Milestone'dan ~1 gün önce hatırlat.
  const fireInSeconds = next.remaining - 86_400;
  if (fireInSeconds <= 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bıraktım 🔥',
      body: t('home.nextMilestone'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: fireInSeconds,
    },
  });
}

/** Günlük motivasyon: sabah tek bildirim (kapatılabilir, saat seçilebilir). */
export async function scheduleDailyMotivation(hour = 9): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bıraktım',
      body: t('home.healthTitle'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
