import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoriteContext';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://192.168.188.32:5216/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events:', response.status);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleToggleFavorite = async (eventId: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert(
        'Not logged in',
        'You must be logged in to add favorites.',
        [
          { text: 'Continue as guest' },
          {
            text: 'Log in',
            onPress: () => router.push('/login'),
          },
        ],
        { cancelable: true }
      );
      return;
    }
    await toggleFavorite(eventId);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    clearFavorites();
    Alert.alert('Logged out', 'You have been logged out.');
    router.replace('/login');
  };

  const renderItem = ({ item }: any) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '../event/[id]', params: { id: item.id } })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.info}>
          🕒 {new Date(item.startDate).toLocaleDateString('en-US')} |{' '}
          {new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
        </Text>
        <Text style={styles.info}>📍 {item.location}</Text>

        <View style={styles.row}>
          <Text style={styles.attending}>{item.attendingCount || 0}+ Attending</Text>
          <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
            <AntDesign name="heart" size={20} color={isFavorite ? '#FF2D55' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Events</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No events found.</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 20, marginTop: 10 },
  empty: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 50 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
  },
  image: { width: '100%', height: 150, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  info: { fontSize: 13, color: '#444', marginTop: 2 },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attending: {
    fontSize: 12,
    backgroundColor: '#C4B5FD',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F87171',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
