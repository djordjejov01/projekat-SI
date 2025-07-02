import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Fest',
    date: 'Aug 10, 2025 - 7:00 PM',
    location: 'Central Park',
    description: 'Join us for an unforgettable night of music under the stars!',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20',
  },
  {
    id: '2',
    title: 'Tech Meetup',
    date: 'Sep 5, 2025 - 6:00 PM',
    location: 'Downtown Hub',
    description: 'Networking and knowledge sharing for tech enthusiasts.',
    image: 'https://images.unsplash.com/photo-1581090700227-1e8eaf4d33d5',
  },
  {
    id: '3',
    title: 'Art Walk',
    date: 'Sep 20, 2025 - 4:00 PM',
    location: 'City Gallery',
    description: 'Explore modern art exhibits and meet local artists.',
    image: 'https://images.unsplash.com/photo-1558981033-0e6b5f3d55c3',
  },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: event.image }} style={styles.image} />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.detail}>🗓 {event.date}</Text>
      <Text style={styles.detail}>📍 {event.location}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Events</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  detail: { fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14, marginTop: 16, lineHeight: 20, color: '#333' },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  backText: { fontSize: 16 },
});
