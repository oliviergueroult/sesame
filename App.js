import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isLoggedIn, getConfig } from './src/api';
import { isBiometricsEnabled, isBiometricsAvailable, authenticateWithBiometrics } from './src/utils/biometrics';
import LoginScreen  from './src/screens/LoginScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import HomeScreen   from './src/screens/HomeScreen';

export default function App() {
  const [screen, setScreen] = useState(null);

  const goHome = async () => {
    const config = await getConfig().catch(() => ({ configured: false }));
    setScreen(config.configured ? 'home' : 'config');
  };

  useEffect(() => {
    (async () => {
      const logged = await isLoggedIn();
      if (!logged) return setScreen('login');

      // Token présent → tente Face ID si activé
      const bioEnabled   = await isBiometricsEnabled();
      const bioAvailable = await isBiometricsAvailable();
      if (bioEnabled && bioAvailable) {
        const ok = await authenticateWithBiometrics();
        if (!ok) return setScreen('login');
      }

      await goHome();
    })();
  }, []);

  if (screen === null) return <View style={{ flex: 1, backgroundColor: '#1a1a2e' }} />;
  if (screen === 'login')  return <LoginScreen  onLogin={goHome} />;
  if (screen === 'config') return <ConfigScreen onConfigured={() => setScreen('home')} />;
  return <HomeScreen onLogout={() => setScreen('login')} onConfig={() => setScreen('config')} />;
}
