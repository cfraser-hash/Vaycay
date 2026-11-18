import { StyleSheet, Text, View } from 'react-native';

export default function CreatePostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a Post</Text>
      <Text>Share your next travel experience!</Text>
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
