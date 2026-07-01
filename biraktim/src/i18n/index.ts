import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { tr } from './tr';
import { en } from './en';

export const i18n = new I18n({ tr, en });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

/** Cihaz dilini uygula; TR ise tr, değilse en. */
export function applyDeviceLocale(override?: string): void {
  const device = getLocales()[0]?.languageCode ?? 'en';
  const lang = override ?? device;
  i18n.locale = lang === 'tr' ? 'tr' : 'en';
}

/** Kısa yardımcı: t('home.saved'), t('sos.motivation', { days, money }) */
export function t(key: string, params?: Record<string, string | number>): string {
  return i18n.t(key, params);
}

export function setLocale(lang: 'tr' | 'en'): void {
  i18n.locale = lang;
}

export function currentLocale(): 'tr' | 'en' {
  return i18n.locale === 'tr' ? 'tr' : 'en';
}
