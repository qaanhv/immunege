import React, { useState } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const GroceryLedgerView: React.FC = () => {
  const groceryItems = useMenuStore(state => state.groceryItems);
  const addGroceryItem = useMenuStore(state => state.addGroceryItem);
  const toggleGroceryItem = useMenuStore(state => state.toggleGroceryItem);
  const removeGroceryItem = useMenuStore(state => state.removeGroceryItem);
  
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addGroceryItem(newItemName.trim());
    setNewItemName('');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-structural-b pb-6">
        <h2 className="font-editorial text-4xl mb-2 flex items-center gap-4">
          <ShoppingCart size={32} />
          Grocery Ledger
        </h2>
        <p className="text-gray-500 font-utilitarian text-sm uppercase tracking-widest font-bold">
           {groceryItems.length} Total Registered Items
        </p>
      </header>

      {/* Manual Entry */}
      <form onSubmit={handleAdd} className="flex gap-4 mb-12">
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Manually add generic items (e.g. Paper Towels)..." 
          className="flex-1 bg-transparent border-structural p-4 text-lg focus:outline-none focus:border-[#8A9A5B] transition-colors font-utilitarian"
        />
        <button 
          type="submit"
          disabled={!newItemName.trim()}
          className="bg-[#1A1A1A] text-[#F9F8F6] p-4 uppercase tracking-widest font-bold hover:bg-[#333] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} /> Add to Ledger
        </button>
      </form>

      {/* List */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {groceryItems.length === 0 && (
             <motion.p 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="text-center p-12 text-gray-400 uppercase tracking-widest font-bold border-structural border-dashed"
             >
               Ledger is empty.
             </motion.p>
          )}
          {groceryItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={clsx(
                "flex justify-between items-center p-4 border-structural transition-all duration-300 group",
                item.crossedOut ? "bg-gray-100 text-gray-400" : "bg-white hover:border-[#8A9A5B]"
              )}
            >
              <button 
                onClick={() => toggleGroceryItem(item.id)}
                className="flex-1 text-left flex items-center gap-4"
              >
                <div className={clsx(
                  "w-5 h-5 border-structural flex items-center justify-center transition-colors",
                  item.crossedOut ? "bg-[#1A1A1A]" : ""
                )}>
                   {item.crossedOut && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className={clsx("font-bold uppercase tracking-wider text-sm", item.crossedOut ? "line-through decoration-2" : "")}>
                  {item.name}
                </span>
              </button>
              
              <button 
                onClick={() => removeGroceryItem(item.id)}
                className="text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 transition-all border-structural-l pointer-events-none group-hover:pointer-events-auto"
                title="Remove from ledger entirely"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
