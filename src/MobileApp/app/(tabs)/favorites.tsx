import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../context/FavoriteContext';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      setIsGuest(false);

      try {
        const response = await fetch(`${API_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch favorite events:', response.status);
        }
      } catch (err) {
        console.error('Error fetching favorite events:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [favorites]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '../event/[id]',
          params: { id: item.id, from: 'favorites'},
        })
      }
    >
      <View style={styles.imageWrapper}>
        {imageLoading[item.id] && (
          <ActivityIndicator size="large" color="#007AFF" style={StyleSheet.absoluteFill} />
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          onLoadStart={() =>
            setImageLoading((prev) => ({ ...prev, [item.id]: true }))
          }
          onLoadEnd={() =>
            setImageLoading((prev) => ({ ...prev, [item.id]: false }))
          }
        />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.info}>
        🕒{' '}
        {new Date(item.startDate).toLocaleDateString('en-US')} |{' '}
        {new Date(item.startDate).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
        h
      </Text>
      <Text style={styles.info}>📍 {item.location}</Text>

      <View style={styles.row}>
        <Text style={styles.attending}>
          {item.attendingCount || 0}+ {t('attending')}
        </Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <AntDesign name="heart" size={20} color="#FF2D55" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>{t('loadingFavorites')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('yourFavorites')}</Text>
      {isGuest ? (
        <Text style={styles.empty}>{t('mustBeLoggedInToViewFavorites')}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.empty}>{t('noFavoriteEvents')}</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 16, paddingBottom: 80 }}
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
    marginTop: 25,
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
  imageWrapper: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: { width: '100%', height: '100%' },
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
