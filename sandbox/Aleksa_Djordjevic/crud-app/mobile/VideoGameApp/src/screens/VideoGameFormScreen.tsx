import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addGame, getById, updateGame, VideoGame } from '../services/videoGameService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';

// Tipovi za navigaciju
export type RootStackParamList = {
  List: undefined;
  Form: { id?: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export default function VideoGameFormScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<RootStackParamList, 'Form'>>();
  const { id } = route.params || {};

  const [videoGame, setVideoGame] = useState<VideoGame>({
    naziv: '',
    opis: '',
    godina: null,
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && id) {
      getById(id)
        .then((response) => setVideoGame(response.data))
        .catch(() => Alert.alert('Greška', 'Ne može se učitati igra'));
    }
  }, [id]);

  const handleSave = () => {
    if (!videoGame.naziv || !videoGame.opis || !videoGame.godina) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    const saveAction = isEditMode
      ? updateGame(videoGame)
      : addGame(videoGame);

    saveAction
      .then(() => navigation.navigate('List'))
      .catch(() =>
        Alert.alert('Greška', isEditMode ? 'Izmena nije uspela' : 'Dodavanje nije uspelo')
      );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Naziv</Text>
      <TextInput
        style={styles.input}
        value={videoGame.naziv}
        onChangeText={(text) => setVideoGame({ ...videoGame, naziv: text })}
      />

      <Text style={styles.label}>Opis</Text>
      <TextInput
        style={styles.input}
        value={videoGame.opis}
        onChangeText={(text) => setVideoGame({ ...videoGame, opis: text })}
      />

      <Text style={styles.label}>Godina</Text>
      <TextInput
        style={styles.input}
        value={videoGame.godina !== null ? videoGame.godina.toString() : ''}
        onChangeText={(text) =>
          setVideoGame({ ...videoGame, godina: text ? parseInt(text) : null })
        }
        keyboardType="numeric"
      />

      <Button title={isEditMode ? 'Izmeni' : 'Dodaj'} onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: 'bold', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
