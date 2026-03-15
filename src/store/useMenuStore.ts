import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  type: 'success' | 'info';
}

export interface MenuState {
  dishes: Dish[];
  flaggedIngredients: string[];
  plannedMeals: PlannedMeal[];
  groceryItems: GroceryItem[];
  diaryEntries: DiaryEntry[];
  flagIncidents: FlagIncident[];
  notifications: Notification[];
  
  showNotification: (message: string, type?: 'success' | 'info') => void;
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncWithFirebase: () => Promise<void>;
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
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      },

      signOut: async () => {
        await auth.signOut();
        set({ currentUser: null, dishes: initialDishes, flaggedIngredients: [], groceryItems: [], flagIncidents: [], diaryEntries: [], plannedMeals: [] });
      },

      syncWithFirebase: async () => {
        const user = get().currentUser;
        if (!user) return;
        const state = get();
        await setDoc(doc(db, 'users', user.uid), {
          dishes: state.dishes,
          flaggedIngredients: state.flaggedIngredients,
          plannedMeals: state.plannedMeals,
          groceryItems: state.groceryItems,
          diaryEntries: state.diaryEntries,
          flagIncidents: state.flagIncidents,
          updatedAt: new Date().toISOString()
        });
      }
    }),
    {
      name: 'immunege-ledger-storage',
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

// Auth Listener & Real-time Sync
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      useMenuStore.setState({ 
        currentUser: user,
        dishes: data.dishes || [],
        flaggedIngredients: data.flaggedIngredients || [],
        plannedMeals: data.plannedMeals || [],
        groceryItems: data.groceryItems || [],
        diaryEntries: data.diaryEntries || [],
        flagIncidents: data.flagIncidents || [],
        isLoading: false
      });
    } else {
      useMenuStore.setState({ currentUser: user, isLoading: false });
    }
  } else {
    useMenuStore.setState({ currentUser: null, isLoading: false });
  }
});

// Middleware to auto-sync to Firebase on changes
useMenuStore.subscribe((state, prevState) => {
  if (state.currentUser && JSON.stringify(state.dishes) !== JSON.stringify(prevState.dishes)) {
     // We can add a debounced sync here if needed
     state.syncWithFirebase();
  }
});
