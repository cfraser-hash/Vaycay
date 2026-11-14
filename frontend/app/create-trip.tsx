import { StyleSheet, Text, View } from 'react-native';

export default function CreateTripScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a Trip</Text>
      <Text>Start planning your next adventure!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E6650',
  },
});
