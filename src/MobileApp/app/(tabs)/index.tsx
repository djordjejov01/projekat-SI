import { Link } from 'expo-router';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/SyncUpLogo.png')} style={styles.icon} />
      <Text style={styles.subtitle}>Discover the World at Your Fingertips</Text>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login / Sign up</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/guest" asChild>
        <TouchableOpacity>
          <Text style={styles.guestText}>Guest mode</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  icon: {
    width: 250, height: 250, marginBottom: 20,
  },
  title: {
    fontSize: 32, fontWeight: 'bold', letterSpacing: 2,
  },

  subtitle: {
  fontSize: 18,
  textAlign: 'center',
  color: '#555',
  fontWeight: '500',
  marginVertical: 20,
  fontStyle: 'italic',
  lineHeight: 26,
  maxWidth: 280,
},

  button: {
    backgroundColor: '#7069E1', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25,
    marginTop: 50, marginBottom: 10,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold',
  },
  guestText: {
    color: '#333', textDecorationLine: 'underline', marginTop: 10,
  },
});
