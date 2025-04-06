import { ref, onDisconnect, set, serverTimestamp } from "firebase/database";
import { realtimeDB, auth } from "@/lib/firebaseConfig";

export const trackUserPresence = () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userStatusRef = ref(realtimeDB, `users/${user.uid}/status`);

            // Set user online
            set(userStatusRef, {
                state: "online",
                lastChanged: serverTimestamp(),
            });

            // Handle disconnect: Set user offline
            onDisconnect(userStatusRef).set({
                state: "offline",
                lastChanged: serverTimestamp(),
            });
        }
    });
};
