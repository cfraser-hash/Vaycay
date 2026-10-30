export type Destination = {
  id: string;
  name: string;
  country: string;
  category: string;
  image: string;
  description: string;
  budget: number;
  activities: string[];
};

export const destinations: Destination[] = [
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    category: "Beaches",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1000",
    description:
      "Discover whitewashed buildings, beautiful sunsets, and views of the Aegean Sea.",
    budget: 1800,
    activities: ["Sunset viewing", "Boat tours", "Local food"],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    category: "Cities",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000",
    description:
      "Explore famous landmarks, museums, cafes, and charming city streets.",
    budget: 1500,
    activities: ["Museums", "Sightseeing", "Food tours"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000",
    description:
      "Enjoy tropical landscapes, cultural experiences, and outdoor adventures.",
    budget: 1300,
    activities: ["Hiking", "Beaches", "Temple visits"],
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1000",
    description:
      "Experience mountain scenery, alpine villages, and scenic hiking trails.",
    budget: 2000,
    activities: ["Hiking", "Mountain railways", "Photography"],
  },
];

export const categories = [
  "All",
  "Beaches",
  "Cities",
  "Adventure",
  "Nature",
];
