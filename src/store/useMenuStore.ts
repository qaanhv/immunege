import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

export type MealType = 'Morning' | 'Lunch' | 'Snack';

export interface Dish {
  id: string;
  name: string; // Vietnamese name
  imageUrl: string;
  mealType: MealType;
  ingredients: string[]; // Vietnamese ingredients
  customTags: string[]; // e.g., ["soup", "dry"]
}

export interface PlannedMeal {
  id: string; // unique planning id
  dishId: string;
  dateStr: string; // YYYY-MM-DD
  slot: MealType;
}

export interface GroceryItem {
  id: string;
  name: string;
  crossedOut: boolean;
}

export interface DiaryEntry {
  id: string;
  dateStr: string;
  content: string;
}

export interface FlagIncident {
  id: string;
  dishId: string;
  dishName: string;
  ingredient: string;
  dateStr: string;
  incidentDetails: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface MenuState {
  dishes: Dish[];
  flaggedIngredients: string[];
  plannedMeals: PlannedMeal[];
  groceryItems: GroceryItem[];
  diaryEntries: DiaryEntry[];
  flagIncidents: FlagIncident[];
  notifications: Notification[];
  
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
  
  addDish: (dish: Dish) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  
  toggleIngredientFlag: (ingredient: string) => void;
  flagIngredient: (ingredient: string) => void;
  unflagIngredient: (ingredient: string) => void;
  
  planMeal: (meal: Omit<PlannedMeal, 'id'>) => void;
  unplanMeal: (id: string) => void;
  removePlannedMeal: (id: string) => void;
  
  addGroceryItem: (name: string) => void;
  toggleGroceryItem: (id: string) => void;
  removeGroceryItem: (id: string) => void;

  addDiaryEntry: (content: string) => void;
  removeDiaryEntry: (id: string) => void;
  
  addTagToDish: (dishId: string, tag: string) => void;
  removeTagFromDish: (dishId: string, tag: string) => void;

  addFlagIncident: (incident: Omit<FlagIncident, 'id'>) => void;
  updateFlagIncident: (id: string, updates: Partial<FlagIncident>) => void;
  removeFlagIncident: (id: string) => void;

  currentUser: any | null;
  isLoading: boolean;
  isCloudInitialized: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncWithFirebase: () => Promise<void>;
  forceStopLoading: () => void;
}

const initialDishes: Dish[] = [
  {
    id: "1",
    name: "Phở Bò ",
    mealType: "Morning",
    imageUrl: "https://cdn.eva.vn/upload/3-2023/images/2023-07-13/cach-nau-pho-bo-ha-noi-thom-ngon-chuan-vi-tai-nha-cuc-don-gian-14-1689214964-384-width700height482.jpg",
    ingredients: ["Bánh phở", "Thịt bò", "Hành lá", "Rau mùi"],
    customTags: ["soup", "classic"]
  },
  {
    id: "2",
    name: "Bún Chả Hà Nội",
    mealType: "Morning",
    imageUrl: "https://i-giadinh.vnecdn.net/2023/04/16/Buoc-11-Thanh-pham-11-7068-1681636164.jpg",
    ingredients: ["Bún", "Thịt nướng", "Nước chấm chua ngọt", "Đu đủ xanh", "Hành phi"],
    customTags: ["grilled", "specialty"]
  },
  {
    id: "3",
    name: "Bánh Mì",
    mealType: "Morning",
    imageUrl: "/assets/banh_mi.png",
    ingredients: ["Bánh mì giòn", "Patê gan", "Bơ trứng", "Chả lụa", "Dưa leo"],
    customTags: ["crispy", "popular"]
  },
  {
    id: "4",
    name: "Cơm Tấm Sườn Bì",
    mealType: "Lunch",
    imageUrl: "https://static.vinwonders.com/production/com-tam-sai-gon-2.jpg",
    ingredients: ["Cơm tấm", "Sườn nướng", "Bì thính", "Chả trứng", "Đồ chua"],
    customTags: ["filling", "traditional"]
  },
  {
    id: "5",
    name: "Bánh Xèo",
    mealType: "Lunch",
    imageUrl: "https://vcdn1-dulich.vnecdn.net/2026/03/06/banhxeo1-1772781174-1772781196-6610-1772787154.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=fsGN9U4BVbo4GmLZ4FPOBA",
    ingredients: ["Bột gạo", "Tôm", "Thịt heo", "Giá đỗ", "Rau sống", "Nước mắm chua ngọt"],
    customTags: ["crispy", "savory"]
  },
  {
    id: "6",
    name: "Bún Bò Huế",
    mealType: "Morning",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2024/04/nau-bun-bo-hue-chuan-vi-tai-nha-voi-cot-co-dac-quoc-viet-foods_59b7ba1543004e67967af718d8afc32b.webp",
    ingredients: ["Bún to", "Bắp bò", "Giò heo", "Nước dùng mắm ruốc", "Sả", "Ớt màu"],
    customTags: ["spicy", "soup"]
  },
  {
    id: "7",
    name: "Gỏi Xoài Tôm Thịt",
    mealType: "Snack",
    imageUrl: "https://i-giadinh.vnecdn.net/2021/10/02/nomxoaixanh-1633166804-6598-1633166810.jpg",
    ingredients: [],
    customTags: ["specialty", "central"]
  },
  {
    id: "8",
    name: "Bánh Cuốn Nóng",
    mealType: "Snack",
    imageUrl: "https://img-global.cpcdn.com/recipes/b235f5db0142062d/1200x630cq80/photo.jpg",
    ingredients: [],
    customTags: ["fresh", "healthy"]
  },
  {
    id: "qzh9d2",
    name: "Bánh Da Heo",
    mealType: "Snack",
    imageUrl: "https://i.ytimg.com/vi/HSM5DxcxjkA/maxresdefault.jpg",
    ingredients: [],
    customTags: ["dessert"]
  },
  {
    id: "wxq0fl",
    name: "Bún Thịt Nướng",
    mealType: "Lunch",
    imageUrl: "https://cdn.tgdd.vn/Files/2021/08/11/1374456/cach-lam-bun-tron-thit-nuong-thom-ngon-hap-dan-tai-nha-202201051116113726.jpg",
    ingredients: [],
    customTags: []
  },
  {
    id: "gbrctq",
    name: "Chả Ram",
    mealType: "Lunch",
    imageUrl: "https://dogifood.vn/Images/news/2107301131-cha-gio.webp",
    ingredients: [],
    customTags: []
  },
  {
    id: "ig18t",
    name: "Gỏi Cuốn",
    mealType: "Lunch",
    imageUrl: "https://www.vimishop-vnfoods.com/cdn/shop/articles/240627_1200x1200.jpg?v=1720164521",
    ingredients: [],
    customTags: []
  },
  {
    id: "0x5i95",
    name: "Tiramisu",
    mealType: "Lunch",
    imageUrl: "https://vcdn1-dulich.vnecdn.net/2016/08/23/banhngon2-1471922491.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=JLN0JUIPBwClQeiatvJWQQ",
    ingredients: [],
    customTags: ["dessert"]
  },
  {
    id: "pw4g8s",
    name: "Hot Chocolate",
    mealType: "Morning",
    imageUrl: "https://foodbyjonister.com/wp-content/uploads/2020/11/DirtyHotChocolate3-892x1300.jpg",
    ingredients: [],
    customTags: ["Drink"]
  },
  {
    id: "rmk5zb",
    name: "Bánh Bèo",
    mealType: "Lunch",
    imageUrl: "https://cdn.tgdd.vn/Files/2017/03/21/963426/cach-lam-banh-beo-thom-ngon-202110041645542724.jpg",
    ingredients: [],
    customTags: []
  },
  {
    id: "mxfuqd",
    name: "Bánh Nậm",
    mealType: "Lunch",
    imageUrl: "https://statics.vinpearl.com/banh-nam-hue-12_1631007275.jpg",
    ingredients: [],
    customTags: []
  },
  {
    id: "emod87",
    name: "Bánh Lọc Huế",
    mealType: "Lunch",
    imageUrl: "https://huesmiletravel.com.vn/wp-content/uploads/2024/04/Banh-loc-Hue-1.jpg",
    ingredients: [],
    customTags: []
  },
  {
    id: "tz4pv",
    name: "Bánh Tráng Trộn",
    mealType: "Lunch",
    imageUrl: "https://cdn.tgdd.vn/Files/2017/03/12/959979/cach-lam-banh-trang-tron-tai-nha-ngon-cung-nuoc-sot-dam-vi-202202251706317489.jpg",
    ingredients: [],
    customTags: []
  }
];

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      dishes: initialDishes,
      flaggedIngredients: [],
      plannedMeals: [],
      groceryItems: [],
      diaryEntries: [],
      flagIncidents: [],
      notifications: [],
      currentUser: null,
      isLoading: true,
      isCloudInitialized: false,
      isSyncing: false,
      lastSyncedAt: null,

