// VAYCAY API Service

import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

const API_URL = "http://172.19.109.47:3000/api";

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
