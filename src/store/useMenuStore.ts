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
    id: '1',
    name: 'Phở Bò MáiTơ',
    mealType: 'Morning',
    imageUrl: '/assets/pho_bo.png',
    ingredients: ['Bánh phở', 'Thịt bò', 'Nước dùng lâu năm', 'Hành lá', 'Rau mùi'],
    customTags: ['soup', 'classic']
  },
  {
    id: '2',
    name: 'Bún Chả Hà Nội',
    mealType: 'Lunch',
    imageUrl: '/assets/bun_cha.png',
    ingredients: ['Bún', 'Thịt nướng', 'Nước chấm chua ngọt', 'Đu đủ xanh', 'Hành phi'],
    customTags: ['grilled', 'specialty']
  },
  {
    id: '3',
    name: 'Bánh Mì Sài Gòn',
    mealType: 'Morning',
    imageUrl: '/assets/banh_mi.png',
    ingredients: ['Bánh mì giòn', 'Patê gan', 'Bơ trứng', 'Chả lụa', 'Dưa leo'],
    customTags: ['crispy', 'popular']
  },
  {
    id: '4',
    name: 'Cơm Tấm Sườn Bì',
    mealType: 'Lunch',
    imageUrl: '/assets/com_tam.png',
    ingredients: ['Cơm tấm', 'Sườn nướng', 'Bì thính', 'Chả trứng', 'Đồ chua'],
    customTags: ['filling', 'traditional']
  },
  {
    id: '5',
    name: 'Bánh Xèo Giòn Rụm',
    mealType: 'Lunch',
    imageUrl: 'C:/Users/DELL/.gemini/antigravity/brain/5ddb1a8c-dd76-4345-b1b2-b07af796c69d/banh_xeo_generated_1773501550991.png',
    ingredients: ['Bột gạo', 'Tôm', 'Thịt heo', 'Giá đỗ', 'Rau sống', 'Nước mắm chua ngọt'],
    customTags: ['crispy', 'savory']
  },
  {
    id: '6',
    name: 'Bún Bò Huế Cay Nồng',
    mealType: 'Morning',
    imageUrl: 'C:/Users/DELL/.gemini/antigravity/brain/5ddb1a8c-dd76-4345-b1b2-b07af796c69d/bun_bo_hue_generated_1773501568493.png',
    ingredients: ['Bún to', 'Bắp bò', 'Giò heo', 'Nước dùng mắm ruốc', 'Sả', 'Ớt màu'],
    customTags: ['spicy', 'soup']
  },
  {
    id: '7',
    name: 'Cao Lầu Hội An',
    mealType: 'Lunch',
    imageUrl: 'C:/Users/DELL/.gemini/antigravity/brain/5ddb1a8c-dd76-4345-b1b2-b07af796c69d/cao_lau_generated_1773501586593.png',
    ingredients: ['Mì cao lầu', 'Xá xíu', 'Ram giòn', 'Rau Trà Quế', 'Nước xốt đậm đà'],
    customTags: ['specialty', 'central']
  },
  {
    id: '8',
    name: 'Gỏi Cuốn Tôm Thịt',
    mealType: 'Snack',
    imageUrl: 'C:/Users/DELL/.gemini/antigravity/brain/5ddb1a8c-dd76-4345-b1b2-b07af796c69d/goi_cuon_generated_1773495526012.png',
    ingredients: ['Bánh tráng', 'Tôm', 'Thịt luộc', 'Bún', 'Hẹ', 'Tương đen'],
    customTags: ['fresh', 'healthy']
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
