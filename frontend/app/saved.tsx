
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    getFavorites,
    removeFavorite,
} from '../services/api';

import { getAuthToken } from '../services/authStorage';

type SavedAttraction = {
  id: string;
  name: string;
  address?: string;
  category?: string;
  distance?: number | null;
};

export default function SavedScreen() {
  const [attractions, setAttractions] = useState<SavedAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Load saved attractions whenever this screen opens
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadFavorites() {
        try {
          setLoading(true);

          const token = await getAuthToken();

          if (!token) {
            Alert.alert('Login required', 'Please log in to view saved items.');
            return;
          }

          const favorites = await getFavorites(token);

          if (active) {
            setAttractions(favorites);
          }
        } catch (error) {
          console.error('Unable to load saved attractions:', error);

          if (active) {
            Alert.alert(
              'Unable to load saved items',
              error instanceof Error
                ? error.message
                : 'Please try again.'
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadFavorites();

      return () => {
        active = false;
      };
    }, [])
  );

  // Remove an attraction from saved items
  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert('Login required', 'Please log in again.');
        return;
      }

      await removeFavorite(token, id);

      setAttractions((current) =>
        current.filter((attraction) => attraction.id !== id)
      );
    } catch (error) {
      Alert.alert(
        'Unable to remove attraction',
        error instanceof Error
          ? error.message
          : 'Please try again.'
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Saved</Text>

        <Text style={styles.subtitle}>
          Your favorite places and future adventures
        </Text>
      </View>

      {/* SAVED ATTRACTIONS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Saved Attractions</Text>
          <Text style={styles.sectionSubtitle}>
            Places you want to explore
          </Text>
        </View>

        <Text style={styles.count}>{attractions.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#176B58"
          style={styles.loader}
        />
      ) : attractions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>No saved attractions yet</Text>
          <Text style={styles.emptyText}>
            Explore destinations and save places you'd like to visit.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.actionButtonText}>Explore Attractions</Text>
          </TouchableOpacity>
        </View>
      ) : (
        attractions.map((attraction) => (
          <View key={attraction.id} style={styles.attractionCard}>
            <View style={styles.attractionInfo}>
              <Text style={styles.attractionName}>
                {attraction.name}
              </Text>

              {!!attraction.address && (
                <Text style={styles.address}>
                  {attraction.address}
                </Text>
              )}

              {!!attraction.category && (
                <Text style={styles.category}>
                  {attraction.category}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(attraction.id)}
              disabled={removingId === attraction.id}
            >
              <Text style={styles.removeText}>
                {removingId === attraction.id ? 'Removing...' : 'Remove'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* SAVED TRIPS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Saved Trips</Text>
          <Text style={styles.sectionSubtitle}>
            Your planned adventures
          </Text>
        </View>

        <Text style={styles.count}>0</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>✈</Text>
        <Text style={styles.emptyTitle}>No saved trips yet</Text>
        <Text style={styles.emptyText}>
          Your trips will appear here once trip creation and saving
          are available in VAYCAY.
        </Text>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 30,
  },

  backButton: {
    color: '#176B58',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#172B26',
  },

  subtitle: {
    fontSize: 14,
    color: '#718079',
    marginTop: 7,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#172B26',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#718079',
    marginTop: 4,
  },

  count: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#176B58',
    backgroundColor: '#E3EFE8',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  loader: {
    marginVertical: 45,
  },

  attractionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 17,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEEA',
  },

  attractionInfo: {
    flex: 1,
    paddingRight: 10,
  },

  attractionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B26',
  },

  address: {
    fontSize: 13,
    color: '#718079',
    marginTop: 5,
  },

  category: {
    fontSize: 12,
    color: '#176B58',
    marginTop: 7,
    textTransform: 'capitalize',
  },

  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: '#FCEDEC',
  },

  removeText: {
    color: '#B34B45',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#EEF3F0',
    borderRadius: 18,
    padding: 28,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E1EAE4',
  },

  emptyIcon: {
    fontSize: 36,
    color: '#176B58',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172B26',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#718079',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  actionButton: {
    backgroundColor: '#176B58',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginTop: 18,
  },

  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  bottomSpace: {
    height: 90,
  },
});
