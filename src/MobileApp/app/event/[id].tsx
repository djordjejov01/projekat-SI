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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoriteContext';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentId = typeof id === 'string' ? id : '';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://192.168.33.108:5216/api/Events/Details?id=${currentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to load event');

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError('Došlo je do greške pri učitavanju događaja.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
        {new Date(event.startDate).toLocaleDateString('sr-RS', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.info}>
          🕒{' '}
          {new Date(event.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.info}>📍 {event.location}</Text>
        <Text style={styles.info}>
          ⏱ Trajanje: {calculateDuration(event.startDate, event.endDate)}
        </Text>
        <Text style={styles.info}>🏢 Organizator: {event.organizerName}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(currentId)}
          activeOpacity={0.7}
        >
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

      <Text style={styles.sectionTitle}>O događaju</Text>
      <Text style={styles.description}>{event.description}</Text>

      <Text style={styles.sectionTitle}>Raspored događaja</Text>
      {event.agenda.map((item, index) => (
        <View key={index} style={styles.scheduleItem}>
          <Text style={styles.scheduleTime}>
            {new Date(item.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Govornici / Izvođači</Text>
      <View style={[styles.performerItem, { backgroundColor: '#FDE68A' }]}>
        <Text>{event.organizerName}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.backText}>← Nazad na događaje</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteText: {
    fontWeight: '500',
    marginLeft: 6,
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
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  scheduleItem: {
    marginBottom: 10,
  },
  scheduleTime: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  scheduleTitle: {
    fontSize: 14,
    color: '#444',
  },
  performerItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
  },
});
