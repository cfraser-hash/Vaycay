
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/background-image.png')}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.textContainer}>
        <Text style={styles.logo}>VAYCAY</Text>

        <Text style={styles.subtitle}>
          Discover. Plan. Travel.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
  },

  subtitle: {
    fontSize: 17,
    color: '#ffffff',
    marginTop: 10,
  },
});