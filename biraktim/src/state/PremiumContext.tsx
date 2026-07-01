import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getBoolSetting, SETTINGS_KEYS } from '../db/settings';
import { initPurchases, refreshPremium } from '../services/purchases';

interface PremiumState {
  isPremium: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Geliştirme/QA için manuel geçiş (RevenueCat anahtarı yokken). */
  setDevPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumState | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Önce cache'lenmiş değer, sonra RevenueCat doğrulaması.
    const cached = await getBoolSetting(SETTINGS_KEYS.isPremium, false);
    setIsPremium(cached);
    const live = await refreshPremium();
    if (live) setIsPremium(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    void (async () => {
      await initPurchases();
      await refresh();
    })();
  }, [refresh]);

  const value = useMemo<PremiumState>(
    () => ({ isPremium, loading, refresh, setDevPremium: setIsPremium }),
    [isPremium, loading, refresh]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumState {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
