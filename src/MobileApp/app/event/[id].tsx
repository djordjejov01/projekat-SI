import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoriteContext';

const screen = Dimensions.get('window');

type Event = {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  organizerId: number;
  organizerName: string;
  attendingCount: number;
  isFavorite: boolean;
  agenda: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }[];
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  const [event, setEvent] = useState<Event | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentId = typeof id === 'string' ? id : '';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://192.168.33.108:5216/api/Events/Details?id=${currentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to load event');

        const data = await response.json();
        setEvent(data);
        geocodeLocation(data.location);
      } catch (err) {
        console.error(err);
        setError('Došlo je do greške pri učitavanju događaja.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setCoords({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        });
      }
    } catch (err) {
      console.warn('Greška pri geokodiranju lokacije:', err);
    }
  };

  const isFavorite = favorites.includes(currentId);

  const calculateDuration = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Učitavanje...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>{error || 'Događaj nije pronađen.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>
        📅 {new Date(event.startDate).toLocaleDateString('sr-RS', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.info}>
          🕒 {new Date(event.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}h - {new Date(event.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}h
        </Text>
        <Text style={styles.info}>📍 {event.location}</Text>
        <Text style={styles.info}>🏢 Organizator: {event.organizerName}</Text>
        <Text style={styles.info}>👥 Prijavljenih: {event.attendingCount || 0}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.favoriteBtn} onPress={() => toggleFavorite(currentId)} activeOpacity={0.7}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF2D55' : '#2563EB'}
          />
          <Text style={[styles.favoriteText, { color: isFavorite ? '#FF2D55' : '#2563EB' }]}>
            {isFavorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} activeOpacity={0.7}>
          <Text style={styles.buyText}>Kupi kartu</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Opis događaja</Text>
      <Text style={styles.description}>{event.description}</Text>

      {event.agenda?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Raspored</Text>
          {event.agenda.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>
                {new Date(item.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} - {new Date(item.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleDesc}>{item.description}</Text>
            </View>
          ))}
        </>
      )}

      {coords && (
        <>
          <Text style={styles.sectionTitle}>Lokacija</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <UrlTile
              urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            <Marker
              coordinate={coords}
              title={event.title}
              description={event.location}
            />
          </MapView>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.backText}>← Nazad na događaje</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
    marginTop:40
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    marginBottom: 6,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteText: {
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 16,
  },
  buyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  scheduleItem: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  scheduleTime: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  scheduleTitle: {
    fontSize: 14,
    color: '#111827',
  },
  scheduleDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#111827',
  },
});
