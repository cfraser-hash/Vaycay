
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getFavorites,
  removeFavorite,
  saveFavorite,
} from "../../services/api";
import { getAuthToken } from "../../services/authStorage";

export default function AttractionDetailsScreen() {
  const {
    id,
    name,
    address,
    category,
    distance,
    latitude,
    longitude,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    address: string;
    category: string;
    distance: string;
    latitude: string;
    longitude: string;
  }>();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  // CHECK WHETHER THIS ATTRACTION IS ALREADY SAVED
  useEffect(() => {
    let isActive = true;

    async function checkFavorite() {
      try {
        const token = await getAuthToken();

        if (!token) {
          if (isActive) {
            setFavoriteMessage("Log in to save this attraction.");
          }
          return;
        }

        const favorites = await getFavorites(token);

        const alreadySaved = favorites.some(
          (favorite: { id: string }) => favorite.id === id
        );

        if (isActive) {
          setIsFavorite(alreadySaved);
        }
      } catch (error) {
        console.error("Unable to load favorites:", error);

        if (isActive) {
          setFavoriteMessage("Unable to check saved attractions.");
        }
      } finally {
        if (isActive) {
          setIsLoadingFavorite(false);
        }
      }
    }

    checkFavorite();

    return () => {
      isActive = false;
    };
  }, [id]);

  // SAVE OR REMOVE THIS ATTRACTION
  async function toggleFavorite() {
    try {
      setIsLoadingFavorite(true);
      setFavoriteMessage("");

      const token = await getAuthToken();

      if (!token) {
        setFavoriteMessage("Please log in to save attractions.");
        return;
      }

      if (isFavorite) {
        await removeFavorite(token, id);
        setIsFavorite(false);
        setFavoriteMessage("Removed from your favorites.");
      } else {
        const parsedLatitude = Number(latitude);
        const parsedLongitude = Number(longitude);

        if (
          !Number.isFinite(parsedLatitude) ||
          !Number.isFinite(parsedLongitude)
        ) {
          throw new Error("Attraction coordinates are unavailable.");
        }

        await saveFavorite(token, {
          id,
          name: name || "Unnamed attraction",
          address: address || "",
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          category: category || "Attraction",
          distance: distance ? Number(distance) : null,
        });

        setIsFavorite(true);
        setFavoriteMessage("Added to your favorites!");
      }
    } catch (error) {
      console.error("Favorite update failed:", error);

      setFavoriteMessage(
        error instanceof Error
          ? error.message
          : "Unable to update favorites."
      );
    } finally {
      setIsLoadingFavorite(false);
    }
  }

  function formatDistance(value?: string) {
    if (!value) return "Distance unavailable";

    const meters = Number(value);

    if (Number.isNaN(meters)) return "Distance unavailable";

    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km away`
      : `${Math.round(meters)} m away`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={23} color="#176B58" />
          <Text style={styles.backText}>Back to Discover</Text>
        </TouchableOpacity>

        {/* ATTRACTION HEADER */}
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={42} color="#176B58" />
          </View>

          <Text style={styles.title}>
            {name || "Attraction Details"}
          </Text>

          <Text style={styles.category}>
            {category || "Attraction"}
          </Text>

          {/* FAVORITES BUTTON */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={toggleFavorite}
            disabled={isLoadingFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={21}
              color={isFavorite ? "#FFFFFF" : "#176B58"}
            />

            <Text
              style={[
                styles.favoriteButtonText,
                isFavorite && styles.favoriteButtonTextActive,
              ]}
            >
              {isLoadingFavorite
                ? "Please wait..."
                : isFavorite
                  ? "Saved to Favorites"
                  : "Save to Favorites"}
            </Text>
          </TouchableOpacity>

          {favoriteMessage ? (
            <Text style={styles.favoriteMessage}>
              {favoriteMessage}
            </Text>
          ) : null}
        </View>

        {/* INFORMATION */}
        <Text style={styles.sectionTitle}>
          About this place
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={23}
              color="#176B58"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {address || "Address unavailable"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons
              name="navigate-outline"
              size={23}
              color="#176B58"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {formatDistance(distance)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons
              name="earth-outline"
              size={23}
              color="#176B58"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Coordinates</Text>
              <Text style={styles.infoValue}>
                {latitude && longitude
                  ? `${latitude}, ${longitude}`
                  : "Coordinates unavailable"}
              </Text>
            </View>
          </View>
        </View>

        {/* FUTURE MAP SECTION */}
        <Text style={styles.sectionTitle}>
          Location
        </Text>

        <View style={styles.mapPlaceholder}>
          <Ionicons
            name="map-outline"
            size={40}
            color="#176B58"
          />

          <Text style={styles.mapTitle}>
            Map coming soon
          </Text>

          <Text style={styles.mapDescription}>
            You'll be able to view this attraction on a map
            in a future VAYCAY update.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 25,
  },
  backText: {
    color: "#176B58",
    fontWeight: "600",
    fontSize: 14,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 25,
    marginBottom: 25,
  },
  iconContainer: {
    width: 85,
    height: 85,
    borderRadius: 25,
    backgroundColor: "#EAF3ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#172B26",
    textAlign: "center",
  },
  category: {
    color: "#176B58",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textTransform: "capitalize",
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#EAF3ED",
    borderWidth: 1,
    borderColor: "#176B58",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  favoriteButtonActive: {
    backgroundColor: "#176B58",
  },
  favoriteButtonText: {
    color: "#176B58",
    fontSize: 14,
    fontWeight: "700",
  },
  favoriteButtonTextActive: {
    color: "#FFFFFF",
  },
  favoriteMessage: {
    color: "#52675D",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172B26",
    marginBottom: 13,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E9EEEA",
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    paddingVertical: 10,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    color: "#78837D",
    fontSize: 12,
    marginBottom: 5,
  },
  infoValue: {
    color: "#172B26",
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEF1EF",
  },
  mapPlaceholder: {
    backgroundColor: "#EAF3ED",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },
  mapTitle: {
    color: "#174D40",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },
  mapDescription: {
    color: "#52675D",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
  },
});
