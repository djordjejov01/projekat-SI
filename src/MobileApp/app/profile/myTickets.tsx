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
import { useRouter } from 'expo-router';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

type PurchasedTicket = {
  ticketID: number;
  purchasedAt: string;
  ticketType: string;
  eventName: string;
  price: number;
  eventID: number; 
  userTicketID: number;
  eventImage?: string;
};

type GroupedTicket = {
  ticketType: string;
  eventName: string;
  price: number;
  quantity: number;
  eventID: number; 
  purchasedAt: string;
  ticketIDs: number[];
};

export default function ProfileTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/ticket/tickets/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: PurchasedTicket[] = await res.json();

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
                purchasedAt: ticket.purchasedAt,
                ticketIDs: [ticket.userTicketID],
              };
            } else {
              grouped[key].quantity += 1;
              grouped[key].ticketIDs.push(ticket.userTicketID);
            }
          });

          setGroupedTickets(Object.values(grouped));
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
        router.push({
          pathname: '../event/ticketDetails',
          params: {
            ticketIDs: JSON.stringify(item.ticketIDs),
            eventName: item.eventName,
            ticketType: item.ticketType,
            eventID: item.eventID,
            purchasedAt: item.purchasedAt,
            price: item.price.toString(),
          },
        });
      }}
    >
      <Text style={styles.title}>{item.eventName}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('profileTickets.ticketType')}:</Text>
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
          {new Date(item.purchasedAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7069E1" />
      </View>
    );
  }

  if (groupedTickets.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t('profileTickets.noTickets')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header sa strelicom za povratak */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color='black' />
        </TouchableOpacity>
        <Text style={styles.header}>{t('profileTickets.title')}</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 8,
    // Ako želiš možeš dodati pozadinsku boju na dugme:
    // backgroundColor: '#eee',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // da naslov ne bi lepio strelicu sa desne strane
  },
  ticketItem: {
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#34495e',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#7f8c8d',
    width: 110,
  },
  value: {
    fontWeight: '400',
    color: '#34495e',
    flexShrink: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
