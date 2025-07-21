import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { API_URL as BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoriteContext';

const SEARCH_API_URL = `${BASE_URL}/Events/search`;

interface EventType {
  id: number
  title: string;
  startDate: string;
  location: string;
  price: number;
  imageUrl: string;
}

interface LocationType {
  label: string;
  value: string;
}

const SearchScreen = () => {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [isFree, setIsFree] = useState(false);

  const [locations, setLocations] = useState<LocationType[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const clearFilters = () => {
  setSearchQuery('');
  setSelectedLocation(null);
  setStartDate(null);
  setEndDate(null);
  setIsFree(false);
  setSortBy(null);
};

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('name', searchQuery);
      if (selectedLocation) params.append('location', selectedLocation);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (isFree) params.append('isFree', 'true');
      if (sortBy) {
        switch (sortBy) {
          case 'popularity':
            params.append('sortBy', 'popularity');
            params.append('sortOrder', 'desc');
            break;
          case 'priceAsc':
            params.append('sortBy', 'price');
            params.append('sortOrder', 'asc');
            break;
          case 'priceDesc':
            params.append('sortBy', 'price');
            params.append('sortOrder', 'desc');
            break;
          case 'dateAsc':
            params.append('sortBy', 'startDate');
            params.append('sortOrder', 'asc');
            break;
          case 'dateDesc':
            params.append('sortBy', 'startDate');
            params.append('sortOrder', 'desc');
            break;
        }
      }

      const response = await fetch(`${SEARCH_API_URL}?${params.toString()}`);
      const data: EventType[] = await response.json();

      setEvents(data);

      // Lokacije iz eventa, kao label + value
      const uniqueLocs = Array.from(new Set(data.map(e => String(e.location)))).map(loc => ({
        label: loc,
        value: loc,
      }));
      setLocations(uniqueLocs);
    } catch (error) {
      console.error('Fetch error', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLocation, startDate, endDate, isFree, sortBy]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // OVDE je logika za proveru gosta i toggle favorite sa alertom
  const handleToggleFavorite = async (eventID: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
     Alert.alert(
             t('notLoggedIn'),
             t('loginToAddFavorites'),
             [
               { text: t('continueAsGuest') },
               {
                 text: t('logIn'),
                 onPress: () => router.push('/login'),
               },
             ],
             { cancelable: true }
           );
           return;
    }
    await toggleFavorite(eventID);
  };

const renderEventItem = ({ item }: { item: EventType }) => {
  const isFavorite = favorites.includes(item.id);
  const renderEventItem = ({ item }: { item: EventType }) => {
  console.log('Event item:', item);
};

  const date = item.startDate ? new Date(item.startDate) : null;
  const formattedDate = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'No date';

  return (
    <TouchableOpacity
      style={styles.eventItem}
 onPress={() => {
  // console.log('Navigating to event id:', item.id);
  router.push({ pathname: '/event/[id]', params: { id: String(item.id) } });
}}

    >
            <View style={{ position: 'relative' }}>
        {imageLoading[item.id] && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: [{ translateX: -12 }, { translateY: -12 }],
              zIndex: 1,
              width: 24,
              height: 24,
            }}
          />
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.eventImage}
          onLoadStart={() =>
            setImageLoading((prev) => ({ ...prev, [item.id]: true }))
          }
          onLoadEnd={() =>
            setImageLoading((prev) => ({ ...prev, [item.id]: false }))
          }
        />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title || 'No title'}</Text>
        <Text style={styles.eventDate}>{formattedDate}</Text>
        <Text style={styles.eventLocation}>{item.location || 'No location'}</Text>
        <Text style={styles.eventPrice}>{item.price === 0 ? 'Free' : `$${item.price}`}</Text>
      </View>

      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => handleToggleFavorite(item.id)}
      >
        <AntDesign name="heart" size={24} color={isFavorite ? '#FF2D55' : '#ccc'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

  const { t } = useTranslation();

return (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={{ flex: 1 }}
  >
    <View style={styles.container}>
      <Text style={styles.header}>{t('search.header')}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder={t('search.placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <DropDownPicker
        open={locationOpen}
        setOpen={setLocationOpen}
        value={selectedLocation}
        setValue={setSelectedLocation}
        items={locations}
        placeholder={t('search.selectLocation')}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000}
        zIndexInverse={1000}
        multiple={false}
        searchable={true}
      />

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={18} color="black" />
          <Text style={styles.dateButtonText}>
            {startDate ? startDate.toDateString() : t('search.startDate')}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={18} color="black" />
          <Text style={styles.dateButtonText}>
            {endDate ? endDate.toDateString() : t('search.endDate')}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>

      <DropDownPicker
        open={sortOpen}
        setOpen={setSortOpen}
        value={sortBy}
        setValue={setSortBy}
        items={[
          { label: t('search.dateAsc'), value: 'dateAsc' },
          { label: t('search.dateDesc'), value: 'dateDesc' },
          { label: t('search.priceAsc') || 'Price Ascending', value: 'priceAsc' }, // možeš dodati i priceAsc u json
          { label: t('search.priceDesc') || 'Price Descending', value: 'priceDesc' }, // isto za priceDesc
          { label: t('search.popularityDesc'), value: 'popularity' },
        ]}
        placeholder={t('search.sortBy')}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={2000}
        zIndexInverse={2000}
        multiple={false}
      />

      <View style={styles.filterRowBottom}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('search.freeOnly') || 'Free Only'}</Text>
          <Switch value={isFree} onValueChange={setIsFree} />
        </View>

        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>{t('search.reset')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : events.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>{t('search.noResults')}</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={{ paddingBottom: 40 }}
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  </KeyboardAvoidingView>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  
  dropdown: {
    marginBottom: 12,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  header: {
  fontSize: 20,
  fontWeight: '700',
  marginBottom: 15,
  marginTop: 10,
},

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginHorizontal: 5,
  },
  dateButtonText: {
    marginLeft: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
    alignItems: 'center',

  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  eventContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  filterRowBottom: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

clearButton: {
  backgroundColor: '#e74c3c',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
},
clearButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 14,
},

  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  favoriteIcon: {
  justifyContent: 'center',
  paddingHorizontal: 8,
},

  eventDate: {
    color: 'gray',
    marginTop: 4,
  },
  eventLocation: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  eventPrice: {
    marginTop: 6,
    fontWeight: '600',
  },
});
export default SearchScreen;


