import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isLoggedIn } from './src/api';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    isLoggedIn().then(setLoggedIn).catch(() => setLoggedIn(false));

    try {
      const CarPlayService = require('./src/carplay/CarPlayService').default;
      CarPlayService.start();
      return () => CarPlayService.stop();
    } catch (e) {
      console.log('CarPlay non disponible:', e.message);
    }
  }, []);

  if (loggedIn === null) return <View style={{ flex: 1, backgroundColor: '#1a1a2e' }} />;

  return loggedIn
    ? <HomeScreen onLogout={() => setLoggedIn(false)} />
    : <LoginScreen onLogin={() => setLoggedIn(true)} />;
}
