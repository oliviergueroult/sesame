import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveConfig } from '../api';

const SYSTEMS = [
  { id: 'tahoma', label: 'Somfy TaHoma', icon: 'home-automation', color: '#f5a623' },
  { id: 'coming', label: 'Autre (bientôt)', icon: 'clock-outline', color: '#555', disabled: true },
];

export default function ConfigScreen({ onConfigured }) {
  const [systemType, setSystemType] = useState('tahoma');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSave = async () => {
    if (!email || !password) return Alert.alert('Erreur', 'Remplissez tous les champs.');
    setLoading(true);
    try {
      const result = await saveConfig(systemType, { email: email.trim(), password });
      const found = Object.keys(result.devices || {}).length;
      Alert.alert(
        '✓ Connecté',
        `${found} appareil(s) trouvé(s) : ${Object.keys(result.devices).join(', ')}`,
        [{ text: 'Continuer', onPress: onConfigured }]
      );
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mon système</Text>
        <Text style={styles.subtitle}>Choisissez votre système domotique et entrez vos identifiants.</Text>

        <Text style={styles.label}>Système</Text>
        <View style={styles.systemList}>
          {SYSTEMS.map(sys => (
            <TouchableOpacity
              key={sys.id}
              style={[styles.systemBtn, systemType === sys.id && { borderColor: sys.color }, sys.disabled && styles.disabled]}
              onPress={() => !sys.disabled && setSystemType(sys.id)}
              disabled={sys.disabled}
            >
              <MaterialCommunityIcons name={sys.icon} size={28} color={sys.disabled ? '#555' : sys.color} />
              <Text style={[styles.systemLabel, sys.disabled && { color: '#555' }]}>{sys.label}</Text>
              {systemType === sys.id && <MaterialCommunityIcons name="check-circle" size={18} color={sys.color} style={styles.check} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Identifiants {systemType === 'tahoma' ? 'TaHoma / Somfy' : ''}</Text>
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

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading
            ? <><ActivityIndicator color="#fff" /><Text style={styles.buttonText}>  Connexion en cours...</Text></>
            : <Text style={styles.buttonText}>Connecter et détecter les appareils</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a1a2e' },
  content:     { padding: 24, paddingTop: 60 },
  title:       { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle:    { fontSize: 14, color: '#888', marginBottom: 32 },
  label:       { color: '#aaa', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  systemList:  { gap: 10, marginBottom: 28 },
  systemBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252540', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#333', gap: 12 },
  systemLabel: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  check:       { marginLeft: 'auto' },
  disabled:    { opacity: 0.4 },
  input:       { backgroundColor: '#252540', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16 },
  button:      { backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  buttonText:  { color: '#fff', fontSize: 16, fontWeight: '600' },
});
