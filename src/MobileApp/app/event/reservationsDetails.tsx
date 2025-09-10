import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';
import { apiCall } from '../../config';
import { Ionicons } from '@expo/vector-icons';

type Ticket = {
  UserTicketID: number;
  ticketType: string;
};

type ResourceReservation = {
  ReservationID: number;
  ResourceName: string;
  ResourceCategory: string;  // dodato
  ResourceDescription: string; // dodato
  Quantity: number;
  ReservedAt: string;
  UserTicketID: number | null;
  EventTitle: string;
  EventID: number;
  EventDate: string;      // dodato
  EventEndDate: string;   // dodato
  UserTickets: Ticket[];
};


export default function ReservationDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ eventID: string | string[]; from?: string }>();
  const eventID = Array.isArray(params.eventID) ? params.eventID[0] : params.eventID;
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [reservations, setReservations] = useState<ResourceReservation[]>([]);

useEffect(() => {
  const fetchDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await apiCall(`${API_URL}/api/Resource/my-reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Failed to fetch reservations');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const eventReservations = data.filter((r: any) => r.eventID == eventID);

      if (eventReservations.length === 0) {
        setLoading(false);
        return;
      }

      setEventTitle(eventReservations[0].eventTitle);

      // Grupisanje resursa po ResourceName
      const groupedResources: Record<string, ResourceReservation> = {};
      eventReservations.forEach((r: any) => {
        const key = r.resourceName;
        if (!groupedResources[key]) {
          groupedResources[key] = {
            ReservationID: r.reservationID,
            ResourceName: r.resourceName,
            ResourceCategory: r.resourceCategory,
            ResourceDescription: r.resourceDescription,
            Quantity: r.quantity,
            ReservedAt: r.reservedAt,
            UserTicketID: r.userTicketID,
            EventTitle: r.eventTitle,
            EventID: r.eventID,
            EventDate: r.eventDate,
            EventEndDate: r.eventEndDate,
            UserTickets: r.userTickets ?? [],
          };
        } else {
          // Saberi količinu
          groupedResources[key].Quantity += r.quantity;
          // Poslednji datum rezervacije
          if (new Date(r.reservedAt) > new Date(groupedResources[key].ReservedAt)) {
            groupedResources[key].ReservedAt = r.reservedAt;
          }
        }
      });

      setReservations(Object.values(groupedResources));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchDetails();
}, [eventID]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0047FF" />
        <Text style={{ marginTop: 10 }}>{t('loading')}</Text>
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.eventTitle}>{eventTitle}</Text>
        <Text style={styles.noReservationsText}>{t('reservationDetails.noReservations')}</Text>
      </View>
    );
  }

  const userTickets = reservations[0].UserTickets;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
    <View style={{ alignItems: 'center', marginBottom: 15 }}>
<TouchableOpacity
  disabled={userTickets.length === 0}
  onPress={() =>
    router.push({
      pathname: '/event/[id]',
      params: { id: eventID, from: 'reservationDetails' },
    })
  }
>
  <Text style={[styles.eventTitle, userTickets.length === 0 && { color: '#95a5a6' }]}>
    {eventTitle}
  </Text>
</TouchableOpacity>


  {/* Datum od-do */}
  <Text style={styles.eventDate}>
    {new Date(reservations[0].EventDate).toLocaleDateString()} - {new Date(reservations[0].EventEndDate).toLocaleDateString()}
  </Text>
{/* Tipovi karata */}
{userTickets.length > 0 && (
  <View style={{ marginTop: 10, alignItems: 'center' }}>
    <Text style={styles.ticketsInfo}>{t('reservationDetails.youHaveTickets')}:</Text>
    <Text style={styles.ticketText}>
      {Object.entries(
        userTickets.reduce((acc: Record<string, number>, ticket) => {
          const type = ticket.ticketType ?? 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([type, count]) => `${type} (x${count})`)
        .join(', ')}
    </Text>
  </View>
)}


</View>

{/* Lista resursa */}
<ScrollView style={{ marginTop: 10 }}>
  {reservations.map(res => (
    <View key={res.ReservationID} style={styles.resourceCard}>
      <Text style={styles.resourceName}>{res.ResourceName}</Text>
      {/* Tip resursa preveden */}
      <Text style={styles.detailText}>
        {t('reservationDetails.category')}:{' '}
        {t(`reservationDetails.categoryNames.${res.ResourceCategory}`)}
      </Text>
      <Text style={styles.detailText}>
        {t('reservationDetails.description')}: {res.ResourceDescription}
      </Text>
      <Text style={styles.detailText}>
        {t('reservationDetails.quantity')}: {res.Quantity}
      </Text>
      <Text style={styles.detailText}>
        {t('reservationDetails.reservedAt')}: {new Date(res.ReservedAt).toLocaleString()}
      </Text>
    </View>
  ))}
</ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  backButton: { marginBottom: 15 },
  eventTitle: { fontSize: 24, fontWeight: '700', color: '#3478f6', marginBottom: 10, textDecorationLine: 'underline' },
  ticketsInfo: { fontSize: 16, marginBottom: 15, color: '#2c3e50' },
  noReservationsText: { fontSize: 18, textAlign: 'center', marginTop: 50, color: '#95a5a6' },
  resourceCard: { backgroundColor: '#fafafa', borderRadius: 12, padding: 20, marginBottom: 20 },
  resourceName: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  detailText: { fontSize: 16, marginBottom: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ticketCard: {
  backgroundColor: '#e1f0ff',
  borderRadius: 10,
  paddingVertical: 6,
  paddingHorizontal: 12,
  marginTop: 5,
},
ticketText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#0047FF',
},
eventDate: { 
  fontSize: 16, 
  color: '#555', 
  marginBottom: 8 
},

});
