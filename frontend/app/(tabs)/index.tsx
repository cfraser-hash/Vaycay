import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  categories,
  destinations,
} from "../../data/destinations";

import {
  getFavorites,
  getNearbyAttractions,
  removeFavorite,
  saveFavorite,
  searchDestinationSuggestions,
  type DestinationSuggestion,
  type NearbyPlace,
} from "../../services/api";

import { getAuthToken } from "../../services/authStorage";

const nearbyCategories = [
  { label: "Attractions", value: "attractions" },
  { label: "Museums", value: "museums" },
  { label: "Beaches", value: "beaches" },
  { label: "Parks", value: "parks" },
  { label: "Culture", value: "culture" },
] as const;

type NearbyCategory = (typeof nearbyCategories)[number]["value"];

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Geoapify destination search
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Geoapify nearby places
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyCategory, setNearbyCategory] =
    useState<NearbyCategory>("attractions");
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  const nearbyRequestId = useRef(0);

  // Search Geoapify as the user types
  useEffect(() => {
    if (selectedDestination || search.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError("");
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError("");

        const results = await searchDestinationSuggestions(search.trim());

        if (active) {
          setSuggestions(results);
        }
      } catch (error) {
        if (active) {
          setSearchError(
            error instanceof Error
              ? error.message
              : "Unable to search destinations."
          );
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedDestination]);

  // Filter original VAYCAY destination catalog
  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (destinations ?? []).filter((destination) => {
      const matchesSearch =
        destination.name.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        destination.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    );
  }

  function openDestination(id: string) {
    router.push({
      pathname: "/attraction/[id]",
      params: { id },
    });
  }

  // SAVE OR REMOVE AN ATTRACTION
  async function toggleFavorite(place: NearbyPlace) {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please log in to save attractions."
        );
        return;
      }

      const isSaved = favoriteIds.includes(place.id);

      if (isSaved) {
        await removeFavorite(token, place.id);

        setFavoriteIds((current) =>
          current.filter((id) => id !== place.id)
        );
      } else {
        await saveFavorite(token, {
          id: place.id,
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          category: place.categories?.[0] || nearbyCategory,
          distance: place.distance,
        });

        setFavoriteIds((current) => [...current, place.id]);
      }
    } catch (error) {
      console.error("Unable to update favorite:", error);

      Alert.alert(
        "Something went wrong",
        "Unable to update your saved attractions. Please try again."
      );
    }
  }

  // Load nearby places for selected destination
  async function loadNearbyPlaces(
    destination: DestinationSuggestion,
    category: NearbyCategory
  ) {
    const requestId = ++nearbyRequestId.current;

    try {
      setIsLoadingNearby(true);
      setNearbyError("");
      setNearbyPlaces([]);

      const results = await getNearbyAttractions(
        destination.latitude,
        destination.longitude,
        category
      );

      if (requestId === nearbyRequestId.current) {
        setNearbyPlaces(results);
      }
    } catch (error) {
      if (requestId === nearbyRequestId.current) {
        setNearbyError(
          error instanceof Error
            ? error.message
            : "Unable to find nearby places."
        );
      }
    } finally {
      if (requestId === nearbyRequestId.current) {
        setIsLoadingNearby(false);
      }
    }
  }

  // LOAD SAVED ATTRACTIONS FROM DATABASE
  useEffect(() => {
    async function loadFavorites() {
      try {
        const token = await getAuthToken();

        if (!token) return;

        const favorites = await getFavorites(token);

        setFavoriteIds(
          favorites.map((favorite: { id: string }) => favorite.id)
        );
      } catch (error) {
        console.error("Unable to load saved attractions:", error);
      }
    }

    loadFavorites();
  }, []);

  // Select a city or country from Geoapify
  function selectDestination(destination: DestinationSuggestion) {
    setSelectedDestination(destination);

    setSearch(
      destination.formatted ||
        `${destination.name}, ${destination.country}`
    );

    setSuggestions([]);
    setNearbyCategory("attractions");

    loadNearbyPlaces(destination, "attractions");
  }

  // Change nearby attraction category
  function changeNearbyCategory(category: NearbyCategory) {
    if (!selectedDestination) return;

    setNearbyCategory(category);
    loadNearbyPlaces(selectedDestination, category);
  }

  // Clear destination search
  function clearSearch() {
    nearbyRequestId.current += 1;

    setSearch("");
    setSuggestions([]);
    setSelectedDestination(null);
    setNearbyPlaces([]);
    setNearbyError("");
    setSearchError("");
    setIsLoadingNearby(false);
    setNearbyCategory("attractions");
  }

  function formatDistance(distance: number | null) {
    if (distance === null || distance === undefined) {
      return "";
    }

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km away`;
    }

    return `${Math.round(distance)} m away`;
  }

  const showPopularDestinations =
    search.trim().length < 2 && !selectedDestination;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR NEXT ADVENTURE</Text>
            <Text style={styles.title}>Discover</Text>
            <Text style={styles.subtitle}>
              Find a place worth exploring.
            </Text>
          </View>

          <Ionicons
            name="compass-outline"
            size={38}
            color="#176B58"
          />
        </View>

        {/* LIVE DESTINATION SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#6B7280"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search cities or countries"
            placeholderTextColor="#8A9099"
            value={search}
            onChangeText={(value) => {
              setSearch(value);

              if (selectedDestination) {
                nearbyRequestId.current += 1;
                setSelectedDestination(null);
                setNearbyPlaces([]);
                setNearbyError("");
                setIsLoadingNearby(false);
              }
            }}
            returnKeyType="search"
            accessibilityLabel="Search destinations"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={21}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH LOADING */}
        {isSearching && (
          <Text style={styles.statusText}>
            Searching destinations...
          </Text>
        )}

        {/* SEARCH ERROR */}
        {searchError.length > 0 && (
          <Text style={styles.errorText}>{searchError}</Text>
        )}

        {/* LIVE SEARCH SUGGESTIONS */}
        {!selectedDestination && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Search results</Text>

            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => selectDestination(item)}
                accessibilityRole="button"
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color="#176B58"
                  />
                </View>

                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionName}>
                    {item.name}
                  </Text>

                  <Text style={styles.suggestionAddress}>
                    {item.formatted}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#89938D"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* NO SEARCH RESULTS */}
        {!selectedDestination &&
          search.trim().length >= 2 &&
          !isSearching &&
          suggestions.length === 0 &&
          !searchError && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={35}
                color="#8A9099"
              />

              <Text style={styles.emptyTitle}>
                No matching destinations
              </Text>

              <Text style={styles.emptyText}>
                Try searching for another city or country.
              </Text>
            </View>
          )}

        {/* SELECTED DESTINATION */}
        {selectedDestination && (
          <View style={styles.selectedDestinationCard}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedIcon}>
                <Ionicons
                  name="location"
                  size={25}
                  color="#176B58"
                />
              </View>

              <View style={styles.selectedText}>
                <Text style={styles.selectedLabel}>
                  SELECTED DESTINATION
                </Text>

                <Text style={styles.selectedName}>
                  {selectedDestination.name}
                </Text>

                <Text style={styles.selectedCountry}>
                  {selectedDestination.country}
                </Text>
              </View>
            </View>

            <Text style={styles.coordinatesText}>
              {selectedDestination.latitude.toFixed(4)},{" "}
              {selectedDestination.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* NEARBY PLACES */}
        {selectedDestination && (
          <View style={styles.nearbySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Explore nearby
              </Text>

              <Text style={styles.resultCount}>
                {nearbyPlaces.length} places
              </Text>
            </View>

            {/* NEARBY CATEGORY FILTERS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {nearbyCategories.map((category) => {
                const selected =
                  nearbyCategory === category.value;

                return (
                  <TouchableOpacity
                    key={category.value}
                    onPress={() =>
                      changeNearbyCategory(category.value)
                    }
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isLoadingNearby && (
              <Text style={styles.statusText}>
                Finding places nearby...
              </Text>
            )}

            {nearbyError.length > 0 && (
              <Text style={styles.errorText}>
                {nearbyError}
              </Text>
            )}

            {!isLoadingNearby &&
              !nearbyError &&
              nearbyPlaces.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="earth-outline"
                    size={38}
                    color="#8A9099"
                  />

                  <Text style={styles.emptyTitle}>
                    No places found
                  </Text>

                  <Text style={styles.emptyText}>
                    Try another category or destination.
                  </Text>
                </View>
              )}

            {/* EDITORIAL ATTRACTION CARDS */}
            {nearbyPlaces.map((place) => {
              const isSaved = favoriteIds.includes(place.id);

              return (
                <View
                  key={place.id}
                  style={styles.placeCard}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      router.push({
                        pathname: "/attraction/[id]",
                        params: {
                          id: place.id,
                          name: place.name,
                          address: place.address,
                          category:
                            place.categories?.[0] || nearbyCategory,
                          distance: String(place.distance ?? ""),
                          latitude: String(place.latitude),
                          longitude: String(place.longitude),
                          image: place.image || "",
                          imageAttribution:
                            place.imageAttribution || "",
                        },
                      });
                    }}
                  >
                    {place.image ? (
                      <Image
                        source={{ uri: place.image }}
                        style={styles.placeImage}
                        resizeMode="cover"
                      />
                    ) : null}

                    <View style={styles.placeCardContent}>
                      <Text style={styles.placeCategory}>
                        {nearbyCategory.toUpperCase()}
                      </Text>

                      <Text style={styles.placeName}>
                        {place.name}
                      </Text>

                      <Text style={styles.placeAddress}>
                        {place.address ||
                          "Location information unavailable"}
                      </Text>

                      <View style={styles.placeFooter}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#176B58"
                        />

                        <Text style={styles.placeDistance}>
                          {formatDistance(place.distance) ||
                            "Distance unavailable"}
                        </Text>

                        <Text style={styles.viewDetails}>
                          Explore place
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color="#176B58"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(place)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isSaved
                        ? "Remove from saved attractions"
                        : "Save attraction"
                    }
                  >
                    <Ionicons
                      name={
                        isSaved ? "bookmark" : "bookmark-outline"
                      }
                      size={22}
                      color="#176B58"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* ORIGINAL POPULAR DESTINATIONS */}
        {showPopularDestinations && (
          <>
            <Text style={styles.sectionTitle}>
              Explore by interest
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {(categories ?? []).map((category) => {
                const selected = selectedCategory === category;

                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Popular destinations
              </Text>

              <Text style={styles.resultCount}>
                {filteredDestinations.length} places
              </Text>
            </View>

            {filteredDestinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="earth-outline"
                  size={42}
                  color="#8A9099"
                />

                <Text style={styles.emptyTitle}>
                  No destinations found
                </Text>

                <Text style={styles.emptyText}>
                  Try another category.
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedCategory("All")}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>
                    Show all destinations
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredDestinations}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.destinationList}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => openDestination(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Explore ${item.name}, ${item.country}`}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />

                      <View style={styles.cardContent}>
                        <View style={styles.cardText}>
                          <Text style={styles.cardName}>
                            {item.name}
                          </Text>

                          <Text style={styles.cardCountry}>
                            {item.country} · {item.category}
                          </Text>

                          <Text style={styles.cardBudget}>
                            Est. ${item.budget.toLocaleString()} per trip
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleSaved(item.id)}
                      hitSlop={10}
                      style={styles.bookmarkButton}
                      accessibilityRole="button"
                      accessibilityLabel={
                        savedIds.includes(item.id)
                          ? `Remove ${item.name} from saved`
                          : `Save ${item.name}`
                      }
                    >
                      <Ionicons
                        name={
                          savedIds.includes(item.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={23}
                        color="#176B58"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </>
        )}

        {/* INSPIRATION BOX */}
        {!selectedDestination && (
          <View style={styles.inspirationBox}>
            <Ionicons
              name="sparkles-outline"
              size={26}
              color="#176B58"
            />

            <View style={styles.inspirationText}>
              <Text style={styles.inspirationTitle}>
                Your next trip starts here
              </Text>

              <Text style={styles.inspirationDescription}>
                Explore places, save your favorites, and start planning
                an adventure that fits your interests.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3EB",
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 125,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  eyebrow: {
    color: "#8A6847",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#20352D",
    letterSpacing: -1.2,
  },
  subtitle: {
    color: "#77776D",
    fontSize: 15,
    marginTop: 7,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFEFA",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8E1D5",
    paddingHorizontal: 17,
    height: 56,
    gap: 12,
    marginBottom: 26,
  },
  searchInput: {
    flex: 1,
    color: "#20352D",
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#20352D",
    letterSpacing: -0.4,
  },
  categoryList: {
    gap: 10,
    paddingVertical: 17,
  },
  categoryButton: {
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 25,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "#E8E1D5",
  },
  categoryButtonSelected: {
    backgroundColor: "#1C6653",
    borderColor: "#1C6653",
  },
  categoryText: {
    color: "#59665E",
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 17,
  },
  resultCount: {
    color: "#89877D",
    fontSize: 12,
    fontWeight: "600",
  },
  suggestionsContainer: {
    backgroundColor: "#FFFEFA",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E8E1D5",
    padding: 16,
    marginBottom: 24,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECE3",
    gap: 13,
  },
  suggestionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#E9F0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    color: "#20352D",
    fontSize: 15,
    fontWeight: "700",
  },
  suggestionAddress: {
    color: "#85847A",
    fontSize: 12,
    marginTop: 4,
  },
  selectedDestinationCard: {
    backgroundColor: "#E9EFE6",
    borderRadius: 20,
    padding: 19,
    marginBottom: 24,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selectedIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFEFA",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    flex: 1,
  },
  selectedLabel: {
    color: "#8A6847",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  selectedName: {
    color: "#20352D",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  selectedCountry: {
    color: "#77776D",
    fontSize: 13,
    marginTop: 3,
  },
  coordinatesText: {
    color: "#77776D",
    fontSize: 11,
    marginTop: 13,
  },
  nearbySection: {
    marginBottom: 24,
  },
  placeCard: {
    backgroundColor: "#FFFEFA",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EAE4D8",
    position: "relative",
  },
  placeImage: {
    width: "100%",
    height: 235,
    backgroundColor: "#E5EAE7",
  },
  placeCardContent: {
    padding: 19,
  },
  placeCategory: {
    color: "#A17A50",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  placeName: {
    color: "#20352D",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 29,
  },
  placeAddress: {
    color: "#77776D",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  placeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 17,
  },
  placeDistance: {
    color: "#85847A",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  viewDetails: {
    color: "#1C6653",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#FFFEFA",
  },
  statusText: {
    color: "#77776D",
    fontSize: 13,
    marginBottom: 12,
    marginTop: 5,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    marginBottom: 14,
  },
  destinationList: {
    gap: 19,
  },
  card: {
    backgroundColor: "#FFFEFA",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE4D8",
  },
  cardImage: {
    width: "100%",
    height: 205,
    backgroundColor: "#E5EAE7",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  cardText: {
    flex: 1,
    paddingRight: 56,
  },
  cardName: {
    color: "#20352D",
    fontSize: 20,
    fontWeight: "800",
  },
  cardCountry: {
    color: "#77776D",
    marginTop: 5,
    fontSize: 13,
  },
  cardBudget: {
    color: "#1C6653",
    marginTop: 9,
    fontSize: 13,
    fontWeight: "700",
  },
  bookmarkButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: "#E9F0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFEFA",
    borderRadius: 19,
    gap: 11,
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#20352D",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#77776D",
    textAlign: "center",
    lineHeight: 21,
  },
  resetButton: {
    backgroundColor: "#1C6653",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inspirationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#E9EFE6",
    borderRadius: 20,
    padding: 20,
    marginTop: 27,
  },
  inspirationText: {
    flex: 1,
  },
  inspirationTitle: {
    color: "#203F33",
    fontSize: 17,
    fontWeight: "800",
  },
  inspirationDescription: {
    color: "#68766A",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 7,
  },
});
