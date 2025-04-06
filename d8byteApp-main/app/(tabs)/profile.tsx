import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet, } from "react-native";
import { Settings, Camera, MapPin, Cake, GraduationCap, Briefcase, Heart, Edit } from "lucide-react-native";
import { auth, db } from "@/firebase/firebaseConfig"; // Adjust the path to your Firebase config
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import EditProfile from "@/components/ProfileEdit";
import {uploadToCloudinary} from "@/services/cloudinaryService"; // Adjust the path to your EditProfile component

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("User not logged in");
        return;
      }

      setUserId(user.uid);
      await fetchProfile(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    console.log("uid", uid);
    try {
      const profileRef = doc(db, "users", uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      } else {
        console.log("No profile data found!");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile in Firestore
  const updateProfile = async (updatedData) => {
    if (!userId) return;

    try {
      const profileRef = doc(db, "users", userId);
      await updateDoc(profileRef, { ...updatedData, isProfileComplete: true });
      setProfile((prev) => ({ ...prev, ...updatedData, isProfileComplete: true }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChangeOldWithbase63 = async () => {
    console.log("wow")
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker?.MediaType?.Images, // Use MediaType instead of MediaTypeOptions
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = result.assets[0].uri;
      updateProfile({ photos: [newPhoto, ...profile.photos.slice(1)] });
    }
  };

  const handleProfilePictureChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduce quality to optimize size
    });

    if (!result.canceled) {
      try {
        const newPhoto = result.assets[0].uri;

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(newPhoto);

        // Save URL to Firebase Firestore (assuming user has a profile doc)
        const userRef = doc(db, "users", userId); // Replace "USER_ID" with actual user ID
        await updateDoc(userRef, {
          photos: [imageUrl], // Store only the Cloudinary URL
        });

        console.log("Profile picture updated successfully:", imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      }
    }
  };


  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FE3E00" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
    );
  }

  if (!profile) {
    return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Profile not found.</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#FE3E00" />
            </TouchableOpacity>
          </View>

          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <Image
                source={{ uri: profile.photos?.[1] || "https://placehold.co/400" }}
                style={styles.coverImage}
            />
          </View>

          {/* Profile Image */}
          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              <Image
                  source={{ uri: profile.photos?.[0] || "https://placehold.co/400" }}
                  style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editImageButton} onPress={handleProfilePictureChange}>
                <Camera size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              <Text style={styles.age}>{profile.location}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Edit size={16} color="#FE3E00" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* About Me */}
            <View style={styles.bioSection}>
              <Text style={styles.bioTitle}>About Me</Text>
              <Text style={styles.bioText}>{profile.about || "No bio added yet."}</Text>
            </View>

            {/* Interests */}
            <View style={styles.statsSection}>
              <Text style={styles.bioTitle}>Interests</Text>
              <FlatList
                  data={profile.interests || []}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                      <View style={styles.interestItem}>
                        <Heart size={16} color="#FE3E00" />
                        <Text style={styles.interestText}>{item}</Text>
                      </View>
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* Photo Gallery */}
            <View style={styles.statsSection}>
              <Text style={styles.bioTitle}>Photos</Text>
              <FlatList
                  data={profile.photos?.slice(1) || []}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                      <Image source={{ uri: item }} style={styles.galleryImage} />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* Prompt Section */}
            <View style={styles.statsSection}>
              <Text style={styles.bioTitle}>Get to Know Me</Text>
              <View style={styles.promptContainer}>
                <View style={styles.promptItem}>
                  <Text style={styles.promptQuestion}>Perfect First Date</Text>
                  <Text style={styles.promptAnswer}>{profile.firstDate || "Not provided."}</Text>
                </View>
                <View style={styles.promptItem}>
                  <Text style={styles.promptQuestion}>What Makes Me Unique</Text>
                  <Text style={styles.promptAnswer}>{profile.uniqueTrait || "Not provided."}</Text>
                </View>
                <View style={styles.promptItem}>
                  <Text style={styles.promptQuestion}>Looking For</Text>
                  <Text style={styles.promptAnswer}>{profile.lookingFor || "Not provided."}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal visible={isEditing} animationType="slide" transparent>
          <EditProfile
              profile={profile}
              onSave={(updatedProfile: any) => {
                updateProfile(updatedProfile);
                setIsEditing(false);
              }}
              onClose={() => setIsEditing(false)}
          />
        </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FE3E00",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  coverImageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  profileSection: {
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FE3E00",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: "#FE3E00",
    marginBottom: 15,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: "#FE3E00",
    marginLeft: 8,
  },
  bioSection: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FE3E00",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 22,
  },
  statsSection: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  interestItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  interestText: {
    fontSize: 14,
    color: "#FE3E00",
    marginLeft: 8,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  promptContainer: {
    marginTop: 10,
  },
  promptItem: {
    marginBottom: 20,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE3E00",
    marginBottom: 5,
  },
  promptAnswer: {
    fontSize: 14,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    fontSize: 18,
    color: "#FE3E00",
    marginTop: 10,
  },
});

export default ProfileScreen;
