import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator } from "react-native";
import { X, Save, PlusCircle, GraduationCap, Briefcase, Cake } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from "@/services/cloudinaryService"; // Adjust the path to your Cloudinary service

const EditProfile = ({ profile, onSave, onClose }) => {
    const [updatedProfile, setUpdatedProfile] = useState({
        ...profile,
        interests: profile.interests || [],
        pronouns: profile.pronouns || "",
        loveLanguage: profile.loveLanguage || "",
        sexualOrientation: profile.sexualOrientation || "",
    });
    const [uploadingPhotos, setUploadingPhotos] = useState([]);
    const [deletingPhotos, setDeletingPhotos] = useState([]);
    const [showWarning, setShowWarning] = useState(false);

    // Handle input changes for text fields
    const handleChange = (field, value) => {
        setUpdatedProfile((prev) => ({ ...prev, [field]: value }));
    };

    // Check if the profile is complete
    const isProfileComplete = () => {
        const incompleteFields = [];

        Object.entries(updatedProfile).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    incompleteFields.push(key);
                }
            } else if (value === "" || value === null || value === undefined) {
                incompleteFields.push(key);
            }
        });

        if (incompleteFields.length > 0) {
            console.log("Incomplete fields:", incompleteFields);
            return false;
        }

        return true;
    };

    // Handle closing the modal
    const handleClose = () => {
        if (isProfileComplete()) {
            onClose();
        } else {
            setShowWarning(true);
        }
    };

    // Handle photo upload with Cloudinary
    const handlePhotoUpload = async () => {
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
            const file = result.assets[0].uri;

            // Prevent more than 4 photos
            if (updatedProfile.photos.length >= 4) {
                alert("Maximum 4 photos allowed");
                return;
            }

            // Create a unique identifier for the uploading photo
            const uploadId = Date.now();
            setUploadingPhotos((prev) => [...prev, uploadId]);

            try {
                // Upload to Cloudinary
                const uploadedUrl = await uploadToCloudinary(file);

                // Remove upload indicator and add photo
                setUploadingPhotos((prev) => prev.filter((id) => id !== uploadId));
                setUpdatedProfile((prev) => ({
                    ...prev,
                    photos: [...prev.photos, uploadedUrl],
                }));
            } catch (error) {
                console.error("Photo upload failed", error);
                setUploadingPhotos((prev) => prev.filter((id) => id !== uploadId));
                alert("Failed to upload photo");
            }
        }
    };

    // Handle photo removal
    const handlePhotoRemove = async (indexToRemove) => {
        const photoToRemove = updatedProfile.photos[indexToRemove];

        try {
            // Extract public ID from Cloudinary URL
            const publicId = extractPublicIdFromUrl(photoToRemove);

            if (publicId) {
                // Add photo to deleting state
                setDeletingPhotos((prev) => [...prev, photoToRemove]);

                // Delete from Cloudinary
                await deleteFromCloudinary(publicId);
            }

            // Remove the photo from the local state
            const updatedPhotos = updatedProfile.photos.filter((_, index) => index !== indexToRemove);

            setUpdatedProfile((prev) => ({
                ...prev,
                photos: updatedPhotos,
            }));

            // Remove from deleting state
            setDeletingPhotos((prev) => prev.filter((p) => p !== photoToRemove));
        } catch (error) {
            console.error("Failed to remove photo:", error);
            // Remove from deleting state
            setDeletingPhotos((prev) => prev.filter((p) => p !== photoToRemove));
            alert("Failed to remove photo");
        }
    };

    // Handle interest selection
    const handleInterestChange = (interest) => {
        const currentInterests = updatedProfile.interests || [];
        const isSelected = currentInterests.includes(interest);

        const newInterests = isSelected
            ? currentInterests.filter((i) => i !== interest)
            : [...currentInterests, interest];

        // Limit to 5 interests
        if (newInterests.length <= 5) {
            setUpdatedProfile((prev) => ({ ...prev, interests: newInterests }));
        }
    };

    // Predefined interests list
    const predefinedInterests = [
        "Music",
        "Sports",
        "Traveling",
        "Photography",
        "Cooking",
        "Reading",
        "Gaming",
        "Technology",
        "Art",
        "Fitness",
        "Fashion",
        "Movies",
        "Nature",
        "Painting",
        "Dancing",
        "Writing",
        "Volunteering",
    ];

    // Save changes and close modal
    const handleSave = () => {
        onSave(updatedProfile);
        onClose();
    };

    return (
        <Modal visible={true} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color="#FE3E00" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Content */}
                    <ScrollView style={styles.formContent}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.name}
                                onChangeText={(text) => handleChange("name", text)}
                                placeholder="Enter your name"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Age Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.age.toString()}
                                onChangeText={(text) => handleChange("age", parseInt(text))}
                                placeholder="Enter your age"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Location Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Location</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.location}
                                onChangeText={(text) => handleChange("location", text)}
                                placeholder="Enter your location"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* About Me Textarea */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>About Me</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={updatedProfile.about}
                                onChangeText={(text) => handleChange("about", text)}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#666"
                                multiline
                            />
                        </View>

                        {/* Education Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Education</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.education}
                                onChangeText={(text) => handleChange("education", text)}
                                placeholder="Enter your education"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Job Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Job</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.job}
                                onChangeText={(text) => handleChange("job", text)}
                                placeholder="Enter your job"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* First Date Textarea */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Perfect First Date</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={updatedProfile.firstDate}
                                onChangeText={(text) => handleChange("firstDate", text)}
                                placeholder="Describe your perfect first date"
                                placeholderTextColor="#666"
                                multiline
                            />
                        </View>

                        {/* Unique Trait Textarea */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>What Makes Me Unique</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={updatedProfile.uniqueTrait}
                                onChangeText={(text) => handleChange("uniqueTrait", text)}
                                placeholder="What makes you unique?"
                                placeholderTextColor="#666"
                                multiline
                            />
                        </View>

                        {/* Looking For Textarea */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Looking For</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={updatedProfile.lookingFor}
                                onChangeText={(text) => handleChange("lookingFor", text)}
                                placeholder="What are you looking for?"
                                placeholderTextColor="#666"
                                multiline
                            />
                        </View>

                        {/* Pronouns Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Pronouns</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.pronouns}
                                onChangeText={(text) => handleChange("pronouns", text)}
                                placeholder="Enter your pronouns"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Love Language Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Love Language</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.loveLanguage}
                                onChangeText={(text) => handleChange("loveLanguage", text)}
                                placeholder="Enter your love language"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Sexual Orientation Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Sexual Orientation</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedProfile.sexualOrientation}
                                onChangeText={(text) => handleChange("sexualOrientation", text)}
                                placeholder="Enter your sexual orientation"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Interests Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Interests</Text>
                            <View style={styles.interestsContainer}>
                                {predefinedInterests.map((interest, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.interestButton,
                                            updatedProfile.interests?.includes(interest) && styles.selectedInterestButton,
                                        ]}
                                        onPress={() => handleInterestChange(interest)}
                                    >
                                        <Text
                                            style={[
                                                styles.interestText,
                                                updatedProfile.interests?.includes(interest) && styles.selectedInterestText,
                                            ]}
                                        >
                                            {interest}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Photos Upload */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Photos</Text>
                            <View style={styles.photosContainer}>
                                {updatedProfile.photos.map((photo, index) => (
                                    <View key={index} style={styles.photoWrapper}>
                                        <Image source={{ uri: photo }} style={styles.photo} />
                                        <TouchableOpacity
                                            style={styles.removePhotoButton}
                                            onPress={() => handlePhotoRemove(index)}
                                            disabled={deletingPhotos.includes(photo)}
                                        >
                                            {deletingPhotos.includes(photo) ? (
                                                <ActivityIndicator size="small" color="#FE3E00" />
                                            ) : (
                                                <X size={16} color="#FE3E00" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* Add Photo Button */}
                                {updatedProfile.photos.length < 4 && (
                                    <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoUpload}>
                                        {uploadingPhotos.length > 0 ? (
                                            <ActivityIndicator size="small" color="#FE3E00" />
                                        ) : (
                                            <PlusCircle size={24} color="#FE3E00" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={!isProfileComplete()}
                        >
                            <Save size={20} color="#000" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = {
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        padding: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FE3E00",
    },
    formContent: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#FE3E00",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#333",
        borderRadius: 5,
        padding: 10,
        color: "#FFF",
    },
    interestsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    interestButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: "#333",
    },
    selectedInterestButton: {
        backgroundColor: "#FE3E00",
    },
    interestText: {
        color: "#FFF",
    },
    selectedInterestText: {
        color: "#000",
    },
    photosContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    photoWrapper: {
        position: "relative",
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    removePhotoButton: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 10,
        padding: 5,
    },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
    },
    saveButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FE3E00",
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
    },
    saveButtonText: {
        color: "#000",
        fontSize: 16,
        marginLeft: 10,
    },
};

export default EditProfile;
