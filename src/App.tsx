import React, { useState, useMemo } from 'react';
import { useMenuStore, Dish } from './store/useMenuStore';
import { DishCard } from './components/DishCard';
import { AddDishPanel } from './components/AddDishPanel';
import { MealPlannerView } from './components/MealPlannerView';
import { GroceryLedgerView } from './components/GroceryLedgerView';
import { MiniDiaryView } from './components/MiniDiaryView';
import { DishDetailPanel } from './components/DishDetailPanel';
import { FlagLedgerView } from './components/FlagLedgerView';
import { SettingsView } from './components/SettingsView';
import { 
  Plus, 
  Calendar, 
  ShoppingCart, 
  Search,
  PenLine,
  UtensilsCrossed,
  ShieldAlert,
  Check,
  X,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type View = 'Menu' | 'Planner' | 'Grocery' | 'Diary' | 'Flagged' | 'Settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Menu');
  const [activeMealType, setActiveMealType] = useState<'All' | 'Morning' | 'Lunch' | 'Snack'>('All');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const dishes = useMenuStore((state) => state.dishes);
  const notifications = useMenuStore((state) => state.notifications);
  const removeNotification = useMenuStore((state) => state.removeNotification);
  const currentUser = useMenuStore((state) => state.currentUser);
  const signInWithGoogle = useMenuStore((state) => state.signInWithGoogle);
  const signOut = useMenuStore((state) => state.signOut);

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesType = activeMealType === 'All' || dish.mealType === activeMealType;
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            dish.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            dish.customTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [dishes, activeMealType, searchQuery]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-utilitarian selection:bg-[#8A9A5B]/20">
      
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex w-64 h-screen sticky top-0 bg-white border-structural-r p-8 flex-col justify-between z-30 shadow-sm">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-1">
            <h1 className="font-editorial text-4xl leading-none tracking-tight">IMMUNEGE</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-editorial italic text-lg text-[#8A9A5B] leading-none">for Quynh Anh</span>
              <button onClick={() => setIsDiaryOpen(true)} className="text-gray-300 hover:text-[#1A1A1A] transition-colors"><PenLine size={12} /></button>
            </div>
          </div>

          {!currentUser ? (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-3 px-4 py-3 bg-[#f2f2f2] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest border border-dashed border-gray-300 hover:border-[#8A9A5B] transition-all"
            >
              <LogIn size={14} className="text-[#8A9A5B]" /> Login for Cloud Sync
            </button>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 bg-[#F9F8F6] border border-structural">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#8A9A5B]">
                  <img src={currentUser.photoURL} alt="user" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tight truncate max-w-[80px]">{currentUser.displayName.split(' ')[0]}</span>
              </div>
              <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={12} /></button>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <NavItem active={activeView === 'Menu'} onClick={() => { setActiveView('Menu'); setActiveMealType('All'); }} icon={<UtensilsCrossed size={18}/>} label="Menu" />
              <AnimatePresence>
                {activeView === 'Menu' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col pl-9 mt-2 gap-2 overflow-hidden">
                    {['All', 'Morning', 'Lunch', 'Snack'].map((type) => (
                      <button key={type} onClick={() => setActiveMealType(type as any)} className={`text-[10px] text-left font-bold uppercase tracking-widest transition-colors ${activeMealType === type ? 'text-[#8A9A5B]' : 'text-gray-400 hover:text-[#1A1A1A]'}`}>{type}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavItem active={activeView === 'Planner'} onClick={() => setActiveView('Planner')} icon={<Calendar size={18}/>} label="Planner" />
            <NavItem active={activeView === 'Grocery'} onClick={() => setActiveView('Grocery')} icon={<ShoppingCart size={18}/>} label="Groceries" />
            <NavItem active={activeView === 'Flagged'} onClick={() => setActiveView('Flagged')} icon={<ShieldAlert size={18}/>} label="Flag Ledger" />
            <NavItem active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} icon={<Settings size={18}/>} label="Storage" />
          </div>

          {activeView === 'Menu' && (
            <div className="pt-6 border-t border-structural">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" />
                <input type="text" placeholder="Find a dish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border-structural text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-[#8A9A5B] transition-all" />
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setIsAddPanelOpen(true)} className="w-full flex items-center justify-center gap-3 bg-[#1A1A1A] text-white p-4 font-bold uppercase tracking-[0.2em] text-[10px] border-structural hover:bg-[#8A9A5B] transition-all shadow-xl active:scale-95"><Plus size={16} /> New Entry</button>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-structural-b sticky top-0 z-40">
        <div className="flex flex-col">
          <h1 className="font-editorial text-2xl leading-none">IMMUNEGE</h1>
          <span className="font-editorial italic text-xs text-[#8A9A5B]">for Quynh Anh</span>
        </div>
        <div className="flex gap-2 items-center">
          {!currentUser ? (
            <button 
              onClick={signInWithGoogle}
              className="p-2 border-structural text-[#8A9A5B] hover:bg-gray-50 transition-all"
              title="Login"
            >
              <LogIn size={18} />
            </button>
          ) : (
            <button 
              onClick={signOut}
              className="w-8 h-8 rounded-full overflow-hidden border border-[#8A9A5B] active:scale-90 transition-transform"
            >
              <img src={currentUser.photoURL} alt="user" className="w-full h-full object-cover" />
            </button>
          )}
          <button onClick={() => setIsDiaryOpen(true)} className="p-2 border-structural"><PenLine size={18} /></button>
          <button onClick={() => setIsAddPanelOpen(true)} className="bg-[#1A1A1A] text-white p-2 border-structural"><Plus size={18} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-14 overflow-y-auto max-h-screen pb-24 md:pb-14">
        {/* Mobile Filter Pills (Sticky) */}
        {activeView === 'Menu' && (
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            {['All', 'Morning', 'Lunch', 'Snack'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveMealType(type as any)}
                className={clsx(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                  activeMealType === type ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-gray-400 border-structural"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeView === 'Menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onSelect={(d) => setSelectedDish(d)} />
              ))}
              {filteredDishes.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-300 uppercase tracking-widest font-bold text-sm italic">No entries match your search.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'Planner' && <div key="planner"><MealPlannerView /></div>}
          {activeView === 'Grocery' && <div key="grocery"><GroceryLedgerView /></div>}
          {activeView === 'Flagged' && <div key="flagged"><FlagLedgerView /></div>}
          {activeView === 'Settings' && <div key="settings"><SettingsView /></div>}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-structural flex justify-around p-3 z-40 pb-safe">
        <MobileNavItem active={activeView === 'Menu'} onClick={() => setActiveView('Menu')} icon={<UtensilsCrossed size={18}/>} />
        <MobileNavItem active={activeView === 'Planner'} onClick={() => setActiveView('Planner')} icon={<Calendar size={18}/>} />
        <MobileNavItem active={activeView === 'Grocery'} onClick={() => setActiveView('Grocery')} icon={<ShoppingCart size={18}/>} />
        <MobileNavItem active={activeView === 'Flagged'} onClick={() => setActiveView('Flagged')} icon={<ShieldAlert size={18}/>} />
        <MobileNavItem active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} icon={<Settings size={18}/>} />
      </div>

      {/* Side Over Panels */}
      <AddDishPanel isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} />
      <MiniDiaryView isOpen={isDiaryOpen} onClose={() => setIsDiaryOpen(false)} />
      <DishDetailPanel dish={selectedDish} onClose={() => setSelectedDish(null)} />

      {/* Persistence Notifications (Toasts) */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={clsx(
                "pointer-events-auto flex items-center gap-3 px-5 py-3 shadow-2xl border font-bold uppercase tracking-widest text-[10px]",
                n.type === 'success' ? "bg-[#1A1A1A] text-white border-structural" : "bg-white text-[#1A1A1A] border-structural"
              )}
            >
              {n.type === 'success' && <Check size={14} className="text-[#8A9A5B]" />}
              {n.message}
              <button 
                onClick={() => removeNotification(n.id)}
                className="ml-2 pl-2 border-l border-white/20 hover:text-[#8A9A5B] transition-colors"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 py-1 px-1 text-[11px] font-bold uppercase tracking-[0.1em] transition-all group ${active ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
  >
    <span className={active ? 'text-[#8A9A5B]' : 'group-hover:text-[#1A1A1A] transition-colors'}>{icon}</span>
    <span className={clsx(active ? 'border-b border-[#1A1A1A]' : '', "whitespace-nowrap")}>{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={clsx(
      "p-3 rounded-xl transition-all",
      active ? "bg-[#1A1A1A] text-white shadow-lg -translate-y-2" : "text-gray-400"
    )}
  >
    {icon}
  </button>
);

export default App;
