import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, RefreshControl, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStatus, openDoor, triggerAlarm, logout } from '../api';

// État → action suivante
const NEXT_ACTION = {
  closed:  { action: 'open',  label: 'Ouvrir',  color: '#4caf50', icon: 'arrow-up-circle-outline' },
  moving:  { action: 'stop',  label: 'Arrêter', color: '#f5a623', icon: 'stop-circle-outline' },
  open:    { action: 'close', label: 'Fermer',  color: '#f44336', icon: 'arrow-down-circle-outline' },
  unknown: { action: 'open',  label: 'Ouvrir',  color: '#4caf50', icon: 'arrow-up-circle-outline' },
};

const DOOR_ICONS = { portail: 'gate', garage: 'garage-open' };
const DOOR_LABELS = { portail: 'Portail', garage: 'Garage' };

const STATE_LABEL = { closed: 'Fermé', moving: 'En mouvement', open: 'Ouvert', unknown: '—' };
const STATE_COLOR = { closed: '#888', moving: '#f5a623', open: '#4caf50', unknown: '#555' };

function DoorCard({ id, state, onAction }) {
  const [loading, setLoading] = useState(false);
  const next = NEXT_ACTION[state] || NEXT_ACTION.unknown;

  const handlePress = async () => {
    setLoading(true);
    await onAction(id, next.action);
    setLoading(false);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} disabled={loading} activeOpacity={0.75}>
      <View style={[styles.iconRing, { borderColor: next.color }]}>
        {loading
          ? <ActivityIndicator color={next.color} size="large" />
          : <MaterialCommunityIcons name={DOOR_ICONS[id]} size={52} color={next.color} />
        }
      </View>
      <Text style={styles.doorLabel}>{DOOR_LABELS[id]}</Text>
      <View style={styles.stateRow}>
        <View style={[styles.dot, { backgroundColor: STATE_COLOR[state] }]} />
        <Text style={[styles.stateText, { color: STATE_COLOR[state] }]}>{STATE_LABEL[state]}</Text>
        <Text style={styles.arrow}> → </Text>
        <MaterialCommunityIcons name={next.icon} size={14} color={next.color} />
        <Text style={[styles.stateText, { color: next.color }]}> {next.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function AlarmCard({ state, onToggle }) {
  const [loading, setLoading] = useState(false);
  const armed = state === 'armed';
  const color = armed ? '#f44336' : '#4caf50';

  const handlePress = async () => {
    setLoading(true);
    await onToggle(armed ? 'disarm' : 'arm');
    setLoading(false);
  };

  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={handlePress} disabled={loading} activeOpacity={0.75}>
      <View style={[styles.iconRing, { borderColor: color }]}>
        {loading
          ? <ActivityIndicator color={color} size="large" />
          : <MaterialCommunityIcons name={armed ? 'alarm-light' : 'alarm-light-off'} size={52} color={color} />
        }
      </View>
      <Text style={styles.doorLabel}>Alarme</Text>
      <View style={styles.stateRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.stateText, { color }]}>{armed ? 'Armée' : 'Désarmée'}</Text>
        <Text style={styles.arrow}> → </Text>
        <Text style={[styles.stateText, { color: armed ? '#4caf50' : '#f44336' }]}>{armed ? 'Désarmer' : 'Armer'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ onLogout, onConfig }) {
  const [status, setStatus]         = useState({ portail: 'unknown', garage: 'unknown', alarm: 'unknown' });
  const [refreshing, setRefreshing] = useState(false);
  const lockedUntil = React.useRef({}); // door → timestamp, ignore TaHoma pendant ce délai

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getStatus();
      setStatus(prev => {
        const next = { ...prev };
        const now  = Date.now();
        Object.entries(s).forEach(([k, v]) => {
          if (v && !(lockedUntil.current[k] > now)) next[k] = v;
        });
        ['portail', 'garage'].forEach(k => {
          if (prev[k] === 'moving' && !s[k] && !(lockedUntil.current[k] > now)) next[k] = 'unknown';
        });
        return next;
      });
    } catch {
      setStatus(prev => ({
        ...prev,
        portail: prev.portail === 'moving' ? 'unknown' : prev.portail,
        garage:  prev.garage  === 'moving' ? 'unknown' : prev.garage,
      }));
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleDoorAction = async (door, action) => {
    if (action === 'stop') {
      // Stop : état inconnu immédiatement, lock 10s pour ignorer TaHoma
      lockedUntil.current[door] = Date.now() + 10000;
      try { await openDoor(door, action); } catch {}
      setStatus(prev => ({ ...prev, [door]: 'unknown' }));
      return;
    }
    // Open / close : moving, puis on poll après que la porte a eu le temps de bouger
    setStatus(prev => ({ ...prev, [door]: 'moving' }));
    lockedUntil.current[door] = Date.now() + 25000; // laisse 25s à TaHoma pour mettre à jour
    try { await openDoor(door, action); } catch {}
    setTimeout(fetchStatus, 8000);
    setTimeout(fetchStatus, 20000);
  };

  const handleAlarm = async (action) => {
    try {
      await triggerAlarm(action);
      setStatus(prev => ({ ...prev, alarm: action === 'arm' ? 'armed' : 'disarmed' }));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sésame</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onConfig} style={styles.headerBtn}>
            <MaterialCommunityIcons name="cog-outline" size={22} color="#f5a623" />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await logout(); onLogout(); }} style={styles.headerBtn}>
            <MaterialCommunityIcons name="logout" size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchStatus(); setRefreshing(false); }} tintColor="#f5a623" />}
      >
        <DoorCard id="portail" state={status.portail} onAction={handleDoorAction} />
        <DoorCard id="garage"  state={status.garage}  onAction={handleDoorAction} />
        <AlarmCard state={status.alarm} onToggle={handleAlarm} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#1a1a2e' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  title:      { fontSize: 32, fontWeight: '700', color: '#fff' },
  logoutText:    { color: '#f5a623', fontSize: 14 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn:     { padding: 6 },
  scroll:     { flex: 1 },
  grid:       { padding: 16, gap: 12 },
  card:       { backgroundColor: '#252540', borderRadius: 20, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#333' },
  iconRing:   { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  doorLabel:  { color: '#fff', fontSize: 20, fontWeight: '700' },
  stateRow:   { flexDirection: 'row', alignItems: 'center' },
  dot:        { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  stateText:  { fontSize: 13, fontWeight: '500' },
  arrow:      { color: '#555', fontSize: 13 },
});
