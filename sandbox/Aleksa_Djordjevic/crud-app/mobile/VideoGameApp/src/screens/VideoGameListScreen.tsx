import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { getAll, deleteGame, VideoGame } from "../services/videoGameService";
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  List: undefined;
  Form: { id?: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

export default function VideoGameListScreen({ navigation }: Props) {
  const [games, setGames] = useState<VideoGame[]>([]);

  const loadGames = () => {
    getAll()
      .then(response => setGames(response.data))
      .catch(() => Alert.alert('Greška', 'Nije moguće učitati igre'));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGames();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id?: number) => {
    if (!id) return;
    Alert.alert('Potvrda', 'Da li ste sigurni da želite da obrišete igru?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => {
          deleteGame(id)
            .then(() => loadGames())
            .catch(() => Alert.alert('Greška', 'Brisanje nije uspelo'));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: VideoGame }) => (
    <View style={styles.gameItem}>
      <Text style={styles.title}>{item.naziv}</Text>
      <Text>{item.opis}</Text>
      <Text>Godina: {item.godina}</Text>
      <View style={styles.buttons}>
        <Button title="Izmeni" onPress={() => navigation.navigate('Form', { id: item.id })} />
        <Button title="Obriši" color="red" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Dodaj novu igru" onPress={() => navigation.navigate('Form',{id:undefined})} />
      <FlatList data={games} keyExtractor={item => item.id?.toString() ?? ''} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  gameItem: { marginBottom: 20, padding: 12, borderWidth: 1, borderRadius: 8, borderColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 6 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
