import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isBiometricsAvailable = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled   = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateWithBiometrics = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:    'Accéder à Sésame',
    cancelLabel:      'Utiliser le mot de passe',
    fallbackLabel:    'Mot de passe',
    disableDeviceFallback: false,
  });
  return result.success;
};

export const getBiometricsType = async () => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'faceid';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  return null;
};

export const isBiometricsEnabled = async () => {
  const val = await AsyncStorage.getItem('sesame_biometrics');
  return val === 'true';
};

export const enableBiometrics  = () => AsyncStorage.setItem('sesame_biometrics', 'true');
export const disableBiometrics = () => AsyncStorage.removeItem('sesame_biometrics');
