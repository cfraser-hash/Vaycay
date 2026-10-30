import { Link } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Login() {
  return (
    <View style={styles.container}>

      {/* VAYCAY Logo / Title */}
      <Text style={styles.logo}>Vaycay</Text>

      <Text style={styles.title}>Welcome Back!</Text>

      <Text style={styles.subtitle}>
        Log in to continue planning your next adventure.
      </Text>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      {/* Login Button */}
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      {/* Sign Up */}
      <View style={styles.signupContainer}>
        <Text style={styles.accountText}>
          Don't have an account?{' '}
        </Text>

        <Link href="/signup" style={styles.signupLink}>
          Sign Up
        </Link>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#ffffff',
  },

  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#285D7A',
    textAlign: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 30,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
  },

  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#285D7A',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  accountText: {
    color: '#6B7280',
    fontSize: 15,
  },

  signupLink: {
    color: '#285D7A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});