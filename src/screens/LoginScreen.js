import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { login, register } from '../api';
import {
  isBiometricsAvailable, isBiometricsEnabled,
  authenticateWithBiometrics, enableBiometrics, getBiometricsType
} from '../utils/biometrics';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode]           = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioType, setBioType]     = useState(null);

  useEffect(() => {
    (async () => {
      const available = await isBiometricsAvailable();
      const enabled   = await isBiometricsEnabled();
      const type      = await getBiometricsType();
      setBioAvailable(available);
      setBioType(type);
      // Auto-prompt Face ID si déjà activé
      if (available && enabled) {
        const ok = await authenticateWithBiometrics();
        if (ok) onLogin();
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);

      // Proposer Face ID après la première connexion réussie
      if (bioAvailable) {
        const enabled = await isBiometricsEnabled();
        if (!enabled) {
          Alert.alert(
            bioType === 'faceid' ? 'Face ID' : 'Empreinte',
            `Voulez-vous utiliser ${bioType === 'faceid' ? 'Face ID' : 'votre empreinte'} pour vous connecter ?`,
            [
              { text: 'Non', onPress: onLogin },
              { text: 'Oui', onPress: async () => { await enableBiometrics(); onLogin(); } },
            ]
          );
          return;
        }
      }
      onLogin();
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sésame</Text>
      <Text style={styles.subtitle}>Portail & Garage, depuis votre voiture.</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
          <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => setMode('register')}>
          <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</Text>
        }
      </TouchableOpacity>

      {bioAvailable && mode === 'login' && (
        <TouchableOpacity style={styles.bioBtn} onPress={async () => {
          const ok = await authenticateWithBiometrics();
          if (ok) onLogin();
        }}>
          <MaterialCommunityIcons
            name={bioType === 'faceid' ? 'face-recognition' : 'fingerprint'}
            size={32} color="#f5a623"
          />
          <Text style={styles.bioText}>
            {bioType === 'faceid' ? 'Se connecter avec Face ID' : 'Se connecter avec l\'empreinte'}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 32 },
  title:         { fontSize: 42, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle:      { fontSize: 14, color: '#888', marginBottom: 32, textAlign: 'center' },
  tabs:          { flexDirection: 'row', backgroundColor: '#252540', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%' },
  tab:           { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:     { backgroundColor: '#f5a623' },
  tabText:       { color: '#888', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  input:         { width: '100%', backgroundColor: '#252540', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16 },
  button:     { width: '100%', backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bioBtn:     { marginTop: 28, alignItems: 'center', gap: 8 },
  bioText:    { color: '#f5a623', fontSize: 14, fontWeight: '500' },
});
