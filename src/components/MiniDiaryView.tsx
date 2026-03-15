import React, { useState } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { BookOpen, PenLine, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniDiaryViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniDiaryView: React.FC<MiniDiaryViewProps> = ({ isOpen, onClose }) => {
  const diaryEntries = useMenuStore(state => state.diaryEntries);
  const addDiaryEntry = useMenuStore(state => state.addDiaryEntry);
  const removeDiaryEntry = useMenuStore(state => state.removeDiaryEntry);
  
  const [newContent, setNewContent] = useState('');

  const handleSave = () => {
    if (!newContent.trim()) return;
    addDiaryEntry(newContent.trim());
    setNewContent('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A1A] z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#F9F8F6] border-l border-structural z-50 flex flex-col shadow-2xl"
          >
            <header className="p-8 border-structural-b bg-white flex justify-between items-center">
              <div>
                <h2 className="font-editorial text-4xl flex items-center gap-4">
                  <BookOpen size={28} />
                  Private Ledger
                </h2>
                <p className="text-gray-400 font-utilitarian text-[10px] uppercase tracking-widest font-bold mt-1">
                   Document Culinary Thoughts & Observations
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 border border-transparent hover:border-structural transition-all">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              {/* Editor Block */}
              <div className="mb-16 border-structural bg-white group hover:border-[#8A9A5B] transition-colors focus-within:border-[#8A9A5B]">
                <div className="flex items-center gap-3 p-4 border-structural-b bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                   <PenLine size={14} /> New Entry
                </div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Jot down a thought about today's meal or mood..."
                  className="w-full h-40 p-6 bg-transparent resize-none focus:outline-none font-utilitarian leading-relaxed text-sm"
                />
                <div className="flex justify-end p-4 border-structural-t bg-gray-50">
                   <button 
                     onClick={handleSave}
                     disabled={!newContent.trim()}
                     className="px-6 py-2 bg-[#1A1A1A] text-[#F9F8F6] font-bold uppercase tracking-wider text-[11px] hover:bg-[#333] transition-colors disabled:opacity-50"
                   >
                     Log Entry
                   </button>
                </div>
              </div>

              {/* Historical Ledger */}
              <div className="flex flex-col gap-10 relative pl-8 border-l border-structural border-dashed ml-4">
                {diaryEntries.length === 0 && (
                  <p className="text-gray-400 uppercase tracking-widest font-bold text-xs">
                    No entries found in ledger.
                  </p>
                )}

                {diaryEntries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="relative group bg-white border-structural p-6 hover:shadow-md transition-all"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-10 top-8 w-4 h-4 rounded-full bg-[#1A1A1A] border-4 border-[#F9F8F6]" />
                    
                    <div className="flex justify-between items-start mb-4 border-structural-b pb-4">
                      <span className="font-editorial text-2xl text-[#8A9A5B]">
                        {new Date(entry.dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      
                      <button 
                        onClick={() => removeDiaryEntry(entry.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                        title="Expunge Record"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="font-utilitarian text-base leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
