// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useTranslation } from 'react-i18next';

// type Reservation = {
//   EventID: number;
//   EventTitle: string;
//   EventDate: string;
//   EventEndDate: string;
//   EventLocation: string;
//   IsEventFree: boolean;
//   Resources: {
//     Name: string;
//     Quantity: number;
//   }[];
// };

// // Mock podaci
// const mockData: Reservation[] = [
//   {
//     EventID: 1,
//     EventTitle: 'React Workshop',
//     EventDate: '2025-09-05T10:00:00',
//     EventEndDate: '2025-09-05T14:00:00',
//     EventLocation: 'PMF',
//     IsEventFree: true,
//     Resources: [
//       { Name: 'Laptop', Quantity: 1 },
//       { Name: 'Notebook', Quantity: 2 },
//     ],
//   },
//   {
//     EventID: 2,
//     EventTitle: 'Angular Meetup',
//     EventDate: '2025-09-06T12:00:00',
//     EventEndDate: '2025-09-06T16:00:00',
//     EventLocation: 'PMF',
//     IsEventFree: false,
//     Resources: [
//       { Name: 'Tablet', Quantity: 1 },
//     ],
//   },
// ];

// export default function MyReservations() {
//   const { t } = useTranslation();
//   const router = useRouter();
//   const { from } = useLocalSearchParams();
//   const [reservations, setReservations] = useState<Reservation[]>([]);
//   const [resourcesCount, setResourcesCount] = useState(0);

//   useEffect(() => {
//     // Umesto fetch-a, koristi mock
//     const data = mockData;
//     setReservations(data);

//     // Broj jedinstvenih resursa
//     const uniqueResources = new Set<string>();
//     data.forEach(event => {
//       event.Resources.forEach(r => uniqueResources.add(r.Name));
//     });
//     setResourcesCount(uniqueResources.size);
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* Header sa back button */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity
//           onPress={() => {
//             if (from === 'profile') router.replace('/profile');
//             else router.back();
//           }}
//           style={styles.backButton}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="arrow-back" size={28} color="black" />
//         </TouchableOpacity>
//         <Text style={styles.header}>{t('myReservations.title') || 'My Reservations'}</Text>
//       </View>


//       <ScrollView style={styles.scroll}>
//         {reservations.map((event, index) => {
//           const resourceNames = event.Resources.map(r => r.Name).join(', ');
//           const totalQuantity = event.Resources.reduce((sum, r) => sum + r.Quantity, 0);

//           return (
//             <TouchableOpacity
//               key={index}
//               style={styles.eventCard}
//               activeOpacity={0.8}
//               onPress={() => router.push({ pathname: `../event/reservationDetails`, params: { eventID: event.EventID } })}
//             >
//               <Text style={styles.eventTitle}>{event.EventTitle}</Text>
//               <Text style={styles.resourceText}>Resources: {resourceNames}</Text>
//               <Text style={styles.quantityText}>Quantity: {totalQuantity}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   scroll: { paddingHorizontal: 16, paddingBottom: 24 },
//   headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 35, paddingBottom: 30 },
//   backButton: { marginRight: 12, padding: 6, borderRadius: 8 },
//   header: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', flex: 1, textAlign: 'center', marginRight: 40 },

//   statBox: {
//     backgroundColor: '#f0f0ff',
//     padding: 20,
//     marginHorizontal: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.12,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   statNumber: { fontSize: 28, fontWeight: '800' },
//   statLabel: { fontSize: 16, marginTop: 4 },

//   eventCard: {
//     backgroundColor: '#fefefe',
//     padding: 20,
//     borderRadius: 14,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.12,
//     shadowRadius: 6,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#e1e4e8',
//   },
//   eventTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#3478f6' },
//   resourceText: { fontSize: 16, marginBottom: 4 },
//   quantityText: { fontSize: 16, fontWeight: '600' },
// });





import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../config';
import { apiCall } from '../../config';
type Reservation = {
  EventID: number;
  EventTitle: string;
  EventDate: string;
  EventEndDate: string;
  EventLocation: string;
  IsEventFree: boolean;
  Resources: {
    Name: string;
    Quantity: number;
  }[];
};

export default function MyReservations() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await apiCall(`${API_URL}/api/Resource/my-reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn('Failed to fetch reservations');
          return;
        }

        const data = await res.json();

        // Grupisanje po eventu
        const grouped: Record<number, Reservation> = {};
        data.forEach((r: any) => {
          if (!grouped[r.EventID]) {
            grouped[r.EventID] = {
              EventID: r.EventID,
              EventTitle: r.EventTitle,
              EventDate: r.EventDate,
              EventEndDate: r.EventEndDate,
              EventLocation: r.EventLocation,
              IsEventFree: r.IsEventFree,
              Resources: [],
            };
          }
          grouped[r.EventID].Resources.push({
            Name: r.ResourceName,
            Quantity: r.Quantity,
          });
        });

        setReservations(Object.values(grouped));

        // Broj jedinstvenih resursa
        const uniqueResources = new Set<string>();
        data.forEach((r: any) => uniqueResources.add(r.ResourceName));
        setResourcesCount(uniqueResources.size);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3478f6" />
        <Text style={{ marginTop: 10 }}>{t('loading') || 'Loading...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header sa back button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (from === 'profile') router.replace('/profile');
            else router.back();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.header}>{t('myReservations.title') || 'My Reservations'}</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {reservations.map((event, index) => {
          const resourceNames = event.Resources.map(r => r.Name).join(', ');
          const totalQuantity = event.Resources.reduce((sum, r) => sum + r.Quantity, 0);

          return (
            <TouchableOpacity
              key={index}
              style={styles.eventCard}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: `../event/reservationDetails`, params: { eventID: event.EventID } })}
            >
              <Text style={styles.eventTitle}>{event.EventTitle}</Text>
              <Text style={styles.resourceText}>Resources: {resourceNames}</Text>
              <Text style={styles.quantityText}>Quantity: {totalQuantity}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 35, paddingBottom: 30 },
  backButton: { marginRight: 12, padding: 6, borderRadius: 8 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', flex: 1, textAlign: 'center', marginRight: 40 },

  statBox: {
    backgroundColor: '#f0f0ff',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 16, marginTop: 4 },

  eventCard: {
    backgroundColor: '#fefefe',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  eventTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#3478f6' },
  resourceText: { fontSize: 16, marginBottom: 4 },
  quantityText: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
