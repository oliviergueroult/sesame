import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { openDoor, triggerAlarm, logout } from '../api';

const DOOR_CYCLE = ['open', 'stop', 'close'];
const DOOR_CONFIG = {
  open:  { label: 'Ouverture',  color: '#4caf50', icon: 'arrow-up-circle-outline' },
  stop:  { label: 'Arrêt',      color: '#f5a623', icon: 'stop-circle-outline' },
  close: { label: 'Fermeture',  color: '#f44336', icon: 'arrow-down-circle-outline' },
};

const DOORS = [
  { id: 'portail', label: 'Portail', icon: 'gate' },
  { id: 'garage',  label: 'Garage',  icon: 'garage-open' },
];

function DoorCard({ door }) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const action = DOOR_CYCLE[cycleIndex];
  const cfg    = DOOR_CONFIG[action];

  const handlePress = async () => {
    setLoading(true);
    try {
      await openDoor(door.id, action);
      setLastAction(action);
      setCycleIndex((cycleIndex + 1) % DOOR_CYCLE.length);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} disabled={loading} activeOpacity={0.75}>
      <View style={[styles.iconRing, { borderColor: cfg.color }]}>
        {loading
          ? <ActivityIndicator color={cfg.color} size="large" />
          : <MaterialCommunityIcons name={door.icon} size={52} color={cfg.color} />
        }
      </View>
      <Text style={styles.doorLabel}>{door.label}</Text>
      <View style={[styles.badge, { backgroundColor: cfg.color + '22' }]}>
        <MaterialCommunityIcons name={cfg.icon} size={14} color={cfg.color} />
        <Text style={[styles.badgeText, { color: cfg.color }]}>
          {lastAction ? DOOR_CONFIG[lastAction].label + ' envoyé · ' : ''}Prochain : {cfg.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AlarmCard() {
  const [armed, setArmed]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await triggerAlarm(armed ? 'disarm' : 'arm');
      setArmed(!armed);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, styles.alarmCard, { borderColor: armed ? '#f44336' : '#4caf50' }]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.75}
    >
      <View style={[styles.iconRing, { borderColor: armed ? '#f44336' : '#4caf50' }]}>
        {loading
          ? <ActivityIndicator color={armed ? '#f44336' : '#4caf50'} size="large" />
          : <MaterialCommunityIcons
              name={armed ? 'alarm-light' : 'alarm-light-off'}
              size={52}
              color={armed ? '#f44336' : '#4caf50'}
            />
        }
      </View>
      <Text style={styles.doorLabel}>Alarme</Text>
      <View style={[styles.badge, { backgroundColor: (armed ? '#f44336' : '#4caf50') + '22' }]}>
        <Text style={[styles.badgeText, { color: armed ? '#f44336' : '#4caf50' }]}>
          {armed ? '🔴 Armée — appuyer pour désarmer' : '🟢 Désarmée — appuyer pour armer'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sésame</Text>
        <TouchableOpacity onPress={async () => { await logout(); onLogout(); }}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {DOORS.map(door => <DoorCard key={door.id} door={door} />)}
        <AlarmCard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a1a2e' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  title:       { fontSize: 32, fontWeight: '700', color: '#fff' },
  logoutText:  { color: '#f5a623', fontSize: 14 },
  grid:        { flex: 1, padding: 16, gap: 12 },
  card:        { backgroundColor: '#252540', borderRadius: 20, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#333' },
  alarmCard:   { borderWidth: 1.5 },
  iconRing:    { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  doorLabel:   { color: '#fff', fontSize: 20, fontWeight: '700' },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText:   { fontSize: 12, fontWeight: '500' },
});
