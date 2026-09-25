import { Image } from "expo-image";
import { StyleSheet, Text, View } from 'react-native';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={PlaceholderImage} style={styles.image} />
      </View>
      <Text style={styles.text}>Vaycay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
    imageContainer: {
    flex: 1,
  },
  image: {
    width: 420,
    height: 850,
    borderRadius: 18,
  },
  text: {
    flex: 4,
    fontSize: 100,
    color: 'white',
    fontWeight: 'bold',
  },
});