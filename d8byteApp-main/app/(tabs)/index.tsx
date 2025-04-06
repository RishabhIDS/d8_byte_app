import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";
import Swiper from "react-native-deck-swiper";
import Icon from "react-native-vector-icons/FontAwesome";
import { fetchAllUsers } from "@/lib/fetchUsers";  // Import your Firebase function

// Define types
interface User {
  uid: string;
  name: string;
  location: string;
  image: string;
}

const AIBots = [
  {
    id: "1",
    name: "Hamko Nahi",
    location: "New York, US",
    image: "https://images.unsplash.com/photo-1723299942794-b1fe9f285d5b?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "2",
    name: "Lal Jhanda AI",
    location: "San Francisco, US",
    image: "https://plus.unsplash.com/premium_photo-1661337105814-ece9cf691363?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "3",
    name: "Shrivalli AI",
    location: "San Francisco, US",
    image: "https://plus.unsplash.com/premium_photo-1683141440843-53f051bf4095?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "4",
    name: "Bhow bhow",
    location: "San Francisco, US",
    image: "https://images.unsplash.com/photo-1700558451031-64f8c64fab6a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "5",
    name: "Poo poo",
    location: "San Francisco, US",
    image: "https://plus.unsplash.com/premium_photo-1661629259850-9a893425f1f5?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];


const HomeScreen: React.FC = () => {
  const swiperRef = useRef<Swiper<User>>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const firebaseUsers = await fetchAllUsers();

        // Map Firebase data to match the required structure
        const mappedUsers: User[] = firebaseUsers.map((user) => ({
          uid: user.uid,
          name: user.name || "Unknown",
          location: user.location || "Unknown Location",
          image: user.image || "https://plus.unsplash.com/premium_photo-1661629259850-9a893425f1f5?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Fallback image
        }));

        setUsers(mappedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE3E00" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.bg}>
        <View style={styles.header}>
          <View style={styles.header1}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1578979879663-4ba6a968a50a?q=80&w=1374&auto=format&fit=crop" }}
              style={styles.avatar}
            />
            <Text style={styles.greeting}>
              Good Morning {"\n"}
              <Text style={styles.highlight}>Hottie</Text>
            </Text>
          </View>
          <TouchableOpacity>
            <Icon name="bell" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured AI Bots</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={AIBots}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.aiCard}
            >
              <Image source={{ uri: item.image }} style={styles.aiImage} />
              <Text style={styles.aiLabel}>AI Bot</Text>
              <Text style={styles.aiName}>{item.name}</Text>
              <Text style={styles.aiLocation}>{item.location}</Text>
            </TouchableOpacity>
          )}
        />
        {/* Swiper for User Cards */}
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={users}
            renderCard={(user) => (
              <View style={styles.card}>
                <Image source={{ uri: user.image }} style={styles.cardImage} />
                <Text style={styles.cardName}>{user.name}</Text>
                <Text style={styles.cardLocation}>{user.location}</Text>
              </View>
            )}
            onSwipedLeft={() => console.log("❌ Rejected")}
            onSwipedRight={() => console.log("❤️ Liked")}
            stackSize={3}
            cardIndex={0}
            backgroundColor="transparent"
            infinite
          />
        </View>

        {/* Swipe Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button}>
            <Icon name="times" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton}>
            <Icon name="heart" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Icon name="comment" size={24} color="#FE3E00" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 70,
  },
  bg: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    color: "white",
    fontSize: 16,
  },
  highlight: {
    color: "#FE3E00",
    fontWeight: "bold",
    fontSize: 18,
  },
  featuredSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  featuredTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    color: "#FE3E00",
    fontSize: 14,
  },
  aiCard: {
    width: 140,
    height: 190,
    backgroundColor: "#222",
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: "center",
    padding: 10,
  },
  aiImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },
  aiLabel: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FE3E00",
    color: "white",
    fontSize: 12,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  aiName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  aiLocation: {
    color: "gray",
    fontSize: 12,
  },
  swiperContainer: {
    height: 600,
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: 300,
    height: 500,
    borderRadius: 10,
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "80%",
  },
  cardName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  cardLocation: {
    color: "gray",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 18,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "#222",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  likeButton: {
    width: 60,
    height: 60,
    backgroundColor: "#FE3E00",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
});