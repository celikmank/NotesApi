/**
 * RevenueCat entegrasyon katmanı.
 *
 * Gerçek anahtarlar .env / app config üzerinden verilmelidir. Anahtar yoksa
 * (geliştirme / Expo Go) modül no-op'a düşer ve premium = false döner; böylece
 * uygulama RevenueCat native modülü olmadan da (Expo Go dahil) çalışır.
 *
 * Native modül YALNIZCA anahtar varken lazy olarak yüklenir — böylece Expo Go'da
 * import anında native modül aranmaz.
 */
import { Platform } from 'react-native';
import { setBoolSetting, SETTINGS_KEYS } from '../db/settings';

type CustomerInfo = { entitlements: { active: Record<string, unknown> } };

const ENTITLEMENT_ID = 'premium';

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
};

let configured = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Purchases: any = null;

function loadNative(): boolean {
  if (Purchases) return true;
  try {
    // Lazy require — Expo Go'da anahtar yoksa hiç çağrılmaz.
    Purchases = require('react-native-purchases').default;
    return !!Purchases;
  } catch {
    return false;
  }
}

export function isPurchasesConfigured(): boolean {
  return configured;
}

export async function initPurchases(): Promise<void> {
  const key = Platform.select(API_KEYS) ?? '';
  if (!key) {
    // Anahtar yok — RevenueCat olmadan geliştirme / Expo Go.
    return;
  }
  if (!loadNative()) return;
  Purchases.configure({ apiKey: key });
  configured = true;
}

export function hasPremium(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[ENTITLEMENT_ID];
}

export async function refreshPremium(): Promise<boolean> {
  if (!configured) return false;
  const info = (await Purchases.getCustomerInfo()) as CustomerInfo;
  const premium = hasPremium(info);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCurrentOffering(): Promise<any | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkgIdentifier: string): Promise<boolean> {
  if (!configured) return false;
  const offering = await getCurrentOffering();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg = offering?.availablePackages.find((p: any) => p.identifier === pkgIdentifier);
  if (!pkg) return false;
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const premium = hasPremium(customerInfo);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false;
  const info = (await Purchases.restorePurchases()) as CustomerInfo;
  const premium = hasPremium(info);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}

