import React, { useRef } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { Download, Upload, Trash2, Database, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export const SettingsView: React.FC = () => {
  const store = useMenuStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      dishes: store.dishes,
      flaggedIngredients: store.flaggedIngredients,
      plannedMeals: store.plannedMeals,
      groceryItems: store.groceryItems,
      diaryEntries: store.diaryEntries,
      flagIncidents: store.flagIncidents,
      version: '2.6'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `immunege_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    store.showNotification('Backup downloaded successfully', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Simple validation
        if (!data.dishes || !Array.isArray(data.dishes)) {
          throw new Error('Invalid backup file');
        }

        useMenuStore.setState({
          dishes: data.dishes,
          flaggedIngredients: data.flaggedIngredients || [],
          plannedMeals: data.plannedMeals || [],
          groceryItems: data.groceryItems || [],
          diaryEntries: data.diaryEntries || [],
          flagIncidents: data.flagIncidents || []
        });

        store.showNotification('Ledger restored successfully', 'success');
      } catch (error) {
        store.showNotification('Failed to import: Invalid file format', 'info');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    if (window.confirm('Are you sure? This will wipe your entire ledger permanently.')) {
      localStorage.removeItem('immunege-ledger-storage');
      window.location.reload();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <header className="mb-12 border-structural-b pb-8">
        <h2 className="font-editorial text-5xl mb-4">Storage & Safety</h2>
        <p className="font-utilitarian text-xs uppercase tracking-[0.2em] text-gray-400">Manage your private ledger data</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Data Persistence Info */}
        <section className="flex flex-col gap-6">
          <div className="p-6 bg-white border-structural shadow-sm">
            {store.isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Database size={20} className={navigator.onLine ? "animate-spin" : ""} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">
                      {navigator.onLine ? "Searching Cloud..." : "No Internet Connection"}
                    </h3>
                  </div>
                  <div className="h-4 bg-gray-100 w-3/4" />
                  <div className="h-4 bg-gray-100 w-1/2" />
                </div>
                <button 
                  onClick={() => store.forceStopLoading()}
                  className="text-[9px] text-[#8A9A5B] font-bold uppercase tracking-widest hover:underline text-left mt-2"
                >
                  Skip Waiting / Use Offline
                </button>
              </div>
            ) : store.currentUser ? (
              <>
                <div className="flex items-center gap-3 mb-4 text-[#8A9A5B]">
                  <Database size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Cloud Sync Active</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Your data is safely synced to the **Cloud**. Your computer and phone will stay perfectly in step.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#8A9A5B] uppercase mb-4">
                  <ShieldCheck size={14} /> 
                  Synced as {store.currentUser.displayName}
                </div>
                {store.lastSyncedAt && (
                   <div className="text-[10px] text-gray-400 uppercase mb-4">
                     Last Connection: {store.lastSyncedAt}
                   </div>
                )}
                <button 
                  onClick={() => store.syncWithFirebase()}
                  disabled={store.isSyncing}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 bg-gray-50 border border-structural text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all",
                    store.isSyncing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Database size={12} className={clsx(store.isSyncing && "animate-spin")} />
                  {store.isSyncing ? "Syncing..." : "Force Sync Now"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <Database size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Local Storage</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Your data is currently saved **locally**. Login to sync across your computer and phone.
                </p>
                <button 
                  onClick={store.signInWithGoogle}
                  className="flex items-center gap-2 text-[10px] font-bold text-[#8A9A5B] uppercase hover:underline"
                >
                  <Database size={14} /> 
                  Enable Cloud Sync
                </button>
              </>
            )}
          </div>

          <div className="p-6 border border-structural border-dashed">
             <div className="flex items-center gap-3 mb-4 text-gray-400">
              <HelpCircle size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Long Term Use</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              To use this on other devices, or to keep a lifelong record, we recommend downloading a backup monthly. You can import that backup file on any other device running this app.
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-4">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-6 bg-[#1A1A1A] text-white hover:bg-[#8A9A5B] transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Export Ledger</span>
              <span className="text-[10px] opacity-50 uppercase tracking-widest font-normal">Download .JSON backup</span>
            </div>
            <Download size={24} className="group-hover:translate-y-1 transition-transform" />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-6 bg-white border-structural hover:border-[#8A9A5B] transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Import Backup</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">Restore from file</span>
            </div>
            <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
          </button>

          <div className="mt-8 pt-8 border-t border-structural">
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} /> Clear All Data Permanently
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
};
