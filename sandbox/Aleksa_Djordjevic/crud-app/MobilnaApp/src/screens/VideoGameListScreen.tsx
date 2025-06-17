import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { VideoGame } from '../types/VideoGame';
import { getAllGames, deleteGame } from '../services/videoGameService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

export default function VideoGameListScreen({ navigation }: Props) {
  const [games, setGames] = useState<VideoGame[]>([]);

  const loadGames = () => {
    getAllGames().then(response => setGames(response.data));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadGames);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id?: number) => {
    if (!id) return;
    deleteGame(id)
      .then(loadGames)
      .catch(() => Alert.alert('Greška', 'Brisanje nije uspelo'));
  };

  return (
    <View style={styles.container}>
      <Button title="Dodaj novu igru" onPress={() => navigation.navigate('Form',{})} />
      <FlatList
        data={games}
        keyExtractor={item => item.id?.toString() ?? ''}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.naziv}</Text>
            <Text>{item.opis} ({item.godina})</Text>
            <Button title="Izmeni" onPress={() => navigation.navigate('Form', { id: item.id })} />
            <Button title="Obriši" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, padding: 12, borderWidth: 1, borderRadius: 8 },
  title: { fontWeight: 'bold', fontSize: 16 }
});