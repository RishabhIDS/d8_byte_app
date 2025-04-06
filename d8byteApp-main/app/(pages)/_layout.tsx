import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Heart, MessageCircle, User, Home } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#FE3E00', 
          tabBarInactiveTintColor: '#8E8E93', 
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={styles.iconContainer}>
                {focused && <FloatingTab />}
                <Home size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={styles.iconContainer}>
                {focused && <FloatingTab />}
                <Heart size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={styles.iconContainer}>
                {focused && <FloatingTab />}
                <MessageCircle size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={styles.iconContainer}>
                {focused && <FloatingTab />}
                <User size={size} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// Floating tab effect when active
const FloatingTab = () => (
  <Svg width={100} height={30} viewBox="0 0 70 25" style={styles.floatingTab}>
    <Path
      d="M0.488637 18.5842C0.565182 18.4645 0.656404 18.3492 0.754852 18.2467C20.9621 -2.79283 30.0108 -4.86599 56.2776 9.22332C66.6222 14.772 72.6731 18.0501 76.034 19.8938C78.6094 21.3066 78.0776 21.9352 75.1402 21.9352H2.32371C0.60313 21.9352 -0.438035 20.0339 0.488637 18.5842Z" 
      fill="#FE3E00" 
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#000', 
    borderTopWidth: 0,
    borderTopColor: '#000',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTab: {
    position: 'absolute',
    bottom: -35,
  },
});
