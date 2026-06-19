import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { login, register } from '../api';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
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
  button:        { width: '100%', backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText:    { color: '#fff', fontSize: 16, fontWeight: '600' },
});