      showNotification: (message, type = 'success') => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          notifications: [...state.notifications, { id, message, type }]
        }));
        setTimeout(() => get().removeNotification(id), 3000);
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      addDish: (dish) => set((state) => ({ 
        dishes: [...state.dishes, { ...dish, customTags: dish.customTags || [] }] 
      })),
      
      updateDish: (id, updates) => set((state) => ({
        dishes: state.dishes.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      
      removeDish: (id) => set((state) => ({
        dishes: state.dishes.filter(d => d.id !== id),
        plannedMeals: state.plannedMeals.filter(m => m.dishId !== id),
        flagIncidents: state.flagIncidents.filter(inc => inc.dishId !== id)
      })),

      flagIngredient: (ingredient) => set((state) => ({
        flaggedIngredients: Array.from(new Set([...state.flaggedIngredients, ingredient]))
      })),

      unflagIngredient: (ingredient) => set((state) => ({
        flaggedIngredients: state.flaggedIngredients.filter(i => i !== ingredient)
      })),

      toggleIngredientFlag: (ingredient) => set((state) => {
        const isFlagged = state.flaggedIngredients.includes(ingredient);
        return {
          flaggedIngredients: isFlagged 
            ? state.flaggedIngredients.filter(i => i !== ingredient)
            : [...state.flaggedIngredients, ingredient]
        };
      }),

      planMeal: (meal) => set((state) => ({
        plannedMeals: [...state.plannedMeals, { ...meal, id: Math.random().toString(36).substring(7) }]
      })),

      unplanMeal: (id) => set((state) => ({
        plannedMeals: state.plannedMeals.filter(m => m.id !== id)
      })),

      removePlannedMeal: (id) => set((state) => ({
        plannedMeals: state.plannedMeals.filter(m => m.id !== id)
      })),

      addGroceryItem: (name) => {
        const exists = get().groceryItems.some(i => i.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          set((state) => ({
            groceryItems: [...state.groceryItems, { id: Math.random().toString(36).substring(7), name, crossedOut: false }]
          }));
        }
      },

      toggleGroceryItem: (id) => set((state) => ({
        groceryItems: state.groceryItems.map(i => i.id === id ? { ...i, crossedOut: !i.crossedOut } : i)
      })),

      removeGroceryItem: (id) => set((state) => ({
        groceryItems: state.groceryItems.filter(i => i.id !== id)
      })),

      addDiaryEntry: (content) => set((state) => ({
        diaryEntries: [
          { 
            id: Math.random().toString(36).substring(7), 
            content, 
            dateStr: new Date().toISOString().split('T')[0] 
          },
          ...state.diaryEntries
        ]
      })),

      removeDiaryEntry: (id) => set((state) => ({
        diaryEntries: state.diaryEntries.filter(e => e.id !== id)
      })),

      addTagToDish: (dishId, tag) => set((state) => ({
        dishes: state.dishes.map(d => d.id === dishId ? { ...d, customTags: Array.from(new Set([...d.customTags, tag.toLowerCase()])) } : d)
      })),

      removeTagFromDish: (dishId, tag) => set((state) => ({
        dishes: state.dishes.map(d => d.id === dishId ? { ...d, customTags: d.customTags.filter(t => t !== tag) } : d)
      })),

      addFlagIncident: (incident) => set((state) => ({
        flagIncidents: [
          { ...incident, id: Math.random().toString(36).substring(7) },
          ...state.flagIncidents
        ]
      })),

      updateFlagIncident: (id, updates) => set((state) => ({
        flagIncidents: state.flagIncidents.map(inc => inc.id === id ? { ...inc, ...updates } : inc)
      })),

      removeFlagIncident: (id) => set((state) => ({
        flagIncidents: state.flagIncidents.filter(inc => inc.id !== id)
      })),

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithPopup(auth, provider);
          get().showNotification("Logged in successfully!", "success");
        } catch (error: any) {
          console.error("Auth Error:", error);
          set({ isLoading: false });
          get().showNotification(`Login failed: ${error.message}`, "info");
        }
      },

      signOut: async () => {
        try {
          await auth.signOut();
          set({ currentUser: null, dishes: initialDishes, flaggedIngredients: [], groceryItems: [], flagIncidents: [], diaryEntries: [], plannedMeals: [] });
          get().showNotification("Logged out successfully", "info");
        } catch (error) {
          console.error("Sign Out Error:", error);
        }
      },

      syncWithFirebase: async () => {
        const user = get().currentUser;
        if (!user || get().isSyncing) return;
        
        set({ isSyncing: true });
        const state = get();
        try {
          console.log(`Syncing to Cloud for user ${user.uid}...`, { dishes: state.dishes.length });
          await setDoc(doc(db, 'users', user.uid), {
            dishes: state.dishes,
            flaggedIngredients: state.flaggedIngredients,
            plannedMeals: state.plannedMeals,
            groceryItems: state.groceryItems,
            diaryEntries: state.diaryEntries,
            flagIncidents: state.flagIncidents,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          set({ isSyncing: false, lastSyncedAt: new Date().toLocaleTimeString() });
          console.log("Cloud Sync: [SUCCESS]");
        } catch (error: any) {
          console.error("Cloud Sync: [FAILED]", error);
          set({ isSyncing: false });
          get().showNotification(`Cloud Sync Failed: ${error.message}`, "error");
        }
      },

      forceStopLoading: () => {
        console.warn("User-initiated loading stop.");
        set({ isLoading: false });
      }
    }),
    {
      name: 'bepbabe-ledger-storage',
      partialize: (state) => ({ 
        dishes: state.dishes,
        flaggedIngredients: state.flaggedIngredients,
        plannedMeals: state.plannedMeals,
        groceryItems: state.groceryItems,
        diaryEntries: state.diaryEntries,
        flagIncidents: state.flagIncidents
      }),
    }
  )
);

