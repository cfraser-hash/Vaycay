// VAYCAY API Service

import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

const API_URL = "https://vaycay-9woq.onrender.com";

// SIGNUP REQUEST
export async function signupUser(userData: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed.");
  }

  return data;
}

// LOGIN REQUEST
export async function loginUser(userData: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}

// GET USER PROFILE
export async function getProfile(token: string) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to retrieve profile.");
  }

  return data;
}

// UPDATE USER PROFILE
export async function updateProfile(
  token: string,
  profileData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    profilePicture?: string;
    coverPhoto?: string;
  }
) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update profile.");
  }

  return data;
}

// REQUEST SECURE CLOUDINARY UPLOAD SIGNATURE
async function getProfilePhotoSignature(
  token: string,
  photoType: "profile" | "cover"
) {
  const response = await fetch(
    `${API_URL}/users/profile-photo/sign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photoType }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to prepare photo upload."
    );
  }

  return data;
}

// UPLOAD PROFILE OR COVER IMAGE TO CLOUDINARY
export async function uploadProfileImage(
  token: string,
  asset: ImagePickerAsset,
  photoType: "profile" | "cover"
) {
  // Request secure upload signature from backend
  const signatureData = await getProfilePhotoSignature(
    token,
    photoType
  );

  const {
    cloudName,
    apiKey,
    timestamp,
    folder,
    publicId,
    signature,
  } = signatureData;

  // Prepare image upload
  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(asset.uri);
    const imageBlob = await imageResponse.blob();

    formData.append(
      "file",
      imageBlob,
      asset.fileName || "vaycay-photo.jpg"
    );
  } else {
    formData.append(
      "file",
      {
        uri: asset.uri,
        name: asset.fileName || "vaycay-photo.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any
    );
  }

  // Add signed Cloudinary parameters
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  // Upload image directly to Cloudinary
  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const cloudinaryData = await cloudinaryResponse.json();

  if (!cloudinaryResponse.ok) {
    throw new Error(
      cloudinaryData.error?.message ||
      "Unable to upload photo."
    );
  }

  if (!cloudinaryData.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  const imageURL = cloudinaryData.secure_url;

  // Save image URL in MongoDB
  if (photoType === "profile") {
    await updateProfile(token, {
      profilePicture: imageURL,
    });
  } else {
    await updateProfile(token, {
      coverPhoto: imageURL,
    });
  }

  return imageURL as string;
}

// DESTINATION SEARCH RESULT TYPE
export type DestinationSuggestion = {
  id: string;
  name: string;
  country: string;
  city: string;
  state: string;
  formatted: string;
  latitude: number;
  longitude: number;
  type: string;
};

// ATTRACTION RESULT TYPE
export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  distance: number | null;
  image?: string | null;
  imageAttribution?: string | null;
};

// SEARCH CITIES, COUNTRIES, AND PLACES
export async function searchDestinationSuggestions(
  query: string
): Promise<DestinationSuggestion[]> {
  const response = await fetch(
    `${API_URL}/places/autocomplete?text=${encodeURIComponent(query)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to search destinations."
    );
  }

  return data.results || [];
}

// FIND ATTRACTIONS NEAR A SELECTED DESTINATION
export async function getNearbyAttractions(
  latitude: number,
  longitude: number,
  category: "attractions" | "museums" | "beaches" | "parks" | "culture" = "attractions"
): Promise<NearbyPlace[]> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    category,
  });

  const response = await fetch(
    `${API_URL}/places/nearby?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to find nearby attractions."
    );
  }

  return data.results || [];
}
// GET SAVED FAVORITES
export async function getFavorites(token: string) {
  const response = await fetch(`${API_URL}/users/favorites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to retrieve favorites.");
  }

  return data.favorites || [];
}

// SAVE AN ATTRACTION TO FAVORITES
export async function saveFavorite(
  token: string,
  attraction: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    distance: number | null;
  }
) {
  const response = await fetch(`${API_URL}/users/favorites`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attraction),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save favorite.");
  }

  return data;
}

// REMOVE AN ATTRACTION FROM FAVORITES
export async function removeFavorite(
  token: string,
  favoriteId: string
) {
  const response = await fetch(
    `${API_URL}/users/favorites/${encodeURIComponent(favoriteId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to remove favorite.");
  }

  return data;
}