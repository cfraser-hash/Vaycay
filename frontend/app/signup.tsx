import { Link } from 'expo-router';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function Signup() {
  return (
    <View style={styles.container}>

      {/* VAYCAY Logo / Title */}
      <Text style={styles.logo}>Vaycay</Text>

      <Text style={styles.title}>Create Your Account</Text>

      <Text style={styles.subtitle}>
        Start planning your next adventure.
      </Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
      />

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

      {/* Confirm Password */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      {/* Sign Up Button */}
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      {/* Login */}
      <View style={styles.loginContainer}>
        <Text style={styles.accountText}>
          Already have an account?{' '}
        </Text>

        <Link href="./login" style={styles.loginLink}>
          Log In
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
    marginBottom: 25,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 25,
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
    marginTop: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  accountText: {
    color: '#6B7280',
    fontSize: 15,
  },

  loginLink: {
    color: '#285D7A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});