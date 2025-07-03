import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoriteContext';

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  organizer: string;
  image: string;
  description: string;
  schedule: { time: string; title: string }[];
  performers: { name: string; color: string }[];
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Music Fest 2025',
    date: 'Saturday, August 10, 2025',
    time: '7:00 PM',
    location: 'Central Park, New York',
    duration: '5h',
    organizer: 'SyncUp Events Inc.',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20',
    description:
      'Held annually in the heart of the city, the Summer Music Fest is a celebration of music, community, and summer vibes. Featuring world-renowned performers, food trucks, art installations, and interactive experiences, it\'s the ultimate summer event.\n\nJoin thousands of fans as you dance to the beats of top DJs, explore various stages, and enjoy a unique mix of genres. This year\'s lineup promises to deliver unforgettable moments and surprises.',
    schedule: [
      { time: '7:00 PM', title: 'Opening Ceremony & Local Talent Showcase' },
      { time: '7:30 PM', title: 'Main Stage: DJ Electro' },
      { time: '8:10 PM', title: 'Acoustic Tent: Chillout Session with Lush Echo' },
      { time: '9:10 PM', title: 'Late Night Groove: DJ Spark' },
    ],
    performers: [
      { name: 'DJ Electro', color: '#D1FAE5' },
      { name: 'Vocal Harmony', color: '#FDE68A' },
      { name: 'Dr. Arya Sharma', color: '#FECACA' },
    ],
  },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { favorites, toggleFavorite } = useFavorites();

  const event = mockEvents.find((e) => e.id === id);

  // Da izbegnemo greške tipa, proveravamo da li id postoji i koristi se kao string
  const currentId = typeof id === 'string' ? id : '';

  const isFavorite = favorites.includes(currentId);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.image }} style={styles.image} />

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{event.date}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.info}>🕒 {event.time}</Text>
        <Text style={styles.info}>📍 {event.location}</Text>
        <Text style={styles.info}>⏱ Duration: {event.duration}</Text>
        <Text style={styles.info}>🏢 Organizer: {event.organizer}</Text>
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
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} activeOpacity={0.7}>
          <Text style={styles.buyText}>Buy Tickets</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>About the Event</Text>
      <Text style={styles.description}>{event.description}</Text>

      <Text style={styles.sectionTitle}>Event Schedule</Text>
      {event.schedule.map((item, index) => (
        <View key={index} style={styles.scheduleItem}>
          <Text style={styles.scheduleTime}>{item.time}</Text>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Speakers & Performers</Text>
      {event.performers.map((p, index) => (
        <View key={index} style={[styles.performerItem, { backgroundColor: p.color }]}>
          <Text>{p.name}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.backText}>← Back to Events</Text>
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
