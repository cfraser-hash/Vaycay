
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const destinations = [
  {
    name: 'Santorini, Greece',
    description: 'Island escapes',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e',
  },
  {
    name: 'Paris, France',
    description: 'City adventures',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  },
  {
    name: 'Bali, Indonesia',
    description: 'Tropical getaways',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  },
];

export default function DiscoverScreen() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>YOUR NEXT ADVENTURE</Text>
          <Text style={styles.title}>Discover</Text>
        </View>

        <Text style={styles.logo}>VAYCAY</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Where do you want to go?"
        placeholderTextColor="#777"
      />

      {/* Intro */}
      <Text style={styles.intro}>
        Find your next favorite place.
      </Text>

      {/* Popular destinations */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Popular Destinations
        </Text>
        <Text style={styles.sectionSubtitle}>
          Explore the world
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {destinations.map((destination) => (
          <Pressable
            key={destination.name}
            style={styles.destinationCard}
            onPress={() => {
              console.log(
                'Selected destination:',
                destination.name
              );
            }}
          >
            <ImageBackground
              source={{ uri: destination.image }}
              style={styles.destinationImage}
              imageStyle={{ borderRadius: 18 }}
            >
              <View style={styles.imageOverlay}>
                <Text style={styles.destinationName}>
                  {destination.name}
                </Text>
                <Text style={styles.destinationDescription}>
                  {destination.description}
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>

      {/* Trip inspiration */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Travel Inspiration
        </Text>
        <Text style={styles.sectionSubtitle}>
          Ideas for your next trip
        </Text>
      </View>

      <View style={styles.inspirationCard}>
        <Text style={styles.inspirationTitle}>
          Weekend Getaways
        </Text>
        <Text style={styles.inspirationText}>
          Discover new cities, relaxing beaches, and
          unforgettable experiences.
        </Text>
      </View>

      <View style={styles.inspirationCard}>
        <Text style={styles.inspirationTitle}>
          Plan Your Dream Trip
        </Text>
        <Text style={styles.inspirationText}>
          Start with your destination, budget, and
          favorite activities.
        </Text>
      </View>

      <Text style={styles.footer}>
        Your journey starts with VAYCAY.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 60,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#66808C',
    fontWeight: '600',
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#234E62',
    marginTop: 5,
  },

  logo: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#285D7A',
  },

  search: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E7EA',
  },

  intro: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 18,
    marginBottom: 30,
  },

  sectionHeader: {
    marginBottom: 16,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#203B49',
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#7A8B93',
    marginTop: 5,
  },

  destinationCard: {
    width: 245,
    marginRight: 15,
    marginBottom: 30,
  },

  destinationImage: {
    height: 220,
    justifyContent: 'flex-end',
  },

  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    padding: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  destinationName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },

  destinationDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 5,
  },

  inspirationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5EAED',
  },

  inspirationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#285D7A',
    marginBottom: 8,
  },

  inspirationText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },

  footer: {
    textAlign: 'center',
    color: '#80919A',
    marginTop: 15,
    marginBottom: 35,
    fontSize: 13,
  },
});