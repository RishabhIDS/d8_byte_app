import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

const USERS = [
  {
    id: "1",
    name: "Hamko Nahi",
    location: "New York, US",
    image: "https://images.unsplash.com/photo-1723299942794-b1fe9f285d5b?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "2",
    name: "Lal Jhanda",
    location: "San Francisco, US",
    image: "https://plus.unsplash.com/premium_photo-1661337105814-ece9cf691363?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "3",
    name: "Shrivalli",
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


export default function MatchesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Matches</Text>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.matchGrid}>
          {USERS.map((user) => (
            <View key={user.id} style={styles.matchCard}>
              <Image
                source={{ uri: user.image }}
                style={styles.matchImage}
              />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{user.name}</Text>
                <View style={styles.messageButton}>
                  <MessageCircle size={20} color="#FF4B6A" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  matchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  matchCard: {
    width: '50%',
    padding: 10,
  },
  matchImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  matchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});