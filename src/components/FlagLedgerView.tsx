import React, { useState } from 'react';
import { useMenuStore, FlagIncident } from '../store/useMenuStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Trash2, Calendar, Utensils, Edit3, Save } from 'lucide-react';

export const FlagLedgerView: React.FC = () => {
  const flagIncidents = useMenuStore(state => state.flagIncidents);
  const removeFlagIncident = useMenuStore(state => state.removeFlagIncident);
  const updateFlagIncident = useMenuStore(state => state.updateFlagIncident);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDetails, setEditDetails] = useState('');

  const handleEdit = (incident: FlagIncident) => {
    setEditingId(incident.id);
    setEditDetails(incident.incidentDetails);
  };

  const handleSave = (id: string) => {
    updateFlagIncident(id, { incidentDetails: editDetails });
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <header className="mb-10 border-structural-b pb-6">
        <h2 className="font-editorial text-4xl mb-2 flex items-center gap-4 text-[#FF5722]">
          <ShieldAlert size={36} />
          Flag Ledger
        </h2>
        <p className="text-gray-500 font-utilitarian text-[10px] uppercase tracking-[0.3em] font-bold">
           Documented Incidents & Health Observations
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {flagIncidents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-20 text-center border-structural border-dashed"
            >
              <p className="text-gray-300 uppercase tracking-widest font-bold text-sm">No incidents recorded in the ledger.</p>
            </motion.div>
          )}

          {flagIncidents.map((incident) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-structural p-6 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Stripe Decor */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5722]" />

              <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      <Calendar size={12} /> {new Date(incident.dateStr).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 text-[9px] font-bold uppercase tracking-widest text-[#FF5722]">
                      <Utensils size={12} /> {incident.dishName}
                    </span>
                    <span className="px-2 py-1 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest">
                      {incident.ingredient}
                    </span>
                  </div>

                  {editingId === incident.id ? (
                    <div className="flex flex-col gap-3">
                      <textarea 
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                        className="w-full h-32 p-4 bg-gray-50 border-structural text-sm outline-none focus:border-[#FF5722] font-utilitarian resize-none"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSave(incident.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 border-structural text-[10px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-utilitarian text-base leading-relaxed text-[#1A1A1A] italic border-l-2 border-gray-100 pl-4 py-1">
                      "{incident.incidentDetails}"
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <button 
                    onClick={() => handleEdit(incident)}
                    className="p-3 border-structural text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 transition-all"
                    title="Edit Incident"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => removeFlagIncident(incident.id)}
                    className="p-3 border-structural text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Expunge Record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
