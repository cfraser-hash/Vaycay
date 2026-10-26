import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  categories,
  destinations,
} from "../data/destinations";

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      pathname: "/(tabs)/destination/[id]",
      params: { id },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#6B7280"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations or countries"
            placeholderTextColor="#8A9099"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search destinations"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={21}
                color="#6B7280"
              />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Explore by interest</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {(categories ?? []).map((category) => {
            const selected = selectedCategory === category;

            return (
              <Pressable
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
              </Pressable>
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
              Try another search or select a different category.
            </Text>

            <Pressable
              onPress={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>
                Show all destinations
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.destinationList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
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
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardCountry}>
                      {item.country} · {item.category}
                    </Text>
                    <Text style={styles.cardBudget}>
                      Est. ${item.budget.toLocaleString()} per trip
                    </Text>
                  </View>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleSaved(item.id);
                    }}
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
                  </Pressable>
                </View>
              </Pressable>
            )}
          />
        )}

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
    marginBottom: 26,
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
    paddingRight: 8,
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
