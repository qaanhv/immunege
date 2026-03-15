import React, { useMemo } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MealPlannerView: React.FC = () => {
  const plannedMeals = useMenuStore(state => state.plannedMeals);
  const unplanMeal = useMenuStore(state => state.unplanMeal);
  const dishes = useMenuStore(state => state.dishes);

  // Group by Date, then sort dates
  const groupedMeals = useMemo(() => {
    const groups: Record<string, typeof plannedMeals> = {};
    plannedMeals.forEach(plan => {
      if (!groups[plan.dateStr]) groups[plan.dateStr] = [];
      groups[plan.dateStr].push(plan);
    });
    
    // Sort ascending by date string
    return Object.fromEntries(
      Object.entries(groups).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    );
  }, [plannedMeals]);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="mb-12 border-structural-b pb-6">
        <h2 className="font-editorial text-4xl mb-2 flex items-center gap-4">
          <Calendar size={32} />
          Meal Planner
        </h2>
        <p className="text-gray-500 font-utilitarian text-sm uppercase tracking-widest font-bold">
           Scheduling Timeline
        </p>
      </header>

      <div className="flex flex-col gap-12">
        {Object.keys(groupedMeals).length === 0 ? (
           <div className="p-12 text-center text-gray-400 uppercase tracking-widest font-bold border-structural border-dashed">
             No meals planned. Browse the directory to start scheduling.
           </div>
        ) : (
          Object.entries(groupedMeals).map(([dateStr, plans]) => (
            <div key={dateStr} className="flex flex-col md:flex-row gap-6">
              
              {/* Date Column */}
              <div className="w-full md:w-48 flex-shrink-0 border-structural-b md:border-b-0 md:border-r pr-6 md:pb-6">
                 <h3 className="font-editorial text-3xl sticky top-24 pt-2 mb-2">
                   {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </h3>
                 <p className="text-xs font-utilitarian uppercase tracking-widest text-[#8A9A5B] font-bold">
                   {plans.length} Planned
                 </p>
              </div>

              {/* Meals Feed for this Date */}
              <div className="flex-1 flex flex-col gap-4">
                <AnimatePresence>
                  {/* Sort slots Morning -> Lunch -> Snack */}
                  {[...plans].sort((a,b) => {
                     const order = { 'Morning': 1, 'Lunch': 2, 'Snack': 3 };
                     return order[a.slot] - order[b.slot];
                  }).map(plan => {
                    const dish = dishes.find(d => d.id === plan.dishId);
                    if (!dish) return null;

                    return (
                      <motion.div 
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-structural flex overflow-hidden group bg-white"
                      >
                         {/* Image thumbnail */}
                         <div className="w-32 h-32 hidden sm:block border-structural-r">
                           <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover grayscale-[0.2]" />
                         </div>
                         
                         <div className="flex-1 p-4 flex flex-col justify-between">
                           <div className="flex justify-between items-start">
                             <div>
                               <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A9A5B] block mb-1">
                                 {plan.slot}
                               </span>
                               <h4 className="font-editorial text-xl">{dish.name}</h4>
                             </div>
                             
                             <button 
                               onClick={() => unplanMeal(plan.id)}
                               className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                               title="Remove from planner"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                           
                           <div className="text-xs uppercase tracking-widest text-gray-400 font-utilitarian truncate max-w-md">
                             {dish.ingredients.join(', ')}
                           </div>
                         </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};
