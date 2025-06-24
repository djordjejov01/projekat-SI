import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    try {
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const matchedUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (matchedUser) {
        router.replace('/(tabs)');
      } else {
        const exists = users.find((u: any) => u.email === email);
        if (exists) {
          Alert.alert('Login Failed', 'Incorrect password');
        } else {
          Alert.alert('Login Failed', 'Email not found');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SyncUp!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  toggleText: {
    color: '#007AFF',
    fontWeight: '600',
    padding: 6,
  },
  loginButton: {
    backgroundColor: '#0047FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#0047FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupText: {
    color: '#0047FF',
    fontWeight: '600',
    fontSize: 16,
  },
});
