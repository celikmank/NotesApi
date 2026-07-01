/**
 * RevenueCat entegrasyon katmanı.
 *
 * Gerçek anahtarlar .env / app config üzerinden verilmelidir. Anahtar yoksa
 * (geliştirme) modül no-op'a düşer ve premium = false döner; böylece uygulama
 * RevenueCat kurulmadan da çalışır.
 */
import Purchases, { type CustomerInfo, type PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { setBoolSetting, SETTINGS_KEYS } from '../db/settings';

const ENTITLEMENT_ID = 'premium';

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
};

let configured = false;

export function isPurchasesConfigured(): boolean {
  return configured;
}

export async function initPurchases(): Promise<void> {
  const key = Platform.select(API_KEYS) ?? '';
  if (!key) {
    // Anahtar yok — RevenueCat olmadan geliştirme.
    return;
  }
  Purchases.configure({ apiKey: key });
  configured = true;
}

export function hasPremium(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[ENTITLEMENT_ID];
}

export async function refreshPremium(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.getCustomerInfo();
  const premium = hasPremium(info);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkgIdentifier: string): Promise<boolean> {
  if (!configured) return false;
  const offering = await getCurrentOffering();
  const pkg = offering?.availablePackages.find((p) => p.identifier === pkgIdentifier);
  if (!pkg) return false;
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const premium = hasPremium(customerInfo);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  const premium = hasPremium(info);
  await setBoolSetting(SETTINGS_KEYS.isPremium, premium);
  return premium;
}
