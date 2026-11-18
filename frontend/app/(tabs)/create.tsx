import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create on VAYCAY</Text>

      <Text style={styles.subtitle}>
        What would you like to create?
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/create-trip')}
      >
        <Ionicons name="airplane-outline" size={35} color="#2E6650" />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Create a Trip</Text>
          <Text style={styles.description}>
            Plan your next adventure.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/create-post')}
      >
        <Ionicons name="images-outline" size={35} color="#2E6650" />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Create a Post</Text>
          <Text style={styles.description}>
            Share your travel experiences.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="grey" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 25,
    paddingTop: 70,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E6650',
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    marginTop: 10,
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F4',
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  description: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
});
