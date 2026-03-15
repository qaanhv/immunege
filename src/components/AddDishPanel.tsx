import React, { useState } from 'react';
import { useMenuStore, Dish, MealType } from '../store/useMenuStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Image as ImageIcon, Wand2, Hash, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const AddDishPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const addDish = useMenuStore(state => state.addDish);
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [ingredientsText, setIngredientsText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);

  // AI Inference for ingredients (Biased towards Vietnamese)
  const handleInferIngredients = () => {
    if (!name) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      const n = name.toLowerCase();
      if (n.includes('phở') || n.includes('pho')) {
        setIngredientsText('Bánh phở, Thịt bò, Nước dùng xương, Hành lá, Rau mùi, Hồi, Quế, Gừng nướng');
      } else if (n.includes('bún chả') || n.includes('bun cha')) {
        setIngredientsText('Bún, Thịt nạc vai, Đu đủ xanh, Cà rốt, Nước mắm, Tỏi, Ớt, Sả, Mật ong');
      } else if (n.includes('bánh mì') || n.includes('banh mi')) {
        setIngredientsText('Bánh mì, Patê, Bơ, Chả lụa, Dưa leo, Đồ chua, Ngò rí, Nước xốt thịt');
      } else if (n.includes('cơm tấm') || n.includes('com tam')) {
        setIngredientsText('Gạo tấm, Sườn nướng, Chả trứng, Bì, Nước mắm chua ngọt, Mỡ hành, Trứng ốp la');
      } else if (n.includes('bánh xèo') || n.includes('banh xeo')) {
        setIngredientsText('Bột gạo, Nước cốt dừa, Nghệ, Tôm, Thịt ba chỉ, Giá đỗ, Hành lá, Rau sống, Nước mắm chua ngọt');
      } else if (n.includes('bún bò') || n.includes('bun bo')) {
        setIngredientsText('Bún sợi to, Thịt bắp bò, Giò heo, Chả cua, Huyết, Sả, Mắm ruốc, Hành lá');
      } else if (n.includes('cao lầu') || n.includes('cao lau')) {
        setIngredientsText('Sợi mì cao lầu, Thịt xá xíu, Da heo chiên giòn, Rau đắng, Húng lủi, Giá, Nước xốt đặc trưng');
      } else if (n.includes('gỏi cuốn') || n.includes('goi cuon')) {
        setIngredientsText('Bánh tráng, Tôm luộc, Thịt ba chỉ, Bún, Hẹ, Xà lách, Rau thơm, Tương đậu phộng');
      } else if (n.includes('canh chua')) {
        setIngredientsText('Cá lóc, Dứa, Cà chua, Đậu bắp, Giá đỗ, Bạc hà, Ngò ôm, Ngò gai, Me, Tỏi phi');
      } else {
        setIngredientsText('Nguyên liệu chính, Rau thơm, Gia vị đặc trưng, Nước mắm');
      }
      setIsAiGenerating(false);
    }, 1200);
  };

  // AI Image Generation (biased towards Vietnamese)
  const handleGenerateImage = () => {
    if (!name) return;
    setIsImageGenerating(true);
    setTimeout(() => {
      const n = name.toLowerCase();
      let path = '';
      
      // Map to pre-generated high-quality assets
      if (n.includes('phở') || n.includes('pho')) path = '/assets/pho_bo.png';
      else if (n.includes('bún chả') || n.includes('bun cha')) path = '/assets/bun_cha.png';
      else if (n.includes('bánh mì') || n.includes('banh mi')) path = '/assets/banh_mi.png';
      else if (n.includes('cơm tấm') || n.includes('com tam')) path = '/assets/com_tam.png';
      else if (n.includes('bún bò') || n.includes('bun bo')) path = '/assets/bun_bo_hue.png';
      else if (n.includes('bánh xèo') || n.includes('banh xeo')) path = '/assets/banh_xeo.png';
      else if (n.includes('cao lầu') || n.includes('cao lau')) path = '/assets/cao_lau.png';
      else if (n.includes('gỏi cuốn') || n.includes('goi cuon') || n.includes('spring roll')) path = '/assets/goi_cuon.png';
      else {
        // Fallback to high-quality unsplash search with Vietnamese bias
        path = `https://source.unsplash.com/featured/?vietnamese,food,${encodeURIComponent(name)}`;
        // Note: unsplash source is sometimes flaky, using a stable fallback
        if (n.length > 0) path = `https://loremflickr.com/800/600/vietnamese,food,cooking,${encodeURIComponent(name)}/all`;
      }

      setImageUrl(path);
      setIsImageGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!name) return;
    
    const newDish: Dish = {
      id: Math.random().toString(36).substring(7),
      name,
      mealType,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop', 
      ingredients: ingredientsText.split(',').map(i => i.trim()).filter(Boolean),
      customTags: tagsText.split(',').map(t => t.trim()).filter(Boolean)
    };

    addDish(newDish);
    useMenuStore.getState().showNotification(`Đã thêm ${name} vào thực đơn`, 'success');
    
    // Reset
    setName('');
    setIngredientsText('');
    setImageUrl('');
    setTagsText('');
    setMealType('Lunch');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A1A] z-40"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#F9F8F6] border-l border-structural z-50 flex flex-col shadow-2xl"
          >
            <div className="p-8 flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center border-structural-b pb-6 mb-8">
                <h2 className="font-editorial text-4xl">New Entry</h2>
                <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] hover:text-[#F9F8F6] transition-colors">
                  <X />
                </button>
              </div>

              <div className="flex flex-col gap-8 flex-1">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ledger Title</label>
                  <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bánh Xèo"
                    className="bg-transparent border-structural-b p-2 focus:outline-none focus:border-[#8A9A5B] font-editorial text-3xl transition-colors"
                  />
                </div>

                {/* Imagery Section */}
                <div className="flex flex-col gap-4 border-structural p-4 bg-white/50 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Imagery</label>
                    <span className="text-[8px] uppercase font-bold text-[#8A9A5B] flex items-center gap-1">
                      <Sparkles size={10} /> AI Biased
                    </span>
                  </div>
                  
                  {imageUrl && (
                    <div className="relative aspect-video overflow-hidden border-structural mb-2 group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                          onClick={() => setImageUrl('')}
                          className="bg-white text-[#1A1A1A] p-2 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                          <X size={14} /> Remove Image
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateImage}
                      disabled={!name || isImageGenerating}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8A9A5B] disabled:opacity-50 transition-all shadow-md active:scale-95"
                    >
                      {isImageGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {isImageGenerating ? 'Visualizing...' : 'Generate with AI'}
                    </button>
                    <div className="relative flex-1">
                      <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Or custom URL..."
                        className="w-full pl-9 pr-3 py-3 bg-white border-structural text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#8A9A5B] shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Morning', 'Lunch', 'Snack'] as MealType[]).map((type) => (
                        <button
                          key={type} onClick={() => setMealType(type)}
                          className={clsx(
                            "py-2 text-[10px] uppercase font-bold border-structural transition-all",
                            mealType === type ? "bg-[#1A1A1A] text-white" : "bg-white hover:bg-gray-100"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Tags</label>
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" value={tagsText} onChange={(e) => setTagsText(e.target.value)}
                        placeholder="soup, crispy, spicy..."
                        className="w-full pl-9 pr-3 py-2.5 bg-white border-structural text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#8A9A5B] shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ingredients</label>
                    <button 
                      onClick={handleInferIngredients}
                      disabled={!name || isAiGenerating}
                      className="text-[9px] uppercase font-bold tracking-widest text-[#8A9A5B] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
                    >
                      {isAiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      {isAiGenerating ? 'Inferring...' : 'Auto-infer Ingredients'}
                    </button>
                  </div>
                  <textarea 
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    placeholder="Enter ingredients separated by commas..."
                    className="bg-white border-structural p-4 h-32 focus:outline-none focus:border-[#8A9A5B] resize-none text-sm font-utilitarian shadow-sm"
                  />
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={handleSave}
                disabled={!name}
                className="w-full bg-[#1A1A1A] text-white p-5 uppercase tracking-[0.3em] font-bold hover:bg-[#8A9A5B] disabled:opacity-50 transition-all mt-8 flex justify-center gap-2 items-center shadow-xl active:scale-[0.98]"
              >
                Append to Ledger
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
