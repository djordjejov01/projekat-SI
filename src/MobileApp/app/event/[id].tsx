import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '../../config';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoriteContext';
import { useTranslation } from 'react-i18next';

const screen = Dimensions.get('window');

type AgendaItem = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

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
  agenda: AgendaItem[];
  minPrice: number | null;
  maxPrice: number | null;
  isFree: boolean;
};

export default function EventDetailScreen() {
  const { id, from } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const currentId = typeof id === 'string' ? id : '';

  const [event, setEvent] = useState<Event | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  const { loadFavorites } = useFavorites();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');

        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/Events/Details?id=${currentId}`, {
          headers,
        });

        if (!response.ok) throw new Error(t('failedToLoadEvent'));

        const data: Event = await response.json();

        // Izračunaj da li je event free (ako su minPrice i maxPrice null ili 0)
        const isFreeCalculated =
          (data.minPrice === null || data.minPrice === 0) &&
          (data.maxPrice === null || data.maxPrice === 0);

        setEvent({ ...data, isFree: isFreeCalculated });

        geocodeLocation(data.location);
      } catch (err) {
        console.error(err);
        setError(t('failedToLoadEventDetails'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [currentId]);

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
        {
          headers: {
            'User-Agent': 'SyncUpApp/1.0 (support@syncupapp.com)',
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        console.warn('Nominatim API returned error status:', response.status);
        const text = await response.text();
        console.warn('Response text:', text);
        return;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        setCoords({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        });
      } else {
        console.warn('No results for location:', location);
      }
    } catch (err) {
      console.warn('Error geocoding location:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!event) return;

    setUpdatingFavorite(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          t('authenticationRequired'),
          t('loginToManageFavorites'),
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('login'), onPress: () => router.push('/login') },
          ]
        );
        setUpdatingFavorite(false);
        return;
      }

      const method = event.isFavorite ? 'DELETE' : 'POST';

      const res = await fetch(`${API_URL}/Favorites`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event.id),
      });

      if (res.ok) {
        setEvent((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : prev));
        await loadFavorites();
      } else {
        const errorText = await res.text();
        Alert.alert(t('error'), `${t('failedToUpdateFavorite')}: ${errorText}`);
      }
    } catch (err) {
      Alert.alert(t('error'), t('failedToUpdateFavorite'));
    } finally {
      setUpdatingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>{t('loading')}</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>{error || t('eventNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      { <TouchableOpacity
        onPress={() => {
          if (from === 'search') {
            router.replace('/search');
          } else if (from === 'favorites') {
            router.replace('/favorites');
          }
          else if (from === 'ticketDetails') {
            router.back();
          } 
          else {
            router.replace('/events');
          }
        }}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>}
      <Text style={styles.title}>{t('aboutEvent')}</Text>

      <View style={styles.imageWrapper}>
        {imageLoading && (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={StyleSheet.absoluteFill}
          />
        )}
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.image}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>
        📅{' '}
        {new Date(event.startDate).toLocaleDateString(undefined, {
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
          h -{' '}
          {new Date(event.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          h
        </Text>
        <Text style={styles.info}>
          📍 {t('location')}: {event.location}
        </Text>
        <Text style={styles.info}>
          🏢 {t('organizer')}: {event.organizerName}
        </Text>
        {/* <Text style={styles.info}>👥 {t('attending')}: {event.attendingCount || 0}</Text> */}
        {!event.isFree && event.minPrice != null && event.maxPrice != null && (
          <Text style={styles.info}>
            💸 {t('price')}:{' '}
            {event.minPrice === event.maxPrice
              ? `${event.minPrice} RSD`
              : `${event.minPrice} - ${event.maxPrice} RSD`}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={toggleFavorite}
          activeOpacity={0.7}
          disabled={updatingFavorite}
        >
          <Ionicons
            name={event.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={event.isFavorite ? '#FF2D55' : '#2563EB'}
          />
          <Text
            style={[
              styles.favoriteText,
              { color: event.isFavorite ? '#FF2D55' : '#2563EB' },
            ]}
          >
            {event.isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buyBtn,
            event.isFree && styles.buyBtnDisabled, // primeni stil za onemogućeno dugme ako je besplatno
          ]}
          activeOpacity={event.isFree ? 1 : 0.7} // onemogući "klik" efekt ako je besplatno
          onPress={() =>
            !event.isFree &&
            router.push({
              pathname: './tickets',
              params: { eventId: event.id.toString() },
            })
          }
          disabled={event.isFree} // onemogući dugme ako je besplatno
        >
          <Text style={styles.buyText}>
            {event.isFree ? t('freeEvent') : t('buyTicket')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('eventDescription')}</Text>
      <Text style={styles.description}>{event.description}</Text>

      {event.agenda?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('agenda')}</Text>
          {event.agenda.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>
                {new Date(item.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(item.endTime).toLocaleTimeString([], {
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
          <Text style={styles.sectionTitle}>{t('location')}</Text>
          <MapView
             style={styles.map}
            initialRegion={{
              latitude: coords?.latitude || 44.7866,
              longitude: coords?.longitude || 20.4489,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
  }}
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
              shouldReplaceMapContent={true}
            />
            <Marker coordinate={coords} title={event.title} description={event.location} />
          </MapView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20,marginTop:20 },
  header: { fontSize: 20, fontWeight: '700' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
    marginTop: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#cccccc', // svetlo siva boja za disabled stanje
  },

  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom: 40,
  },
  backButton: {
    padding: 20,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
  },

});
