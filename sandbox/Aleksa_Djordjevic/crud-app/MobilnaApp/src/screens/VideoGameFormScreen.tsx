import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, Alert } from 'react-native';
import { addGame, getById, updateGame } from '../services/videoGameService';
import { VideoGame } from '../types/VideoGame';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export default function VideoGameFormScreen({ route, navigation }: Props) {
  const [videoGame, setVideoGame] = useState<VideoGame>({ naziv: '', opis: '', godina: null });
  const isEditMode = route.params?.id !== undefined;

  useEffect(() => {
    if (isEditMode && route.params?.id) {
      getById(route.params.id)
        .then(response => setVideoGame(response.data))
        .catch(() => Alert.alert('Greška', 'Ne može se učitati igra'));
    }
  }, []);

  const handleSubmit = () => {
    if (!videoGame.naziv || !videoGame.opis || !videoGame.godina) {
      Alert.alert('Popunite sva polja');
      return;
    }

    const action = isEditMode ? updateGame(videoGame) : addGame(videoGame);

    action
      .then(() => navigation.navigate('List'))
      .catch(() => Alert.alert('Greška', 'Operacija nije uspela'));
  };

  return (
    <View style={styles.container}>
      <Text>Naziv:</Text>
      <TextInput style={styles.input} value={videoGame.naziv} onChangeText={text => setVideoGame({ ...videoGame, naziv: text })} />

      <Text>Opis:</Text>
      <TextInput style={styles.input} value={videoGame.opis} onChangeText={text => setVideoGame({ ...videoGame, opis: text })} />

      <Text>Godina:</Text>
      <TextInput
        style={styles.input}
        value={videoGame.godina ? videoGame.godina.toString() : ''}
        onChangeText={text => setVideoGame({ ...videoGame, godina: parseInt(text) || null })}
        keyboardType="numeric"
      />

      <Button title={isEditMode ? 'Izmeni' : 'Dodaj'} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }
});