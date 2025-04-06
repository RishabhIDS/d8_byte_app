import React from "react";
import { View, StyleSheet } from "react-native";
import ChatDetail from "@/components/chat/ChatDetail"; // Adjust the import path as needed
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {useLocalSearchParams} from "expo-router";

// Define the type for the route parameters
type ChatDetailPageParams = {
    userId: string;
};

// Define the type for the navigation stack
type RootStackParamList = {
    ChatDetail: ChatDetailPageParams;
    // Add other screens here if needed
};

// Define the props for the component
type ChatDetailPageProps = {
    route: RouteProp<RootStackParamList, "ChatDetail">;
    navigation: StackNavigationProp<RootStackParamList, "ChatDetail">;
};

export default function ChatDetailPage({ route }: ChatDetailPageProps) {
    // Extract the userId from route.params
    // const { userId } = route.params;
    const {userId} = useLocalSearchParams(); // ✅ Works with Expo Router
    console.log("userId", userId);

    return (
        <View style={styles.container}>
            <ChatDetail userId={userId} />
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000", // Adjust background color as needed
        paddingBottom: "60px",
    },
});
