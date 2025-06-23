import { View, Text, StyleSheet } from 'react-native';

export default function GuestScreen() {
  return (
    <View style={styles.container}>
      <Text>Pregled događaja bez profila (Guest Mode)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
});
