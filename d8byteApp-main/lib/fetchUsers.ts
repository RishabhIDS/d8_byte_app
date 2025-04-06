import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Define the expected user type
interface User {
  uid: string;
  name?: string;
  location?: string;
  image?: string;
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));

    const users: User[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      
      return {
        uid: doc.id,
        name: data.name || "Unknown",
        location: data.location || "Unknown",
        image: Array.isArray(data.photos) ? data.photos[0] : data.photos || "https://via.placeholder.com/300",  // Use only the first photo if it's an array
      };
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
