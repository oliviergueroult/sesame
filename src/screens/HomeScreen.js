import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { openDoor, logout } from '../api';

const DOORS = [
  { id: 'portail', label: 'Portail', icon: 'gate',        color: '#f5a623' },
  { id: 'garage',  label: 'Garage',  icon: 'garage-open', color: '#4a9eff' },
];

export default function HomeScreen({ onLogout }) {
  const [loading, setLoading] = useState(null); // 'portail-open' | 'portail-close' | etc.

  const handleAction = async (doorId, action) => {
    const key = `${doorId}-${action}`;
    setLoading(key);
    try {
      await openDoor(doorId, action);
      Alert.alert(
        action === 'open' ? '✓ Ouverture' : '✓ Fermeture',
        `Commande envoyée.`
      );
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la commande.');
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sésame</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {DOORS.map(door => (
          <View key={door.id} style={styles.card}>
            <MaterialCommunityIcons name={door.icon} size={56} color={door.color} style={styles.icon} />
            <Text style={styles.doorLabel}>{door.label}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#1e3a1e' }]}
                onPress={() => handleAction(door.id, 'open')}
                disabled={!!loading}
              >
                {loading === `${door.id}-open`
                  ? <ActivityIndicator color="#4caf50" size="small" />
                  : <>
                      <MaterialCommunityIcons name="arrow-up-circle" size={20} color="#4caf50" />
                      <Text style={[styles.actionText, { color: '#4caf50' }]}>Ouvrir</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#2a2a1e' }]}
                onPress={() => handleAction(door.id, 'stop')}
                disabled={!!loading}
              >
                {loading === `${door.id}-stop`
                  ? <ActivityIndicator color="#f5a623" size="small" />
                  : <>
                      <MaterialCommunityIcons name="stop-circle" size={20} color="#f5a623" />
                      <Text style={[styles.actionText, { color: '#f5a623' }]}>Stop</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#3a1e1e' }]}
                onPress={() => handleAction(door.id, 'close')}
                disabled={!!loading}
              >
                {loading === `${door.id}-close`
                  ? <ActivityIndicator color="#f44336" size="small" />
                  : <>
                      <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#f44336" />
                      <Text style={[styles.actionText, { color: '#f44336' }]}>Fermer</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8,
  },
  title: {
    fontSize: 32, fontWeight: '700', color: '#fff',
  },
  logoutText: {
    color: '#f5a623', fontSize: 14,
  },
  grid: {
    flex: 1, padding: 16, gap: 16,
  },
  card: {
    backgroundColor: '#252540', borderRadius: 20,
    padding: 24, alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  doorLabel: {
    color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20,
  },
  actions: {
    flexDirection: 'row', gap: 12, width: '100%',
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14,
  },
  actionText: {
    fontSize: 15, fontWeight: '600',
  },
});
