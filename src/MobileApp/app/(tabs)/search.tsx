import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoriteContext';
import { useTranslation } from 'react-i18next';

interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: string;
  attendingCount?: number;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const SearchScreen = () => {
  const { t } = useTranslation();
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOption, setSortOption] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://192.168.188.32:5216/api/events');
        const data: EventItem[] = await response.json();
        setAllEvents(data);
        const uniqueLocations = Array.from(new Set(data.map((e) => e.location).filter(Boolean)));
        setAvailableLocations(uniqueLocations);
      } catch (error) {
        console.error('Error loading events', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [query, selectedLocation, startDate, endDate, sortOption]);

  const applyFilters = () => {
    let result = [...allEvents];
    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter((e) => `${e.title} ${e.description}`.toLowerCase().includes(lower));
    }
    if (selectedLocation) {
      result = result.filter((e) => e.location?.toLowerCase() === selectedLocation.toLowerCase());
    }
    if (startDate) {
      const start = startDate.setHours(0, 0, 0, 0);
      if (endDate) {
        const end = endDate.setHours(23, 59, 59, 999);
        result = result.filter((e) => {
          const eventDate = new Date(e.startDate).getTime();
          return eventDate >= start && eventDate <= end;
        });
      } else {
        result = result.filter((e) => new Date(e.startDate).getTime() >= start);
      }
    }
    if (!startDate && endDate) {
      const end = endDate.setHours(23, 59, 59, 999);
      result = result.filter((e) => new Date(e.startDate).getTime() <= end);
    }
    if (sortOption === 'date_desc') {
      result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else if (sortOption === 'date_asc') {
      result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sortOption === 'popular_desc') {
      result.sort((a, b) => (b.attendingCount || 0) - (a.attendingCount || 0));
    }
    setFilteredEvents(result);

    setNoResults(
      result.length === 0 &&
      (Boolean(query) || Boolean(selectedLocation) || Boolean(startDate) || Boolean(endDate))
    );
  };
  const handleToggleFavorite = async (eventId: number) => {
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
  await toggleFavorite(eventId);
};


  const clearAll = () => {
    setQuery('');
    setSelectedLocation('');
    setStartDate(null);
    setEndDate(null);
    setSortOption('');
  };

  const removeFilter = (filter: 'location' | 'startDate' | 'endDate' | 'sort') => {
    if (filter === 'location') setSelectedLocation('');
    if (filter === 'startDate') setStartDate(null);
    if (filter === 'endDate') setEndDate(null);
    if (filter === 'sort') setSortOption('');
  };

  const sortLabel = () => {
    switch (sortOption) {
      case 'date_asc': return t('search.dateAsc');
      case 'date_desc': return t('search.dateDesc');
      case 'popular_desc': return t('search.popularityDesc');
      default: return t('search.sortBy');
    }
  };

  const renderItem = ({ item }: { item: EventItem }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '../event/[id]', params: { id: item.id } })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.info}>📍 {item.location}</Text>
        <Text style={styles.info}>🕒 {formatDate(new Date(item.startDate))}</Text>
        <View style={styles.row}>
          <Text style={styles.attending}>{t('search.attending', { count: item.attendingCount || 0 })}</Text>
          <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
            <AntDesign name="heart" size={20} color={isFavorite ? '#FF2D55' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('search.header')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('search.placeholder')}
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateBtn}>
          <Ionicons name="calendar-outline" size={18} color="#555" style={styles.calendarIcon} />
          <Text style={styles.dateBtnText}>{startDate ? formatDate(startDate) : t('search.startDate')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateBtn}>
          <Ionicons name="calendar-outline" size={18} color="#555" style={styles.calendarIcon} />
          <Text style={styles.dateBtnText}>{endDate ? formatDate(endDate) : t('search.endDate')}</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <View style={styles.pickerRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={setSelectedLocation}
            style={styles.picker}
            dropdownIconColor="#000"
          >
            <Picker.Item label={t('search.selectLocation')} value="" enabled={false} />
            {availableLocations.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} />
            ))}
          </Picker>
          {selectedLocation && (
            <TouchableOpacity onPress={() => removeFilter('location')} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={22} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.pickerWrapper, { flex: 0.8 }]}>
          <Picker
            selectedValue={sortOption}
            onValueChange={setSortOption}
            style={styles.picker}
            dropdownIconColor="#000"
          >
            <Picker.Item label={sortLabel()} value="" enabled={false} />
            <Picker.Item label={t('search.dateAsc')} value="date_asc" />
            <Picker.Item label={t('search.dateDesc')} value="date_desc" />
            <Picker.Item label={t('search.popularityDesc')} value="popular_desc" />
          </Picker>
          {sortOption && (
            <TouchableOpacity onPress={() => removeFilter('sort')} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={22} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {(query || selectedLocation || startDate || endDate || sortOption) && (
        <TouchableOpacity onPress={clearAll} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>{t('search.reset')}</Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#0000ff" />
      ) : noResults ? (
        <Text style={styles.noResults}>{t('search.noResults')}</Text>
      ) : (
        <FlatList
          data={filteredEvents.length > 0 ? filteredEvents : allEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ gap: 16, paddingBottom: 80 }}
        />
      )}
    </View>
  );
};

export default SearchScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 , marginTop:10},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 52,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dateBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    flexDirection: 'row'
  },
  dateBtnText: {
    fontSize: 13,
    color: '#333',
  },
  calendarIcon: {
  marginRight: 6,
 },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  pickerWrapper: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    width: '100%',
    color: '#000',
  },
  clearFilterBtn: {
    position: 'absolute',
    right: 8,
    top: 12,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  resetBtn: {
    backgroundColor: '#FF2D55',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noResults: { textAlign: 'center', color: 'gray', marginTop: 30 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fafafa',
  },
  image: { width: '100%', height: 140, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  info: { fontSize: 13, color: '#444', marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
