import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
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
  getNearbyAttractions,
  searchDestinationSuggestions,
  type DestinationSuggestion,
  type NearbyPlace,
} from "../../services/api";

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

  // Filter the original VAYCAY destination catalog
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

  // Load nearby places for a selected destination
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

  // Select a city or country from Geoapify
  function selectDestination(destination: DestinationSuggestion) {
    setSelectedDestination(destination);
    setSearch(destination.formatted || `${destination.name}, ${destination.country}`);
    setSuggestions([]);
    setNearbyCategory("attractions");

    loadNearbyPlaces(destination, "attractions");
  }

  // Change the nearby attraction category
  function changeNearbyCategory(category: NearbyCategory) {
    if (!selectedDestination) return;

    setNearbyCategory(category);
    loadNearbyPlaces(selectedDestination, category);
  }

  // Clear the destination search
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
            <Text style={styles.title}>Explore the world with VAYCAY!</Text>
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
            <Text style={styles.sectionTitle}>
              Search results
            </Text>

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

            {/* REAL GEOAPIFY PLACES */}
            {nearbyPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                activeOpacity={0.75}
                onPress={() => {
                  console.log("Attraction card pressed:", place.name,{
                    name: place.name,
                    id: place.id,
                  });

                  router.push({
                    pathname: "/attraction/[id]",
                    params: {
                      id: place.id,
                      name: place.name,
                      address: place.address,
                      category: place.categories?.[0] || nearbyCategory,
                      distance: String(place.distance ?? ""),
                      latitude: String(place.latitude),
                      longitude: String(place.longitude),
                    },
                  })
                }}
              >
                {place.image ? (
                  <Image
                    source={{ uri: place.image }}
                    style={styles.placeImage}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.placeText}>
                  <Text style={styles.placeName}>
                    {place.name}
                  </Text>

                  <Text style={styles.placeAddress}>
                    {place.address}
                  </Text>

                  {formatDistance(place.distance) !== "" && (
                    <Text style={styles.placeDistance}>
                      {formatDistance(place.distance)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
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
  placeImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#EAF3ED",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 115,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  eyebrow: {
    color: "#176B58",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#172B26",
  },
  subtitle: {
    color: "#68736F",
    fontSize: 14,
    marginTop: 5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4EAE6",
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: "#172B26",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172B26",
  },
  categoryList: {
    gap: 9,
    paddingVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8E3",
  },
  categoryButtonSelected: {
    backgroundColor: "#176B58",
    borderColor: "#176B58",
  },
  categoryText: {
    color: "#48554F",
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
    marginTop: 7,
    marginBottom: 14,
  },
  resultCount: {
    color: "#78837D",
    fontSize: 12,
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E4EAE6",
    padding: 15,
    marginBottom: 22,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1EF",
    gap: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF3ED",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    color: "#172B26",
    fontSize: 15,
    fontWeight: "700",
  },
  suggestionAddress: {
    color: "#68736F",
    fontSize: 12,
    marginTop: 4,
  },
  selectedDestinationCard: {
    backgroundColor: "#EAF3ED",
    borderRadius: 16,
    padding: 17,
    marginBottom: 22,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    flex: 1,
  },
  selectedLabel: {
    color: "#176B58",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  selectedName: {
    color: "#172B26",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 3,
  },
  selectedCountry: {
    color: "#68736F",
    fontSize: 13,
    marginTop: 2,
  },
  coordinatesText: {
    color: "#68736F",
    fontSize: 11,
    marginTop: 12,
  },
  nearbySection: {
    marginBottom: 20,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EEEA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 11,
    gap: 12,
  },
  placeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EAF3ED",
    alignItems: "center",
    justifyContent: "center",
  },
  placeText: {
    flex: 1,
  },
  placeName: {
    color: "#172B26",
    fontSize: 15,
    fontWeight: "700",
  },
  placeAddress: {
    color: "#68736F",
    fontSize: 12,
    marginTop: 4,
  },
  placeDistance: {
    color: "#176B58",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  statusText: {
    color: "#68736F",
    fontSize: 13,
    marginBottom: 12,
    marginTop: 4,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    marginBottom: 14,
  },
  destinationList: {
    gap: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9EEEA",
  },
  cardImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#E5EAE7",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  cardText: {
    flex: 1,
    paddingRight: 56,
  },
  cardName: {
    color: "#172B26",
    fontSize: 18,
    fontWeight: "700",
  },
  cardCountry: {
    color: "#68736F",
    marginTop: 4,
    fontSize: 13,
  },
  cardBudget: {
    color: "#176B58",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  bookmarkButton: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: "#EEF5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    gap: 10,
    marginBottom: 18,
  },
  emptyTitle: {
    color: "#172B26",
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: "#68736F",
    textAlign: "center",
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: "#176B58",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inspirationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    backgroundColor: "#EAF3ED",
    borderRadius: 16,
    padding: 17,
    marginTop: 24,
  },
  inspirationText: {
    flex: 1,
  },
  inspirationTitle: {
    color: "#174D40",
    fontSize: 16,
    fontWeight: "700",
  },
  inspirationDescription: {
    color: "#52675D",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
});
