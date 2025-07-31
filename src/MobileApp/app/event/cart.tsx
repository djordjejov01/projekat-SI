import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

type Ticket = {
  id: number;
  name: string;
  price: number;
};

type Resource = {
  id: number;
  name: string;
  price?: number;
};

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { tickets, resources, eventId, eventName, eventLocation } = useLocalSearchParams();

  const [selectedTickets, setSelectedTickets] = useState<{ id: number; quantity: number }[]>([]);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [resourceData, setResourceData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, []);

  useEffect(() => {
    const parsedTickets = tickets ? JSON.parse(tickets as string) : {};
    const parsedResources = resources ? JSON.parse(resources as string) : [];

    const ticketArray = Object.entries(parsedTickets).map(([id, quantity]) => ({
      id: Number(id),
      quantity: Number(quantity),
    }));

    setSelectedTickets(ticketArray);
    setSelectedResources(parsedResources);
  }, [tickets, resources]);

  useEffect(() => {
    if (!eventId) return;

    const fetchTicketsAndResources = async () => {
      try {
        const ticketRes = await fetch(`${API_URL}/Ticket/events/${eventId}/tickets`);
        const ticketsJson = ticketRes.ok ? await ticketRes.json() : [];

        const resourceRes = await fetch(`${API_URL}/Resource/${eventId}/resources`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const resourcesJson = resourceRes.ok ? await resourceRes.json() : [];

        const mappedTickets = ticketsJson.map((t: any) => ({
          id: t.ticketID,
          name: t.typeName,
          price: t.price,
        }));

        const mappedResources = resourcesJson.map((r: any) => ({
          id: r.id,
          name: r.name,
          price: r.price,
        }));

        setTicketData(mappedTickets);
        setResourceData(mappedResources);
      } catch {
        Alert.alert(t('cart.errorTitle'), t('cart.fetchError'));
      }
    };

    fetchTicketsAndResources();
  }, [eventId, token]);

  const getTicketInfo = (id: number) => ticketData.find(t => t.id === id);
  const getResourceInfo = (id: number) => resourceData.find(r => r.id === id);

  const calculateTotal = () => {
    let total = 0;
    selectedTickets.forEach(t => {
      const info = getTicketInfo(t.id);
      if (info) total += info.price * t.quantity;
    });
    selectedResources.forEach(resId => {
      const info = getResourceInfo(resId);
      if (info?.price) total += info.price;
    });
    return total;
  };

  const handlePurchase = async () => {
    Alert.alert(t('cart.confirmTitle'), t('cart.confirmMessage'), [
      { text: t('cart.cancel'), style: 'cancel' },
      {
        text: t('cart.purchase'),
        onPress: async () => {
          setLoading(true);
          try {
            if (!token) {
              Alert.alert(t('cart.errorTitle'), t('cart.loginRequired'));
              setLoading(false);
              return;
            }

            // Pripremi payload za kupovinu ulaznica
            const ticketRequestBody = selectedTickets.map(ticket => ({
              TicketID: ticket.id,
              Quantity: ticket.quantity,
            }));

            // Pošalji zahtev za kupovinu ulaznica
            const purchaseRes = await fetch(`${API_URL}/Ticket/purchase`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(ticketRequestBody),
            });

            if (!purchaseRes.ok) {
              const errorText = await purchaseRes.text();
              console.error('Purchase failed:', errorText);
              throw new Error(`Kupovina ulaznica nije uspela. ${errorText}`);
            }

            // Dobij UserTicketID-ove iz odgovora
            const createdTickets: { UserTicketID?: number; TicketID?: number; userTicketID?: number; ticketID?: number }[] = await purchaseRes.json();

            // Mapiraj TicketID na listu UserTicketID-ova (ako ima više istih tipova)
            const ticketIdToUserTicketIds: { [ticketId: number]: number[] } = {};
            for (const t of createdTickets) {
              const ticketID = t.TicketID ?? t.ticketID;
              const userTicketID = t.UserTicketID ?? t.userTicketID;
              if (typeof ticketID === 'undefined' || typeof userTicketID === 'undefined') {
                console.warn('Nedostaje ticketID ili userTicketID u objektu:', t);
                continue;
              }
              if (!ticketIdToUserTicketIds[ticketID]) ticketIdToUserTicketIds[ticketID] = [];
              ticketIdToUserTicketIds[ticketID].push(userTicketID);
            }

            // Rezerviši svaki izabrani resurs za odgovarajuću kartu (prvi tip ulaznice)
            for (const resId of selectedResources) {
              // Pronađi prvi tip ulaznice (ili možeš proširiti logiku po potrebi)
              const firstSelectedTicket = selectedTickets[0];
              const userTicketIds = ticketIdToUserTicketIds[firstSelectedTicket.id] || [];
              if (userTicketIds.length === 0) continue;

              // Uzmi jedan UserTicketID i ukloni ga iz niza (da ne koristiš isti više puta)
              const userTicketID = userTicketIds.shift();

              await fetch(`${API_URL}/Resource/reserve`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  EventResourceID: resId,
                  Quantity: 1,
                  UserTicketID: userTicketID,
                }),
              });
            }

            // Pripremi ticketTypes za prosleđivanje
            const ticketTypes = selectedTickets.map(t => {
              const info = getTicketInfo(t.id);
              return {
                id: t.id,
                name: info?.name || '',
                quantity: t.quantity,
              };
            });

            setLoading(false);
            Alert.alert(t('cart.successTitle'), t('cart.successMessage'), [
              {
                text: t('cart.ok'),
                onPress: () =>
                  router.replace({
                    pathname: '../event/ticketDetails',
                    params: {
                      ticketIDs: JSON.stringify(Object.values(ticketIdToUserTicketIds).flat()),
                      eventName: eventName ?? '',
                      ticketTypes: JSON.stringify(ticketTypes),
                      purchasedAt: new Date().toISOString(),
                      price: calculateTotal().toString(),
                      location: eventLocation ?? '',
                    },
                  }),
              },
            ]);
          } catch (error: any) {
            setLoading(false);
            Alert.alert(t('cart.errorTitle'), error.message || t('cart.genericError'));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>{t('cart.title')}</Text>

      <Text style={styles.sectionTitle}>{t('cart.tickets')}</Text>
      {selectedTickets.length === 0 && <Text>{t('cart.noTickets')}</Text>}
      {selectedTickets.map(ticket => {
        const info = getTicketInfo(ticket.id);
        if (!info) return null;
        return (
          <View key={`ticket-${ticket.id}`} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {info.name} x {ticket.quantity}
            </Text>
            <Text style={styles.itemPrice}>{info.price * ticket.quantity} RSD</Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>{t('cart.resources')}</Text>
      {selectedResources.length === 0 && <Text>{t('cart.noResources')}</Text>}
      {selectedResources.map(resId => {
        const res = getResourceInfo(resId);
        if (!res) return null;
        return (
          <View key={`res-${resId}`} style={styles.itemRow}>
            <Text style={styles.itemText}>{res.name}</Text>
            <Text style={styles.itemPrice}>{res.price ? `${res.price} RSD` : t('cart.free')}</Text>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>{t('cart.total')}:</Text>
        <Text style={styles.totalText}>{calculateTotal()} RSD</Text>
      </View>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={handlePurchase}
        disabled={loading || selectedTickets.length === 0}
      >
        <Text style={styles.purchaseText}>{loading ? t('cart.purchasing') : t('cart.purchase')}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#0047FF" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    marginTop: 30,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#444',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#0047FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
