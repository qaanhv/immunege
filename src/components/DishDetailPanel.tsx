import React, { useState, useEffect } from 'react';
import { Dish, useMenuStore, MealType } from '../store/useMenuStore';
import { IngredientTag } from './IngredientTag';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit3, Save, CalendarPlus, Plus, AlertOctagon, ShieldAlert, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface DishDetailPanelProps {
  dish: Dish | null;
  onClose: () => void;
}

export const DishDetailPanel: React.FC<DishDetailPanelProps> = ({ dish, onClose }) => {
  const updateDish = useMenuStore(state => state.updateDish);
  const removeDish = useMenuStore(state => state.removeDish);
  const planMeal = useMenuStore(state => state.planMeal);
  const addTagToDish = useMenuStore(state => state.addTagToDish);
  const removeTagFromDish = useMenuStore(state => state.removeTagFromDish);
  const flaggedIngredients = useMenuStore(state => state.flaggedIngredients);
  const addFlagIncident = useMenuStore(state => state.addFlagIncident);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMealType, setEditMealType] = useState<MealType>('Lunch');
  const [editIngredients, setEditIngredients] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [planSlot, setPlanSlot] = useState<MealType>('Lunch');

  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Incident Recording
  const [incidentIng, setIncidentIng] = useState<string | null>(null);
  const [incidentDetails, setIncidentDetails] = useState('');

  useEffect(() => {
    if (dish) {
      setEditName(dish.name);
      setEditMealType(dish.mealType);
      setEditIngredients(dish.ingredients.join(', '));
      setEditImageUrl(dish.imageUrl);
      setIsEditing(false);
      setIsPlanningOpen(false);
      setShowDeleteConfirm(false);
      setIncidentIng(null);
    }
  }, [dish]);

  if (!dish) return null;

  const dishHasFlagged = dish.ingredients.some(ing => flaggedIngredients.includes(ing));
  const handleSave = () => {
    updateDish(dish.id, {
      name: editName,
      mealType: editMealType,
      ingredients: editIngredients.split(',').map(i => i.trim()).filter(Boolean),
      imageUrl: editImageUrl
    });
    setIsEditing(false);
  };

  const handleGenerateImage = () => {
    if (!editName) return;
    setIsImageGenerating(true);
    setTimeout(() => {
      const n = editName.toLowerCase();
      let path = '';
      
      if (n.includes('phở') || n.includes('pho')) path = '/assets/pho_bo.png';
      else if (n.includes('bún chả') || n.includes('bun cha')) path = '/assets/bun_cha.png';
      else if (n.includes('bánh mì') || n.includes('banh mi')) path = '/assets/banh_mi.png';
      else if (n.includes('cơm tấm') || n.includes('com tam')) path = '/assets/com_tam.png';
      else if (n.includes('bún bò') || n.includes('bun bo')) path = '/assets/bun_bo_hue.png';
      else if (n.includes('bánh xèo') || n.includes('banh xeo')) path = '/assets/banh_xeo.png';
      else if (n.includes('cao lầu') || n.includes('cao lau')) path = '/assets/cao_lau.png';
      else if (n.includes('gỏi cuốn') || n.includes('goi cuon') || n.includes('spring roll')) path = '/assets/goi_cuon.png';
      else {
        path = `https://loremflickr.com/800/600/vietnamese,food,cooking,${encodeURIComponent(editName)}/all`;
      }

      setEditImageUrl(path);
      setIsImageGenerating(false);
    }, 1200);
  };

  const handleDelete = () => {
    removeDish(dish.id);
    onClose();
  };

  const handlePlanSubmit = () => {
    planMeal({ dishId: dish.id, dateStr: planDate, slot: planSlot });
    setIsPlanningOpen(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTagToDish(dish.id, newTag.trim());
      setNewTag('');
    }
  };

  const submitIncident = () => {
    if (!incidentIng) return;
    addFlagIncident({
      dishId: dish.id,
      dishName: dish.name,
      ingredient: incidentIng,
      dateStr: new Date().toISOString().split('T')[0],
      incidentDetails: incidentDetails.trim() || 'No details provided.'
    });
    useMenuStore.getState().showNotification(`Recorded incident for ${incidentIng}`, 'success');
    setIncidentIng(null);
    setIncidentDetails('');
  };

  return (
    <AnimatePresence>
      {dish && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A1A] z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#F9F8F6] border-l border-structural z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex justify-between items-center border-structural-b bg-white">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A9A5B] bg-gray-100 px-2 py-1 border border-gray-200">
                  {dish.mealType}
                </span>
                {dishHasFlagged && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-[#FF5722] text-white px-2 py-1 flex items-center gap-1">
                    <AlertOctagon size={12} /> Contains Flagged
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 border border-transparent hover:border-structural transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Image Section */}
              <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden border-structural-b bg-gray-100 relative group">
                <img src={isEditing ? editImageUrl : dish.imageUrl} alt={dish.name} className="w-full h-full object-cover saturate-[1.1] contrast-[1.1] sepia-[0.05] transition-transform duration-700 group-hover:scale-105" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isImageGenerating}
                      className="bg-white/90 hover:bg-white text-[#1A1A1A] px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl border border-structural disabled:opacity-50"
                    >
                      {isImageGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-[#8A9A5B]" />}
                      {isImageGenerating ? 'Generating...' : 'Regenerate with AI'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col gap-10 text-[#1A1A1A]">
                {/* Title & Edit Trigger */}
                <div className="flex justify-between items-start gap-4">
                  {!isEditing ? (
                    <h2 className="font-editorial text-4xl md:text-5xl leading-tight">{dish.name}</h2>
                  ) : (
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 font-editorial text-4xl bg-transparent border-structural-b focus:outline-none focus:border-[#8A9A5B]"
                    />
                  )}
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border-structural transition-all",
                      isEditing ? "bg-[#8A9A5B] text-white" : "bg-white hover:bg-gray-100"
                    )}
                  >
                    {isEditing ? <><Save size={14}/> Save</> : <><Edit3 size={14}/> Edit</>}
                  </button>
                </div>

                {/* Edit Form Fields */}
                {isEditing && (
                  <div className="flex flex-col gap-6 p-6 border-structural border-dashed">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Meal Category</label>
                      <div className="flex gap-2">
                        {(['Morning', 'Lunch', 'Snack'] as MealType[]).map(type => (
                          <button 
                            key={type}
                            onClick={() => setEditMealType(type)}
                            className={clsx(
                              "flex-1 py-2 text-[10px] font-bold uppercase border-structural",
                              editMealType === type ? "bg-[#1A1A1A] text-white" : "bg-white hover:bg-gray-100"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Imagery Source (URL)</label>
                      <div className="relative">
                        <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text"
                          value={editImageUrl}
                          onChange={e => setEditImageUrl(e.target.value)}
                          placeholder="Paste image URL here..."
                          className="w-full pl-9 pr-3 py-2 bg-transparent border-structural text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#8A9A5B] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Ingredients (Comma separated)</label>
                      <textarea 
                        value={editIngredients}
                        onChange={e => setEditIngredients(e.target.value)}
                        className="w-full h-24 p-3 bg-transparent border-structural text-sm outline-none focus:border-[#8A9A5B] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Tags Management */}
                {!isEditing && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Custom Labels</p>
                      <form onSubmit={handleAddTag} className="flex gap-1">
                        <input 
                          value={newTag} onChange={e => setNewTag(e.target.value)}
                          placeholder="Add label..."
                          className="text-[10px] bg-transparent border-structural-b px-1 py-0.5 outline-none focus:border-[#8A9A5B]"
                        />
                        <button type="submit" className="text-gray-400 hover:text-[#1A1A1A]"><Plus size={12}/></button>
                      </form>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dish.customTags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold bg-gray-100 border border-gray-200 text-gray-500">
                          {tag}
                          <button onClick={() => removeTagFromDish(dish.id, tag)} className="hover:text-red-500 ml-1"><X size={10}/></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredient Ledger */}
                {!isEditing && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 pb-2 border-structural-b">Ingredient Ledger</p>
                    <div className="flex flex-wrap gap-2">
                      {dish.ingredients.map(ing => (
                        <div key={ing} className="group relative">
                          <IngredientTag ingredient={ing} />
                          {flaggedIngredients.includes(ing) && (
                            <button 
                              onClick={() => setIncidentIng(ing)}
                              className="absolute -top-2 -right-2 bg-[#FF5722] text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Report Incident"
                            >
                              <ShieldAlert size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Incident Modal Overlay */}
                <AnimatePresence>
                  {incidentIng && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-[#1A1A1A] text-white border-structural mt-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FF5722]">Record Flag Incident</h4>
                        <button onClick={() => setIncidentIng(null)}><X size={14}/></button>
                      </div>
                      <p className="text-xs mb-4 text-gray-400">Recording observation for <span className="text-white font-bold">{incidentIng}</span> in <span className="text-white font-bold">{dish.name}</span>.</p>
                      <textarea 
                        value={incidentDetails}
                        onChange={e => setIncidentDetails(e.target.value)}
                        placeholder="Describe the incident (e.g., discomfort level, duration...)"
                        className="w-full h-24 p-2 bg-white/10 border border-white/20 text-sm outline-none focus:border-[#FF5722] mb-4"
                      />
                      <button 
                        onClick={submitIncident}
                        className="w-full bg-[#FF5722] py-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        Submit to Flag Ledger
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Advanced Tools */}
                {!isEditing && (
                  <div className="mt-8 pt-8 border-structural-t flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Operations</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsPlanningOpen(!isPlanningOpen)}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1A1A1A] text-white text-[11px] uppercase font-bold tracking-widest"
                      >
                        <CalendarPlus size={16} /> Plan this dish
                      </button>
                      <button 
                         onClick={() => setShowDeleteConfirm(true)}
                         className="p-3 border-structural text-red-500 hover:bg-red-50 transition-colors"
                         title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {showDeleteConfirm && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 border border-red-200 flex flex-col gap-4 text-center"
                      >
                        <p className="text-[10px] uppercase font-bold text-red-600 tracking-widest">Confirm permanent removal?</p>
                        <div className="flex gap-2">
                          <button onClick={handleDelete} className="flex-1 bg-red-600 text-white p-2 text-[10px] font-bold uppercase transition-colors hover:bg-red-700">Delete</button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white border border-red-200 text-red-600 p-2 text-[10px] font-bold uppercase hover:bg-red-100 transition-colors">Cancel</button>
                        </div>
                      </motion.div>
                    )}

                    {isPlanningOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-100 border-structural flex flex-col gap-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} className="p-2 border-structural text-xs outline-none" />
                          <div className="flex gap-1">
                            {(['Morning', 'Lunch', 'Snack'] as MealType[]).map(slot => (
                              <button key={slot} onClick={() => setPlanSlot(slot)} className={clsx("flex-1 text-[9px] font-bold uppercase border-structural", planSlot === slot ? "bg-white" : "bg-transparent")}>{slot}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={handlePlanSubmit} className="bg-white border-structural p-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Confirm Schedule</button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
