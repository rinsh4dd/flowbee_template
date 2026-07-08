import { auth, isFirebaseEnabled } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged
} from "firebase/auth";

// A fallback mock state for Sandbox Mode
let mockUser = null;
const mockListeners = new Set();

const triggerMockListeners = (user) => {
  mockListeners.forEach(listener => listener(user));
};

export const authService = {
  getCurrentUser() {
    if (isFirebaseEnabled && auth) {
      // In Firebase mode, get local storage cached user metadata or current user if available
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("flowbee_user");
        return stored ? JSON.parse(stored) : null;
      }
      return auth.currentUser;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowbee_user");
      return stored ? JSON.parse(stored) : null;
    }
    return mockUser;
  },

  subscribeToAuthChanges(callback) {
    if (isFirebaseEnabled && auth) {
      return onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const { db } = await import("./firebase");
            const { doc, getDoc, setDoc } = await import("firebase/firestore");
            
            if (db) {
              const userRef = doc(db, "users", currentUser.uid);
              const userSnap = await getDoc(userRef);
              let role = "user";
              
              if (userSnap.exists()) {
                role = userSnap.data().role || "user";
              } else {
                // Seeding: Automatically assign "admin" role if the email contains "admin"
                role = currentUser.email && currentUser.email.toLowerCase().includes("admin") ? "admin" : "user";
                await setDoc(userRef, {
                  email: currentUser.email,
                  role: role,
                  createdAt: new Date().toISOString()
                });
              }

              const enrichedUser = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split("@")[0],
                role: role
              };

              // Cache user info in local storage for instant layout checking on route changes
              if (typeof window !== "undefined") {
                localStorage.setItem("flowbee_user", JSON.stringify(enrichedUser));
              }

              callback(enrichedUser);
            } else {
              throw new Error("Firestore not initialized");
            }
          } catch (error) {
            console.error("Error retrieving user role details:", error);
            const basicUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split("@")[0],
              role: currentUser.email && currentUser.email.toLowerCase().includes("admin") ? "admin" : "user"
            };
            callback(basicUser);
          }
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("flowbee_user");
          }
          callback(null);
        }
      });
    }
    
    // Local storage / Sandbox Mode fallback subscription
    let initialUser = null;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowbee_user");
      initialUser = stored ? JSON.parse(stored) : null;
    }
    callback(initialUser);
    
    mockListeners.add(callback);
    return () => {
      mockListeners.delete(callback);
    };
  },

  async login(email, password) {
    if (isFirebaseEnabled && auth) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Retrieve the role from firestore doc
      const { db } = await import("./firebase");
      const { doc, getDoc, setDoc } = await import("firebase/firestore");
      let role = "user";
      
      if (db) {
        const userRef = doc(db, "users", credential.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          role = userSnap.data().role || "user";
        } else {
          role = email.toLowerCase().includes("admin") ? "admin" : "user";
          await setDoc(userRef, {
            email: email,
            role: role,
            createdAt: new Date().toISOString()
          });
        }
      }

      const enrichedUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || email.split("@")[0],
        role: role
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("flowbee_user", JSON.stringify(enrichedUser));
      }

      return enrichedUser;
    }
    
    // Sandbox Mode Fallback
    if (password.length >= 6) {
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";
      const user = {
        uid: "local-user-id-12345",
        email: email,
        displayName: email.split("@")[0],
        role: role
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("flowbee_user", JSON.stringify(user));
      }
      mockUser = user;
      triggerMockListeners(user);
      return user;
    } else {
      throw new Error("Password must be at least 6 characters (Offline Sandbox Mode requirement)");
    }
  },

  async register(email, password) {
    if (isFirebaseEnabled && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Register role in Firestore
      const { db } = await import("./firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";
      
      if (db) {
        await setDoc(doc(db, "users", credential.user.uid), {
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });
      }

      const enrichedUser = {
        uid: credential.user.uid,
        email: email,
        displayName: email.split("@")[0],
        role: role
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("flowbee_user", JSON.stringify(enrichedUser));
      }

      return enrichedUser;
    }
    
    // Sandbox Mode Fallback
    if (password.length >= 6) {
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";
      const user = {
        uid: "local-user-id-12345",
        email: email,
        displayName: email.split("@")[0],
        role: role
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("flowbee_user", JSON.stringify(user));
      }
      mockUser = user;
      triggerMockListeners(user);
      return user;
    } else {
      throw new Error("Password must be at least 6 characters (Offline Sandbox Mode requirement)");
    }
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flowbee_user");
    }
    mockUser = null;
    triggerMockListeners(null);

    if (isFirebaseEnabled && auth) {
      await fbSignOut(auth);
    }
  }
};
