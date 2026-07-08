import { db, isFirebaseEnabled } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  setDoc
} from "firebase/firestore";

// Helper to generate UUIDs when Firebase/Firestore is disabled
const generateUUID = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Client-side local storage fallback helpers
const getLocalData = (key) => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (key, data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Firestore helper check
const runFirestore = async (fn, fallbackFn) => {
  if (isFirebaseEnabled && db) {
    try {
      return await fn();
    } catch (error) {
      console.error("Firestore operation failed, falling back to Local Storage:", error);
      return await fallbackFn();
    }
  }
  return await fallbackFn();
};

export const dbService = {
  // --- CAMPAIGNS ---
  
  async getCampaigns(userId) {
    return runFirestore(
      async () => {
        const snapshot = await getDocs(collection(db, "campaigns"));
        return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(c => c.customerId === userId || c.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      async () => {
        const local = getLocalData("flowbee_campaigns");
        return local
          .filter(c => c.customerId === userId || c.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    );
  },

  async getCampaign(campaignId) {
    return runFirestore(
      async () => {
        const docRef = doc(db, "campaigns", campaignId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      },
      async () => {
        const local = getLocalData("flowbee_campaigns");
        return local.find(c => c.id === campaignId) || null;
      }
    );
  },

  async createCampaign(campaignData) {
    const id = generateUUID();
    const newCampaign = {
      ...campaignData,
      status: campaignData.status || "draft",
      createdAt: new Date().toISOString()
    };

    return runFirestore(
      async () => {
        const docRef = doc(db, "campaigns", id);
        await setDoc(docRef, newCampaign);
        return id;
      },
      async () => {
        const local = getLocalData("flowbee_campaigns");
        const created = { id, ...newCampaign };
        local.push(created);
        setLocalData("flowbee_campaigns", local);
        return id;
      }
    );
  },

  async updateCampaign(campaignId, campaignData) {
    return runFirestore(
      async () => {
        const docRef = doc(db, "campaigns", campaignId);
        await updateDoc(docRef, campaignData);
        return { id: campaignId, ...campaignData };
      },
      async () => {
        const local = getLocalData("flowbee_campaigns");
        const index = local.findIndex(c => c.id === campaignId);
        if (index !== -1) {
          local[index] = { ...local[index], ...campaignData };
          setLocalData("flowbee_campaigns", local);
          return local[index];
        }
        return null;
      }
    );
  },

  async deleteCampaign(campaignId) {
    return runFirestore(
      async () => {
        const docRef = doc(db, "campaigns", campaignId);
        await deleteDoc(docRef);
        
        // Also delete associated products
        const productsQ = query(collection(db, "products"), where("campaignId", "==", campaignId));
        const pSnapshot = await getDocs(productsQ);
        pSnapshot.forEach(async (pDoc) => {
          await deleteDoc(doc(db, "products", pDoc.id));
        });
        
        return true;
      },
      async () => {
        // Delete Campaign
        const campaigns = getLocalData("flowbee_campaigns");
        const filteredCampaigns = campaigns.filter(c => c.id !== campaignId);
        setLocalData("flowbee_campaigns", filteredCampaigns);

        // Delete Products
        const products = getLocalData("flowbee_products");
        const filteredProducts = products.filter(p => p.campaignId !== campaignId);
        setLocalData("flowbee_products", filteredProducts);

        return true;
      }
    );
  },

  // --- PRODUCTS ---

  async getProducts(campaignId) {
    return runFirestore(
      async () => {
        const q = query(
          collection(db, "products"),
          where("campaignId", "==", campaignId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },
      async () => {
        const local = getLocalData("flowbee_products");
        return local
          .filter(p => p.campaignId === campaignId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      }
    );
  },

  async updateProducts(campaignId, productsList) {
    return this.saveProducts(campaignId, productsList);
  },

  async saveProducts(campaignId, productsList) {
    // Overwrites all products for a campaign to maintain correct ordering and sync
    return runFirestore(
      async () => {
        // 1. Delete existing products for the campaign
        const q = query(collection(db, "products"), where("campaignId", "==", campaignId));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(pDoc => deleteDoc(doc(db, "products", pDoc.id)));
        await Promise.all(deletePromises);

        // 2. Add all new products
        const addPromises = productsList.map((product, index) => {
          const id = product.id || generateUUID();
          const docRef = doc(db, "products", id);
          const newProduct = {
            ...product,
            id,
            campaignId,
            sortOrder: index,
            createdAt: product.createdAt || new Date().toISOString()
          };
          return setDoc(docRef, newProduct).then(() => newProduct);
        });
        return await Promise.all(addPromises);
      },
      async () => {
        const local = getLocalData("flowbee_products");
        const filtered = local.filter(p => p.campaignId !== campaignId);
        const saved = productsList.map((product, index) => ({
          ...product,
          id: product.id || generateUUID(),
          campaignId,
          sortOrder: index,
          createdAt: product.createdAt || new Date().toISOString()
        }));
        setLocalData("flowbee_products", [...filtered, ...saved]);
        return saved;
      }
    );
  },

  // --- TEMPLATES ---

  async getTemplates() {
    const seedDefault = async () => {
      const defaultTemplates = [
        {
          id: "hypermarket_offer",
          name: "Hypermarket Offer Template",
          type: "offer_brochure",
          status: "active",
          productsPerPage: 8,
          description: "Perfect for retail supermarkets, hypermarkets, and electronics shops. Optimized for product grids, old/new price comparison, validity badges, and custom branding footer.",
          themeColor: "#dc2626",
          createdAt: new Date().toISOString()
        }
      ];
      return defaultTemplates;
    };

    return runFirestore(
      async () => {
        const snapshot = await getDocs(collection(db, "templates"));
        if (snapshot.empty) {
          const defaults = await seedDefault();
          for (const t of defaults) {
            await setDoc(doc(db, "templates", t.id), t);
          }
          return defaults;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      async () => {
        const local = getLocalData("flowbee_templates");
        if (local.length === 0) {
          const defaults = await seedDefault();
          setLocalData("flowbee_templates", defaults);
          return defaults;
        }
        return local;
      }
    );
  },

  async createTemplate(templateData) {
    const id = templateData.id || generateUUID();
    const newTemplate = {
      ...templateData,
      id,
      createdAt: new Date().toISOString()
    };

    return runFirestore(
      async () => {
        await setDoc(doc(db, "templates", id), newTemplate);
        return newTemplate;
      },
      async () => {
        const local = getLocalData("flowbee_templates");
        local.push(newTemplate);
        setLocalData("flowbee_templates", local);
        return newTemplate;
      }
    );
  },

  async updateTemplate(templateId, templateData) {
    return runFirestore(
      async () => {
        const docRef = doc(db, "templates", templateId);
        await updateDoc(docRef, templateData);
        return { id: templateId, ...templateData };
      },
      async () => {
        const local = getLocalData("flowbee_templates");
        const index = local.findIndex(t => t.id === templateId);
        if (index !== -1) {
          local[index] = { ...local[index], ...templateData };
          setLocalData("flowbee_templates", local);
          return local[index];
        }
        return null;
      }
    );
  },

  async deleteTemplate(templateId) {
    return runFirestore(
      async () => {
        await deleteDoc(doc(db, "templates", templateId));
        return true;
      },
      async () => {
        const local = getLocalData("flowbee_templates");
        const filtered = local.filter(t => t.id !== templateId);
        setLocalData("flowbee_templates", filtered);
        return true;
      }
    );
  }
};
