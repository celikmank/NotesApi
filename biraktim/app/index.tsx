import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getBoolSetting, SETTINGS_KEYS } from '../src/db/settings';
import { colors } from '../src/theme';

/** Onboarding tamamlandıysa ana sekmeye, değilse onboarding'e yönlendirir. */
export default function Index() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    void getBoolSetting(SETTINGS_KEYS.onboardingDone, false).then(setDone);
  }, []);

  if (done === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <Redirect href={done ? '/(main)' : '/onboarding/step1'} />;
}
