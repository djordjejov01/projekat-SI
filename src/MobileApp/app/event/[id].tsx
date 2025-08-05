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

type PinCategory = {
  id: number;
  name: string;
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

type EventPin = {
  id: number;
  eventId: number;
  latitude: number;
  longitude: number;
  label: string;
  description: string;
  pinnedAt: string;
  pinCategory: number;
};


export default function EventDetailScreen() {
  const { id, from } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const currentId = typeof id === 'string' ? id : '';

  const [event, setEvent] = useState<Event | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [eventPins, setEventPins] = useState<EventPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [pinCategories, setPinCategories] = useState<PinCategory[]>([]);
  const { loadFavorites } = useFavorites();


  
  
 useEffect(() => {
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/Events/Details?id=${currentId}`, {
        headers,
      });

      if (!response.ok) throw new Error(t('failedToLoadEvent'));

      const data: Event = await response.json();

      const isFreeCalculated =
        (data.minPrice === null || data.minPrice === 0) &&
        (data.maxPrice === null || data.maxPrice === 0);

      setEvent({ ...data, isFree: isFreeCalculated });

      geocodeLocation(data.location);
      fetchEventPins(data.id);

      const fetchCategories = async () => {
        try {
          const response = await fetch(`${API_URL}/api/EventPin/categories`);
          if (!response.ok) throw new Error('Failed to load categories');
          const data: PinCategory[] = await response.json();
          setPinCategories(data);
        } catch (err) {
          console.error('Greška pri učitavanju kategorija:', err);
        }
      };
      fetchCategories();

    } catch (err) {
      console.error(err);
      setError(t('failedToLoadEventDetails'));
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [currentId]);


  
const checkUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert(
        'Niste ulogovani',
        'Da biste nastavili, potrebno je da se prijavite.',
        [
          {
            text: 'Uloguj se',
            onPress: () => router.push('/login'), // prilagodi rutu ako treba
          },
          { text: 'Otkaži', style: 'cancel' },
        ]
      );
      return false;
    }

    const response = await fetch(`${API_URL}/api/MobileUser/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Greška prilikom učitavanja profila');
    }

    const user = await response.json();
    const { firstName, lastName, email, phoneNumber } = user;

    if (!firstName || !lastName || !email || !phoneNumber) {
      Alert.alert(
        'Nalog nije potpun',
        'Da biste nastavili, molimo vas da popunite osnovne podatke o sebi.',
        [
          {
            text: 'Popuni profil',
            onPress: () => router.push('../profile/personal-info'),
          },
        ]
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    Alert.alert('Greška', 'Došlo je do greške prilikom provere profila.');
    return false;
  }
};


const handleBuyTicket = async () => {
  const isProfileComplete = await checkUserProfile();
  if (!isProfileComplete) return;

  router.push({ pathname: './tickets', params: { eventId: event?.id.toString() } })
};


    const fetchEventPins = async (eventId: number) => {
  try {
    const token = await AsyncStorage.getItem('token'); // <-- dodaj ovo

    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/MobileUser/event/${eventId}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Ne mogu da učitam pinove:', errorText);
      return;
    }

    const text = await response.text();
    const data: EventPin[] = JSON.parse(text);
    setEventPins(data);
  } catch (err) {
    console.warn('Greška pri učitavanju pinova:', err);
  }
};


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

      if (!response.ok) return;

      const data = await response.json();
      if (data && data.length > 0) {
        setCoords({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        });
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

      const res = await fetch(`${API_URL}/api/Favorites`, {
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
      <TouchableOpacity
        onPress={() => {
          if (from === 'search') router.replace('/search');
          else if (from === 'favorites') router.replace('/favorites');
          else if (from === 'ticketDetails') router.back();
          else router.replace('/events');
        }}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.naslov}>{t('aboutEvent')}</Text>

      <View style={styles.imageWrapper}>
        {imageLoading && (
          <ActivityIndicator size="large" color="#2563EB" style={StyleSheet.absoluteFill} />
        )}
        <Image
          source={{ uri: `${API_URL}/${event.imageUrl}` }}
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
          🕒 {t('time')}: {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h -{' '}
          {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
        </Text>
        <Text style={styles.info}>📍 {t('location')}: {event.location}</Text>
        <Text style={styles.info}>🏢 {t('organizer')}: {event.organizerName}</Text>
        {!event.isFree && event.minPrice != null && event.maxPrice != null && (
          <Text style={styles.info}>
            💸 {t('Price')}: {event.minPrice === event.maxPrice ? `${event.minPrice} RSD` : `${event.minPrice} - ${event.maxPrice} RSD`}
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
          <Text style={[styles.favoriteText, { color: event.isFavorite ? '#FF2D55' : '#2563EB' }]}>
            {event.isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuyTicket} style={styles.buyButton}>
  <Text style={styles.buyButtonText}>Buy ticket</Text>
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
                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              latitude: coords.latitude,
              longitude: coords.longitude,
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
            <Marker
              coordinate={coords}
              title={event.title}
              description={event.location}
              pinColor="#e61e1eff"
            />
            {eventPins.map((pin) => {
              const category = pinCategories.find((c) => c.id === pin.pinCategory);
              return (
                <Marker
                  key={pin.id}
                  coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                  title={`${pin.label} (${category?.name || 'Nepoznata kategorija'})`}
                  description={pin.description}
                >
                  <Image
                    source={{
                      uri: `${API_URL}/pins/${pin.pinCategory}.png`,
                    }}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
                </Marker>
              );
            })}


          </MapView>

          {/* Legenda */}
          <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize:18, fontWeight: 'bold', marginBottom: 6 }}>📍 {t('Legend') || 'Legenda'}</Text>
          {Array.from(new Set(eventPins.map((pin) => pin.pinCategory))).map((catId) => {
            const category = pinCategories.find((c) => c.id === catId);
            return (
              <View
                key={catId}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
              >
                <Image
                  source={{
                    uri: `${API_URL}/pins/${catId}.png`,
                  }}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 14 }}>{category?.name || 'Nepoznata kategorija'}</Text>
              </View>
            );
          })}
        </View>


        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginBottom:30
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 40,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  naslov:{
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    textAlign:'center'
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#edeff1ff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  info: {
    fontSize: 15,
    marginBottom: 6,
    color: '#374151',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  buyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buyBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 28,
    color: '#111827',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  scheduleItem: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  scheduleTime: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#1f2937',
  },
  scheduleTitle: {
    fontSize: 14,
    color: '#111827',
  },
  scheduleDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: -10,
    paddingTop:30
  },
  backText: {
    fontSize: 16,
    color: '#111827',
  },
  buyButton: {
  backgroundColor: '#007AFF',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: 'center',
},
buyButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});
