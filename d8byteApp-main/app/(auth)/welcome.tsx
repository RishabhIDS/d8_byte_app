import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { Link } from "expo-router";

import { onboarding } from "@/constants";

const Home = () => {
  // ✅ Explicitly define the type of the ref
  const swiperRef = useRef<Swiper | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Link>

      {/* Swiper Component */}
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.textWrapper}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </Swiper>

      {/* Navigation Button */}
      <Link href={isLastSlide ? "/(auth)/sign-up" : "/(auth)/welcome"} asChild>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (isLastSlide) {
              console.log("Navigating to sign-up...");
            } else {
              // ✅ Type-safe access to scrollBy
              swiperRef.current?.scrollBy(1);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
  },
  skipButton: {
    width: "100%",
    alignItems: "flex-end",
    padding: 20,
  },
  skipText: {
    color: "#FE3E00",
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300,
  },
  textWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#858585",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  button: {
    width: "90%",
    backgroundColor: "#FE3E00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dot: {
    width: 32,
    height: 4,
    marginHorizontal: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    height: 4,
    marginHorizontal: 5,
    backgroundColor: "#FE3E00",
    borderRadius: 4,
  },
});

export default Home;
