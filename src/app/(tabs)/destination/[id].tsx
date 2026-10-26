
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { destinations } from "../../data/destinations";

export default function DestinationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const destination = destinations.find(
    (item) => item.id === id
  );

  if (!destination) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Destination not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <Image
        source={{ uri: destination.image }}
        style={styles.heroImage}
      />

      <View style={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#172B26" />
          <Text style={styles.backText}>Back to Discover</Text>
        </Pressable>

        <Text style={styles.category}>
          {destination.category} · {destination.country}
        </Text>

        <Text style={styles.title}>{destination.name}</Text>

        <Text style={styles.description}>
          {destination.description}
        </Text>

        <View style={styles.budgetBox}>
          <Ionicons
            name="wallet-outline"
            size={23}
            color="#176B58"
          />
          <View>
            <Text style={styles.budgetLabel}>
              Estimated trip budget
            </Text>
            <Text style={styles.budget}>
              ${destination.budget.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Things to do
        </Text>

        {destination.activities.map((activity) => (
          <View key={activity} style={styles.activity}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#176B58"
            />
            <Text style={styles.activityText}>{activity}</Text>
          </View>
        ))}

        <Pressable
          style={styles.planButton}
          onPress={() =>
            router.push({
              pathname: "/(tabs)",
            })
          }
        >
          <Text style={styles.planButtonText}>
            Explore more destinations
          </Text>
          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  heroImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#E5EAE7",
  },
  content: {
    padding: 22,
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
    fontSize: 14,
    fontWeight: "600",
  },
  category: {
    color: "#176B58",
    fontWeight: "600",
    fontSize: 13,
  },
  title: {
    color: "#172B26",
    fontSize: 31,
    fontWeight: "800",
    marginTop: 8,
  },
  description: {
    color: "#68736F",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  budgetBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    backgroundColor: "#EAF3ED",
    borderRadius: 14,
    marginVertical: 25,
  },
  budgetLabel: {
    color: "#52675D",
    fontSize: 13,
  },
  budget: {
    color: "#174D40",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
  },
  sectionTitle: {
    color: "#172B26",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  activity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  activityText: {
    color: "#34423B",
    fontSize: 15,
  },
  planButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#176B58",
    padding: 16,
    borderRadius: 13,
    marginTop: 20,
  },
  planButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    gap: 15,
    backgroundColor: "#F8FAF9",
  },
});
