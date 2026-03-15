import React, { memo } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface IngredientTagProps {
  ingredient: string;
}

export const IngredientTag: React.FC<IngredientTagProps> = memo(({ ingredient }) => {
  const flaggedIngredients = useMenuStore((state) => state.flaggedIngredients);
  const flagIngredient = useMenuStore((state) => state.flagIngredient);
  const unflagIngredient = useMenuStore((state) => state.unflagIngredient);
  const addGroceryItem = useMenuStore((state) => state.addGroceryItem);
  const showNotification = useMenuStore((state) => state.showNotification);

  const isFlagged = flaggedIngredients.includes(ingredient);

  const handleToggleFlag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlagged) {
      unflagIngredient(ingredient);
    } else {
      flagIngredient(ingredient);
    }
  };

  const handleAddToGrocery = (e: React.MouseEvent) => {
    e.stopPropagation();
    addGroceryItem(ingredient);
    showNotification(`Added ${ingredient} to groceries`, 'success');
  };

  return (
    <div 
      className={clsx(
        "group/ing inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-utilitarian uppercase tracking-widest border-structural transition-all duration-150",
        isFlagged 
          ? "bg-[#FF5722] text-[#F9F8F6] border-[#FF5722]" 
          : "bg-[#F9F8F6] text-[#1A1A1A] hover:bg-gray-100"
      )}
    >
      <button 
        onClick={handleToggleFlag}
        className={clsx(
          "font-bold transition-all",
          isFlagged ? "line-through decoration-2" : "hover:text-[#8A9A5B]"
        )}
      >
        {ingredient}
      </button>

      {!isFlagged && (
        <button 
          onClick={handleAddToGrocery}
          className="text-gray-300 hover:text-[#1A1A1A] transition-colors"
          title="Add to Groceries"
        >
          <Plus size={10} />
        </button>
      )}

      {isFlagged && (
        <X size={10} className="text-[#F9F8F6] opacity-50" />
      )}
    </div>
  );
});
