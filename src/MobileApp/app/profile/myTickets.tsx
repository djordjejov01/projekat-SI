import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiCall } from '../../config';

type PurchasedTicket = {
  ticketID: number;
  purchasedAt: string;
  ticketType: string;
  eventName: string;
  price: number;
  eventID: number; 
  userTicketID: number;
  validationToken: string;
  eventImage?: string;
};

type GroupedTicket = {
  ticketType: string;
  eventName: string;
  price: number;
  quantity: number;
  eventID: number; 
  purchasedAt: string[];
  ticketIDs: number[];
};

export default function ProfileTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTicket[]>([]);
  const [ticketsData, setTicketsData] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiCall(`${API_URL}/api/ticket/tickets/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: PurchasedTicket[] = await res.json();
          setTicketsData(data);

          const grouped: { [key: string]: GroupedTicket } = {};
          data.forEach((ticket) => {
            const key = `${ticket.eventName}_${ticket.ticketType}`;
            if (!grouped[key]) {
              grouped[key] = {
                ticketType: ticket.ticketType,
                eventName: ticket.eventName,
                price: ticket.price,
                quantity: 1,
                eventID: ticket.eventID ?? 0,
                purchasedAt: [ticket.purchasedAt],
                ticketIDs: [ticket.userTicketID],
              };
            } else {
              grouped[key].quantity += 1;
              grouped[key].ticketIDs.push(ticket.userTicketID);
              grouped[key].purchasedAt.push(ticket.purchasedAt);
            }
          });

          const groupedArray = Object.values(grouped);
          groupedArray.sort(
              (a, b) => new Date(b.purchasedAt[b.purchasedAt.length - 1]).getTime()
                      - new Date(a.purchasedAt[a.purchasedAt.length - 1]).getTime()
            );

          setGroupedTickets(groupedArray);

        } else {
          console.warn('Failed to fetch tickets');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const renderItem = ({ item }: { item: GroupedTicket }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      activeOpacity={0.7}
      onPress={() => {
        const ticketTokens: string[] = item.ticketIDs.map(id => {
          const original = ticketsData.find(t => t.userTicketID === id);
          return original?.validationToken || '';
        });

        router.push({
          pathname: '../event/ticketDetails',
          params: {
            ticketIDs: JSON.stringify(item.ticketIDs),
            validationTokens: JSON.stringify(ticketTokens),
            eventName: item.eventName,
            ticketType: item.ticketType,
            eventID: item.eventID,
            purchasedAt: JSON.stringify(item.purchasedAt),
            price: item.price.toString(),
            from: 'myTickets', 
          },
        });
      }}
    >
      <Text style={styles.title}>{item.eventName}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('profileTickets.ticketType') || 'Ticket Type'}:</Text>
        <Text style={styles.value}>{item.ticketType}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('profileTickets.quantity')}:</Text>
        <Text style={styles.value}>{item.quantity}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('profileTickets.price')}:</Text>
        <Text style={styles.value}>{item.price} RSD</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('profileTickets.purchasedOn')}:</Text>
        <Text style={styles.value}>
          {new Date(item.purchasedAt[item.purchasedAt.length - 1]).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (from === 'profile') router.replace('/profile');
            else router.back();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color='black' />
        </TouchableOpacity>
        <Text style={styles.header}>{t('profileTickets.title') || 'My Tickets'}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7069E1" />
        </View>
      ) : (
        groupedTickets.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('profileTickets.noTickets')}</Text>
          </View>
        ) : (
          <FlatList
            data={groupedTickets}
            keyExtractor={(item, index) =>
              item.ticketIDs.length > 0
                ? item.ticketIDs.join('-')
                : `${item.eventName}-${item.ticketType}-${index}`
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 35, paddingBottom: 12 },
  backButton: { marginRight: 12, padding: 6, borderRadius: 8 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', flex: 1, textAlign: 'center', marginRight: 40 },
  ticketItem: { backgroundColor: '#fefefe', padding: 20, borderRadius: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: '#e1e4e8' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#34495e' },
  row: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  label: { fontWeight: '600', color: '#7f8c8d', width: 110 },
  value: { fontWeight: '400', color: '#34495e', flexShrink: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  emptyText: { fontSize: 18, color: '#95a5a6', textAlign: 'center' },
});
