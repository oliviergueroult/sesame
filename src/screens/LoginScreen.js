import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { login } from '../api';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      onLogin();
    } catch {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sésame</Text>
      <Text style={styles.subtitle}>Portail & Garage, depuis votre voiture.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Se connecter</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1a1a2e', padding: 32,
  },
  title: {
    fontSize: 42, fontWeight: '700', color: '#fff', marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: '#aaa', marginBottom: 48, textAlign: 'center',
  },
  input: {
    width: '100%', backgroundColor: '#2a2a3e', color: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16,
  },
  button: {
    width: '100%', backgroundColor: '#f5a623', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
  },
});
