import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  getFavorites,
  getProfile,
  updateProfile,
  uploadProfileImage
} from '../../services/api';
import { getAuthToken } from '../../services/authStorage';

export default function Profile() {
  // User profile information
  const [user, setUser] = useState<{
    name: string;
    username: string;
    bio: string;
    profilePicture: ImageSourcePropType;
    coverPhoto: ImageSourcePropType;
    trips: number;
    posts: number;
    saved: number;
}>({
    name: 'Your Name',
    username: 'username',
    bio: 'Tell people a little about yourself.',
    profilePicture: require('@/assets/images/profile-picture.png'),
    coverPhoto: require('@/assets/images/profile-cover.png'),
    trips: 0,
    posts: 0,
    saved: 0,
});

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio);
  const [saving, setSaving] = useState(false);

  // LOAD SAVED ATTRACTIONS WHEN PROFILE OPENS
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSavedCount() {
        try {
          const token = await getAuthToken();

          if (!token) {
            console.log('No authentication token found.');
            return;
          }

          const favorites = await getFavorites(token);

          if (active) {
            setUser((currentUser) => ({
              ...currentUser,
              saved: favorites.length,
            }));
          }
        } catch (error) {
          console.error('Unable to load saved attractions:', error);
        }
      }

      loadSavedCount();

      return () => {
        active = false;
      };
    }, [])
  );

  // LOAD USER PROFILE FROM DATABASE
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getAuthToken();

        if (!token) {
          console.log('No authentication token found.');
          return;
        }

        const data = await getProfile(token);

        if (data.success && data.user) {
          const profile = data.user;

          setUser((currentUser) => ({
            ...currentUser,
            name: `${profile.firstName} ${profile.lastName}`,
            username: profile.username,
            bio: profile.bio || '',
            profilePicture: profile.profilePicture
              ? { uri: profile.profilePicture}
              : currentUser.profilePicture,

            coverPhoto: profile.coverPhoto
              ? { uri: profile.coverPhoto}
              : currentUser.coverPhoto, 
          }));
        }
      } catch (error) {
        console.error('Unable to load profile:', error);
      }
    }

    loadProfile();
  }, []);

  // SAVE PROFILE CHANGES TO DATABASE
  const saveProfile = async () => {
    if (saving) return;

    if (!editName.trim() || !editUsername.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your name and username.'
      );
      return;
    }

    // Separate first and last names
    const nameParts = editName.trim().split(/\s+/);

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (!lastName) {
      Alert.alert(
        'Missing information',
        'Please enter both your first and last name.'
      );
      return;
    }

    try {
      setSaving(true);

      // Retrieve authentication token
      const token = await getAuthToken();

      if (!token) {
        Alert.alert('Error', 'Please log in again.');
        return;
      }

      // Send updated profile information to backend
      const result = await updateProfile(token, {
        firstName,
        lastName,
        username: editUsername.trim().replace(/^@/, ''),
        bio: editBio.trim(),
      });

      if (result.success && result.user) {
        // Update the profile displayed on screen
        setUser((currentUser) => ({
          ...currentUser,
          name: `${result.user.firstName} ${result.user.lastName}`,
          username: result.user.username,
          bio: result.user.bio || '',
        }));

        setEditing(false);

        Alert.alert(
          'Profile updated',
          'Your profile has been saved successfully!'
        );
      } else {
        Alert.alert('Update failed', 'Unable to update your profile.');
      }
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error
          ? error.message
          : 'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  // SELECT AND SAVE PROFILE OR COVER PHOTO
    const selectPhoto = async (photoType: 'profile' | 'cover') => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Permission required',
            'Please allow photo library access to select an image.'
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: photoType === 'profile' ? [1, 1] : [16, 9],
          quality: 0.8,
          exif: false, 
        });

        if (result.canceled || !result.assets?.length) {
          return;
        }

        const token = await getAuthToken();

        if (!token) {
          Alert.alert('Error', 'Please log in again.');
          return;
        }
        console.log("Image picker result:", result);

        if (result.canceled || !result.assets?.length) {
          console.log("Image selection canceled.");
          return;
        }

        console.log("Selected image:", result.assets[0]);
    // Upload image and save its URL in MongoDB
    const imageUrl = await uploadProfileImage(
      token,
      result.assets[0],
      photoType
    );

    // Display the permanently saved image
    setUser((currentUser) => ({
      ...currentUser,
      [photoType === 'profile' ? 'profilePicture' : 'coverPhoto']:
        { uri: imageUrl },
    }));

    Alert.alert(
      'Photo saved!',
      photoType === 'profile'
        ? 'Your profile picture has been updated.'
        : 'Your cover photo has been updated.'
    );

  } catch (error) {
    console.error('Photo upload error:', error);

    Alert.alert(
      'Upload failed',
      error instanceof Error
        ? error.message
        : 'Unable to save your photo.'
    );
  }
};

  // OPEN TRIP PLANNER
  const openTrips = () => {
    router.push('./trip-planner');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* COVER PHOTO */}
    <View style={styles.coverContainer}>
      <Image source={user.coverPhoto} style={styles.coverPhoto} />

      <TouchableOpacity
        style={styles.coverEditButton}
        onPress={() => selectPhoto('cover')}
      >
        <Text style={styles.coverEditText}>Edit Cover</Text>
      </TouchableOpacity>
    </View>

      {/* PROFILE PICTURE */}
      <View style={styles.profilePictureContainer}>
        <Image
          source={user.profilePicture}
          style={styles.profilePicture}
        />

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => selectPhoto('profile')}
          accessibilityLabel="Change profile picture"
        >
          <Text style={styles.cameraText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE INFORMATION */}
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <View style={styles.userText}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (editing) {
                saveProfile();
              } else {
                setEditName(user.name);
                setEditUsername(user.username);
                setEditBio(user.bio);
                setEditing(true);
              }
            }}
            disabled={saving}
          >
            <Text style={styles.editText}>
              {saving
                ? 'Saving...'
                : editing
                  ? 'Save Profile'
                  : '✎ Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* EDIT PROFILE FORM */}
        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor="#89958F"
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="username"
              placeholderTextColor="#89958F"
              autoCapitalize="none"
              maxLength={30}
            />

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell people about yourself"
              placeholderTextColor="#89958F"
              multiline
              maxLength={160}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.bio}>{user.bio}</Text>
        )}
      </View>

      {/* PROFILE STATS */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.trips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.saved}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      {/* MY TRIPS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>My Trips</Text>
          <Text style={styles.sectionSubtitle}>
            Your next adventure starts here
          </Text>
        </View>

        <TouchableOpacity onPress={openTrips}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {/* EMPTY TRIPS MESSAGE */}
      <View style={styles.emptyTrips}>
        <View style={styles.travelIconCircle}>
          <Text style={styles.travelIcon}>✈</Text>
        </View>

        <Text style={styles.emptyTitle}>No trips yet</Text>

        <Text style={styles.emptyText}>
          Your next adventure is waiting. Start planning a trip that fits
          your interests and budget!
        </Text>

        <TouchableOpacity
          style={styles.createTripButton}
          onPress={openTrips}
        >
          <Text style={styles.createTripText}>+ Create Trip</Text>
        </TouchableOpacity>
      </View>

      {/* EXTRA SPACE FOR FLOATING TAB BAR */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  scrollContent: {
    paddingBottom: 10,
  },

  // COVER PHOTO
  coverContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#DDE9E2',
    overflow: 'hidden',
  },

  coverPhoto: {
    width: '100%',
    height: '100%',
  },

  coverLabel: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: 'rgba(16, 42, 36, 0.78)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  coverLabelText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // PROFILE PICTURE
  profilePictureContainer: {
    marginTop: -65,
    marginLeft: 25,
    width: 130,
    height: 130,
  },

  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: '#F8FAF9',
    backgroundColor: '#E4EBE7',
  },

  cameraButton: {
    position: 'absolute',
    right: -5,
    bottom: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#176B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F8FAF9',
  },

  cameraText: {
    fontSize: 25,
    color: 'white',
    lineHeight: 29,
  },

  // PROFILE INFORMATION
  profileInfo: {
    paddingHorizontal: 25,
    marginTop: 15,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  userText: {
    flex: 1,
  },

  name: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#172B26',
  },

  username: {
    fontSize: 15,
    color: '#718079',
    marginTop: 4,
  },

  bio: {
    fontSize: 16,
    color: '#42534B',
    lineHeight: 24,
    marginTop: 15,
  },

  // EDIT PROFILE
  editButton: {
    borderWidth: 1,
    borderColor: '#C8D5CE',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginLeft: 4,
  },

  editText: {
    fontSize: 13,
    color: '#176B58',
    fontWeight: '700',
  },

  editForm: {
    marginTop: 18,
    gap: 9,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344A40',
    marginTop: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D7E1DB',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#172B26',
    backgroundColor: 'white',
  },

  bioInput: {
    minHeight: 85,
    textAlignVertical: 'top',
  },

  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  cancelText: {
    fontSize: 14,
    color: '#718079',
    fontWeight: '600',
  },

  // PROFILE STATS
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EEEA',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#176B58',
  },

  statLabel: {
    fontSize: 14,
    color: '#718079',
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 42,
    backgroundColor: '#E0E7E2',
  },

  // MY TRIPS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 35,
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#172B26',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#718079',
    marginTop: 5,
  },

  seeAll: {
    fontSize: 15,
    fontWeight: '700',
    color: '#176B58',
  },

  // NO TRIPS
  emptyTrips: {
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 25,
    paddingVertical: 30,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: '#EEF3F0',
    borderWidth: 1,
    borderColor: '#E1EAE4',
  },

  travelIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D9E9DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  travelIcon: {
    fontSize: 28,
    color: '#176B58',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#172B26',
  },

  emptyText: {
    marginTop: 9,
    fontSize: 14,
    color: '#617169',
    textAlign: 'center',
    lineHeight: 21,
  },

  createTripButton: {
    marginTop: 20,
    backgroundColor: '#176B58',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 24,
  },

  createTripText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // SPACE FOR FLOATING TAB BAR
  bottomSpace: {
    height: 120,
  },
  coverEditButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: 'rgba(83, 82, 82, 0.78)',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
  },

  coverEditText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
