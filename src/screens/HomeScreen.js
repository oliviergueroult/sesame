import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { openDoor, logout } from '../api';

const DOORS = [
  { id: 'portail', label: 'Portail', icon: '🚗' },
  { id: 'garage',  label: 'Garage',  icon: '🏠' },
];

export default function HomeScreen({ onLogout }) {
  const [opening, setOpening] = useState(null);

  const handleOpen = async (door) => {
    setOpening(door.id);
    try {
      await openDoor(door.id);
      Alert.alert('✓ Commande envoyée', `${door.label} en cours d'ouverture.`);
    } catch {
      Alert.alert('Erreur', `Impossible d'ouvrir le ${door.label}.`);
    } finally {
      setOpening(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sésame</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Utilisez CarPlay pour ouvrir depuis votre voiture.</Text>

      <View style={styles.grid}>
        {DOORS.map(door => (
          <TouchableOpacity
            key={door.id}
            style={styles.doorButton}
            onPress={() => handleOpen(door)}
            disabled={!!opening}
          >
            {opening === door.id
              ? <ActivityIndicator color="#fff" size="large" />
              : <>
                  <Text style={styles.doorIcon}>{door.icon}</Text>
                  <Text style={styles.doorText}>{door.label}</Text>
                </>
            }
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1a1a2e', padding: 24, paddingTop: 60,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  title: {
    fontSize: 32, fontWeight: '700', color: '#fff',
  },
  logoutText: {
    color: '#f5a623', fontSize: 14,
  },
  hint: {
    color: '#888', fontSize: 13, marginBottom: 40,
  },
  grid: {
    flexDirection: 'row', gap: 16,
  },
  doorButton: {
    flex: 1, backgroundColor: '#2a2a3e', borderRadius: 20,
    paddingVertical: 48, alignItems: 'center', justifyContent: 'center',
  },
  doorIcon: {
    fontSize: 48, marginBottom: 12,
  },
  doorText: {
    color: '#fff', fontSize: 20, fontWeight: '600',
  },
});
