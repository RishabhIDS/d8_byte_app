import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { Checkbox, RadioButton } from "react-native-paper";
import { auth, db } from "@/firebase/firebaseConfig";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    fetchSignInMethodsForEmail,
    sendEmailVerification,
    signOut,
    signInWithEmailAndPassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Use compatible icons

const SignupPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        about: "",
        dob: undefined,
        education: "",
        job: "",
        firstDate: "",
        gender: "",
        interest: [],
        location: "",
        lookingFor: "",
        photos: [],
        name: "",
        promotions: false,
        uniqueTrait: "",
        email: "",
    });
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [tempUser, setTempUser] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationButtonText, setVerificationButtonText] = useState("Verify Email");
    const [errors, setErrors] = useState({});
    const [date, setDate] = useState();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified && !isVerifying) {
                router.push("/(tabs)");
            }
        });

        return () => unsubscribe();
    }, [router, isVerifying]);

    const questions = {
        1: "What's your email?",
        2: "Enter your password",
        3: "Confirm your password",
        4: "What's your first name?",
        5: "When's your birthday?",
        6: "What's your gender?",
        7: "Who are you interested in?",
    };

    const validateStep = () => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.email) {
                    newErrors.email = "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    newErrors.email = "Please enter a valid email";
                } else if (!isEmailVerified) {
                    newErrors.email = "Please verify your email first.";
                }
                break;
            case 2:
                if (!password) {
                    newErrors.password = "Password is required";
                } else if (password.length < 8) {
                    newErrors.password = "Password should be at least 8 characters";
                } else if (!/(?=.*[A-Z])/.test(password)) {
                    newErrors.password = "Password must contain at least one uppercase letter";
                } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
                    newErrors.password = "Password must contain at least one special character";
                }
                break;
            case 3:
                if (password !== confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
                }
                break;
            case 4:
                if (!formData.name) {
                    newErrors.name = "Name is required";
                }
                break;
            case 5:
                if (!formData.dob) {
                    newErrors.dob = "Date of birth is required";
                }
                break;
            case 6:
                if (!formData.gender) {
                    newErrors.gender = "Please select your gender";
                }
                break;
            case 7:
                if (!formData.interest) {
                    newErrors.interest = "Please select who you're interested in";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && !isEmailVerified) {
            setErrors({ email: "Please verify your email first." });
            return;
        }

        if (validateStep()) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setErrors({});
        setStep((prev) => prev - 1);
    };

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleVerifyEmail = async () => {
        const email = formData.email;
        setVerificationMessage("");
        setVerificationStatus("");

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Please enter a valid email" });
            return;
        }

        try {
            setIsVerifying(true);
            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (methods.length > 0) {
                setVerificationMessage("Email already exists. Please use a different email or reset your password if this is your account.");
                setIsVerifying(false);
                return;
            }

            const tempPassword = "defaultPassword@123";
            const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
            const user = userCredential.user;

            setTempUser({
                email: user.email,
                uid: user.uid,
                tempPassword: tempPassword,
            });

            await sendEmailVerification(user);
            await signOut(auth);

            setVerificationMessage("Verification email sent. Please check your inbox and click the link to verify your email.");
            setErrors({});
            setVerificationButtonText("Resend Verification Email");
        } catch (error) {
            console.error("Error during email verification:", error);
            if (error.code === "auth/email-already-in-use") {
                setVerificationMessage("Email already exists. Please use a different email.");
            } else {
                setVerificationMessage("An error occurred: " + error.message);
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleEmailVerificationCheck = async () => {
        const email = formData.email;
        setVerificationStatus("");

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Please enter a valid email" });
            return;
        }

        if (!tempUser) {
            setVerificationStatus("Please click 'Verify Email' first.");
            return;
        }

        try {
            setIsVerifying(true);
            await signOut(auth);
            const userCredential = await signInWithEmailAndPassword(auth, email, tempUser.tempPassword);
            const user = userCredential.user;

            await user.reload();

            if (user.emailVerified) {
                setIsEmailVerified(true);
                setVerificationStatus("Email verified! You can proceed.");
                await signOut(auth);
            } else {
                setVerificationStatus("Email not verified yet. Please check your inbox and click the verification link.");
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error checking email verification status:", error);
            setVerificationStatus("An error occurred: " + error.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) {
            console.log("🚨 Validation failed. Exiting...");
            return;
        }

        console.log("🚀 Starting handleSubmit...");

        try {
            const email = formData.email;
            const defaultPassword = "defaultPassword@123";
            let user;

            console.log(`📩 Checking if user exists for email: ${email}`);

            try {
                console.log("🔑 Attempting sign-in with default password...");
                const userCredential = await signInWithEmailAndPassword(auth, email, defaultPassword);
                user = userCredential.user;
                console.log("✅ Sign-in successful!", user);
            } catch (signInError) {
                console.error("❌ Error signing in:", signInError);
                setErrors({ email: "This email is already in use, but the password is incorrect." });
                return;
            }

            console.log("🔐 Reauthenticating user...");
            const credential = EmailAuthProvider.credential(email, defaultPassword);
            await reauthenticateWithCredential(user, credential);
            console.log("✅ Reauthentication successful!");

            console.log("📝 Updating password...");
            await updatePassword(user, password);
            console.log("✅ Password updated successfully!");

            console.log("📡 Fetching existing user data from Firestore...");
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            let userData = {
                about: "",
                dob: formData.dob,
                education: "",
                job: "",
                firstDate: "",
                gender: formData.gender,
                interests: formData.interest === "other" ? formData.customInterest : formData.interest,
                location: "",
                lookingFor: "",
                photos: [],
                name: formData.name,
                promotions: formData.promotions,
                uniqueTrait: "",
                email: formData.email,
                uid: user.uid,
                isProfileComplete: false,
                createdAt: new Date(),
            };

            if (userDocSnap.exists()) {
                console.log("📂 User data exists! Merging data......");
                userData = { ...userDocSnap.data(), ...userData };
            } else {
                console.log("🆕 No existing user data found. Creating new entry...");
            }

            console.log("💾 Saving user data to Firestore...");
            console.log(userData);
            await setDoc(userDocRef, userData, { merge: true });
            console.log("✅ User data saved successfully!");

            console.log("➡️ Redirecting to profile...");
            router.push("/(tabs)/profile");
        } catch (error) {
            console.error("🔥 Error handling user:", error);
            setErrors({ email: "An error occurred. Please try again." });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.headerText}>{questions[step]}</Text>

                {/* Step 1: Email */}
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(value) => {
                                updateFormData("email", value);
                                setIsEmailVerified(false);
                                setVerificationMessage("");
                                setVerificationStatus("");
                            }}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerifyEmail}
                            disabled={!formData.email || errors.email || isVerifying}
                        >
                            <Text style={styles.buttonText}>
                                {isVerifying ? "Sending..." : verificationButtonText}
                            </Text>
                        </TouchableOpacity>
                        {verificationMessage && (
                            <Text style={styles.errorText}>{verificationMessage}</Text>
                        )}
                        {tempUser && (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleEmailVerificationCheck}
                                disabled={isVerifying}
                            >
                                <Text style={styles.buttonText}>
                                    {isVerifying ? "Checking..." : "Check Verification Status"}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {verificationStatus && (
                            <Text
                                style={[
                                    styles.statusText,
                                    isEmailVerified ? styles.successText : styles.warningText,
                                ]}
                            >
                                {verificationStatus}
                            </Text>
                        )}
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                status={formData.promotions ? "checked" : "unchecked"}
                                onPress={() => updateFormData("promotions", !formData.promotions)}
                            />
                            <Text style={styles.checkboxLabel}>
                                I don't want to miss discounts & promotional emails
                            </Text>
                        </View>
                    </View>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={(value) => setPassword(value)}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <FiEyeOff /> : <FiEye />}
                        </TouchableOpacity>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>
                )}

                {/* Step 3: Confirm Password */}
                {step === 3 && (
                    <View style={styles.stepContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            secureTextEntry={!confirmPasswordVisible}
                            value={confirmPassword}
                            onChangeText={(value) => setConfirmPassword(value)}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        >
                            {confirmPasswordVisible ? <FiEyeOff /> : <FiEye />}
                        </TouchableOpacity>
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>
                )}

                {/* Step 4: Name */}
                {step === 4 && (
                    <View style={styles.stepContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="First name"
                            value={formData.name}
                            onChangeText={(value) => updateFormData("name", value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>
                )}

                {/* Step 5: DOB */}
                {step === 5 && (
                    <View style={styles.stepContainer}>
                        <Calendar
                            onDayPress={(day) => {
                                const selectedDate = new Date(day.dateString);
                                const today = new Date();
                                let age = today.getFullYear() - selectedDate.getFullYear();
                                const monthDifference = today.getMonth() - selectedDate.getMonth();
                                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < selectedDate.getDate())) {
                                    age--;
                                }
                                if (age < 18) {
                                    setErrors((prev) => ({ ...prev, age: "You must be at least 18 years old" }));
                                } else {
                                    setErrors((prev) => ({ ...prev, age: undefined }));
                                    setDate(selectedDate);
                                    updateFormData("dob", selectedDate);
                                }
                            }}
                            markedDates={{
                                [date?.toISOString().split("T")[0]]: { selected: true, selectedColor: "#fe3e00" },
                            }}
                        />
                        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
                        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
                    </View>
                )}

                {/* Step 6: Gender */}
                {step === 6 && (
                    <View style={styles.stepContainer}>
                        <RadioButton.Group
                            onValueChange={(value) => updateFormData("gender", value)}
                            value={formData.gender}
                        >
                            {["male", "female", "transgender", "non-binary", "other"].map((option) => (
                                <View key={option} style={styles.radioButtonContainer}>
                                    <RadioButton value={option} />
                                    <Text style={styles.radioButtonLabel}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </View>
                            ))}
                        </RadioButton.Group>
                        {formData.gender === "other" && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your gender"
                                value={formData.customGender}
                                onChangeText={(value) => updateFormData("customGender", value)}
                            />
                        )}
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                    </View>
                )}

                {/* Step 7: Interest */}
                {step === 7 && (
                    <View style={styles.stepContainer}>
                        <RadioButton.Group
                            onValueChange={(value) => updateFormData("interest", [value])}
                            value={formData.interest[0]}
                        >
                            {["male", "female", "transgender", "non-binary", "other"].map((option) => (
                                <View key={option} style={styles.radioButtonContainer}>
                                    <RadioButton value={option} />
                                    <Text style={styles.radioButtonLabel}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </View>
                            ))}
                        </RadioButton.Group>
                        {formData.interest.includes("other") && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your interest"
                                value={formData.customInterest}
                                onChangeText={(value) => updateFormData("customInterest", value)}
                            />
                        )}
                        {errors.interest && <Text style={styles.errorText}>{errors.interest}</Text>}
                    </View>
                )}

                {/* Navigation Buttons */}
                <View style={styles.navigationButtons}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={step === 7 ? handleSubmit : handleNext}
                        disabled={(step === 1 && !isEmailVerified) || isVerifying}
                    >
                        <Text style={styles.buttonText}>{step === 7 ? "Signup" : "Next"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    innerContainer: {
        flex: 1,
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 20,
    },
    stepContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#fe3e00",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "#fe3e00",
        fontSize: 14,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 14,
        marginBottom: 10,
    },
    successText: {
        color: "#00ff00",
    },
    warningText: {
        color: "#ffcc00",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    checkboxLabel: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 8,
    },
    eyeIcon: {
        position: "absolute",
        right: 10,
        top: 12,
    },
    radioButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    radioButtonLabel: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    backButton: {
        backgroundColor: "#666",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    nextButton: {
        backgroundColor: "#fe3e00",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        flex: 1,
    },
});

export default SignupPage;
