import React, { useState } from 'react';
import { Link } from 'expo-router';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoOptIn, setPromoOptIn] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pw: string) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pw)
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Password must meet all the listed requirements');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'You must accept the Privacy Policy and Terms of Use');
      return;
    }

    try {

      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const emailExists = users.some((user: any) => user.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        Alert.alert('Error', 'Email is already registered');
        return;
      }

      const newUser = {
        fullName,
        email,
        password,
        promoOptIn,
        acceptedTerms,
      };

      users.push(newUser);

      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.log('Error saving user:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="John Doe"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="john.doe@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.requirementsTitle}>Password must:</Text>
      <View style={styles.requirements}>
        <Text style={styles.reqItem}>• At least 8 characters</Text>
        <Text style={styles.reqItem}>• Uppercase and lowercase letters</Text>
        <Text style={styles.reqItem}>• At least one number</Text>
        <Text style={styles.reqItem}>• One special character</Text>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Text style={styles.toggleText}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch value={promoOptIn} onValueChange={setPromoOptIn} />
        <Text style={styles.checkboxText}>I want to receive offers and discounts.</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch value={acceptedTerms} onValueChange={setAcceptedTerms} />
        <Text style={styles.checkboxText}>
          I accept the <Text style={styles.link}>Privacy Policy</Text> and{' '}
          <Text style={styles.link}>Terms of Use</Text>.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center' }}>
        <Text style={styles.loginLink}>
          Already have an account?{' '}
          <Link href="/login">
            <Text style={styles.link}>Log In</Text>
          </Link>
        </Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/users')}>
  <Text>Show All Users</Text>
</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
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
  requirementsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  requirements: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  reqItem: {
    fontSize: 13,
    marginBottom: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    textAlign: 'center',
    paddingTop: 30,
    color: '#555',
    fontSize: 14,
  },
});
