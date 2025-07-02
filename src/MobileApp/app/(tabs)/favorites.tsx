import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../context/FavoriteContext';
import { AntDesign } from '@expo/vector-icons';

const allEvents = [  {
    id: '1',
    title: 'Summer Music Fest',
    date: 'Aug 10, 2025 - 7:00 PM',
    location: 'Central Park',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20',
    attendees: '150+ Attending',
  },
  {
    id: '2',
    title: 'Tech Meetup',
    date: 'Sep 5, 2025 - 6:00 PM',
    location: 'Downtown Hub',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20',
    attendees: '200+ Attending',
  },
  {
    id: '3',
    title: 'Art Walk',
    date: 'Sep 20, 2025 - 4:00 PM',
    location: 'City Gallery',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20',
    attendees: '85+ Attending',
  },
];

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const favoriteEvents = allEvents.filter((event) => favorites.includes(event.id));

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '../event/[id]',
          params: { id: item.id },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.info}>{item.date}</Text>
      <Text style={styles.info}>📍 {item.location}</Text>
      <View style={styles.row}>
        <Text style={styles.attending}>{item.attendees}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <AntDesign
            name={'heart'}
            size={20}
            color={'#FF2D55'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Favorites</Text>
      {favoriteEvents.length === 0 ? (
        <Text style={styles.empty}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favoriteEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 16, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 10,
  },
  empty: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
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
});