// Global flag to prevent sync loops
let isRemoteUpdate = false;

// Auth Listener & Real-time Sync
let unsubscribe: (() => void) | null = null;
let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

// Note: We DO NOT set isCloudInitialized here. 
// We only want the user to be able to interact, 
// but we still wait for cloud before allowing an upload.
setTimeout(() => {
  const state = useMenuStore.getState();
  if (state.isLoading) {
    console.warn("🏁 Master Safety Timeout: Forcing isLoading to false.");
    useMenuStore.setState({ isLoading: false });
  }
}, 5000);

auth.onAuthStateChanged((user) => {
  if (loadingTimeout) clearTimeout(loadingTimeout);
  
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log("Auth: Previous Firebase listener unsubscribed.");
  }

  if (user) {
    const docRef = doc(db, 'users', user.uid);
    
    // Safety fallback: if cloud doesn't respond in 8 seconds, let user interact anyway
    loadingTimeout = setTimeout(() => {
      const state = useMenuStore.getState();
      if (state.isLoading) {
        useMenuStore.setState({ isLoading: false });
        console.warn("Auth: Data sync timed out, continuing with local data.");
        state.showNotification("Cloud taking too long. Using local ledger for now.", "info");
      }
    }, 8000);

    unsubscribe = onSnapshot(docRef, (docSnap) => {
      const data = docSnap.data();
      const state = useMenuStore.getState();
      
      console.log("📡 Cloud Update Received", { 
        exists: docSnap.exists(), 
        hasPendingWrites: docSnap.metadata.hasPendingWrites,
        isSyncing: state.isSyncing 
      });
      
      // PROTECTION: If we are CURRENTLY sending local changes to the cloud (isSyncing),
      // or if Firestore already knows about our pending writes,
      // DO NOT let the incoming cloud snapshot overwrite our local state.
      if (docSnap.exists() && data && !state.isSyncing && !docSnap.metadata.hasPendingWrites) {
          isRemoteUpdate = true;
          useMenuStore.setState({ 
            currentUser: user,
            dishes: data.dishes || [],
            flaggedIngredients: data.flaggedIngredients || [],
            plannedMeals: data.plannedMeals || [],
            groceryItems: data.groceryItems || [],
            diaryEntries: data.diaryEntries || [],
            flagIncidents: data.flagIncidents || [],
            isLoading: false,
            isCloudInitialized: true,
            lastSyncedAt: new Date().toLocaleTimeString() 
          });
          isRemoteUpdate = false;
          console.log("✅ Cloud Sync: Incoming data applied.");
          if (loadingTimeout) clearTimeout(loadingTimeout);
      } else {
        // Document doesn't exist yet (new user) or we made the change
        if (!docSnap.exists()) {
          console.log("ℹ️ No cloud document found. Initializing as new user.");
          useMenuStore.setState({ isCloudInitialized: true, isLoading: false });
        } else {
          useMenuStore.setState({ isLoading: false });
        }
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    }, (error) => {
      console.error("❌ Snapshot Error:", error);
      useMenuStore.setState({ isLoading: false });
      if (loadingTimeout) clearTimeout(loadingTimeout);
    });
  } else {
    console.log("👤 User is signed out.");
    useMenuStore.setState({ currentUser: null, isLoading: false });
    if (loadingTimeout) clearTimeout(loadingTimeout);
  }
});

// Middleware to auto-sync to Firebase on changes
useMenuStore.subscribe((state, prevState) => {
  // CRITICAL PROTECTION:
  // 1. Only sync if we have a user.
  // 2. Only sync if we have finished our first download (isCloudInitialized).
  // 3. Only sync if the change was NOT caused by an incoming cloud update (isRemoteUpdate).
  if (state.currentUser && state.isCloudInitialized && !isRemoteUpdate) {
    const hasChanged = 
      JSON.stringify(state.dishes) !== JSON.stringify(prevState.dishes) ||
      JSON.stringify(state.flaggedIngredients) !== JSON.stringify(prevState.flaggedIngredients) ||
      JSON.stringify(state.plannedMeals) !== JSON.stringify(prevState.plannedMeals) ||
      JSON.stringify(state.groceryItems) !== JSON.stringify(prevState.groceryItems) ||
      JSON.stringify(state.diaryEntries) !== JSON.stringify(prevState.diaryEntries) ||
      JSON.stringify(state.flagIncidents) !== JSON.stringify(prevState.flagIncidents);

    if (hasChanged) {
      state.syncWithFirebase();
    }
  }
});
