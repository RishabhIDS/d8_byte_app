import {useEffect, useState} from "react";
import { Alert, Image, ScrollView, Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { router } from "expo-router";
import { icons, images } from "@/constants";
import {onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";  // Import Firebase auth

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  const onSignInPress = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      Alert.alert("Success", "Signed in successfully!", [
        {
          text: "OK",
          onPress: () => {
            // router.replace("/(tabs)");
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user :any) => {
      if (user) {
        // router.replace("/(tabs)"); // Redirect to home if already signed in
      }
      setLoading(false); // Stop loading once check is done
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);


  return (
      <ScrollView style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.imageWrapper}>
            <Image source={images.signUpCar} style={styles.image} />
            <Text style={styles.welcomeText}>Welcome 👋</Text>
          </View>

          <View style={styles.formWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Image source={icons.email} style={styles.icon} />
              <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(value) => setForm({ ...form, email: value })}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Image source={icons.lock} style={styles.icon} />
              <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  secureTextEntry={true}
                  value={form.password}
                  onChangeText={(value) => setForm({ ...form, password: value })}
              />
            </View>

            <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <Link href="/(auth)/welcome" asChild>
              <TouchableOpacity>
                <Text style={styles.navText}>Go to Home</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpText}>
                  Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </Link>
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
    backgroundColor: "#000",
  },
  imageWrapper: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  welcomeText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  formWrapper: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  signInButton: {
    backgroundColor: "#FE3E00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  navText: {
    color: "#FE3E00",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginTop: 30,
  },
  signUpLink: {
    color: "#FE3E00",
    fontWeight: "600",
  },
});

export default SignIn;
