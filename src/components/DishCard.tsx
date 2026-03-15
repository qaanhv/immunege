import React, { memo } from 'react';
import { Dish, useMenuStore } from '../store/useMenuStore';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onSelect: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = memo(({ dish, onSelect }) => {
  const flaggedIngredients = useMenuStore((state) => state.flaggedIngredients);
  const dishHasFlagged = dish.ingredients.some(ing => flaggedIngredients.includes(ing));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(dish)}
      className={`group relative flex flex-col bg-white border-structural overflow-hidden h-fit transition-shadow duration-200 hover:shadow-lg cursor-pointer ${dishHasFlagged ? "opacity-95" : ""}`}
    >
      {/* Photo Header */}
      <div className="relative aspect-[4/3] overflow-hidden border-structural-b bg-gray-50 flex-shrink-0">
        <img 
          src={dish.imageUrl} 
          alt={dish.name}
          className="w-full h-full object-cover saturate-[1.1] contrast-[1.1] sepia-[0.05] transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {dishHasFlagged && (
            <div className="bg-[#FF5722] text-[#F9F8F6] px-1.5 py-0.5 flex items-center gap-1 font-bold uppercase tracking-widest text-[8px] border-structural border-[#FF5722]">
              <AlertOctagon size={10} />
              <span>Flagged</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Fixed height for grid uniformity */}
      <div className="p-3 md:p-4 flex flex-col gap-1.5 h-24 justify-between bg-white">
        <div className="flex justify-between items-start overflow-hidden">
          <h3 className="font-editorial text-xl md:text-2xl leading-none group-hover:text-[#8A9A5B] transition-colors truncate w-full" title={dish.name}>
            {dish.name}
          </h3>
        </div>
        
        {/* Subtle Category and Tags */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8A9A5B] flex-shrink-0">
            {dish.mealType}
          </span>
          <div className="flex flex-nowrap gap-1 overflow-hidden">
            {dish.customTags?.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="text-[8px] uppercase font-bold tracking-widest text-gray-300 truncate"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
