
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Download } from 'lucide-react';
import { Winner, Prize } from '../types';
import { utils, writeFile } from 'xlsx';
import { translations, Language } from '../utils/i18n';

interface WinnersHistoryProps {
  winners: Winner[];
  prizes: Prize[];
  onClose: () => void;
  lang: Language;
}

const WinnersHistory: React.FC<WinnersHistoryProps> = ({ winners, prizes, onClose, lang }) => {
  const t = translations[lang];
  const historyData = useMemo(() => {
    const sortedPrizes = [...prizes].sort((a, b) => a.level - b.level);
    return sortedPrizes.map(prize => ({
      prize,
      winners: winners.filter(w => w.prizeId === prize.id).sort((a, b) => b.timestamp - a.timestamp)
    })).filter(group => group.winners.length > 0);
  }, [prizes, winners]);

  const handleExport = () => {
    const exportData = winners.map(w => {
      const prize = prizes.find(p => p.id === w.prizeId);
      return {
        [t.prize_name]: prize?.name || 'Unknown',
        [t.level]: prize?.level || 0,
        [t.id]: w.participant.id,
        [t.name]: w.participant.name,
        [t.dept]: w.participant.department,
        'Time': new Date(w.timestamp).toLocaleString()
      };
    });
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Winners");
    writeFile(wb, `Lottery_Winners_${lang}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl h-[85vh] bg-[#0f0f13] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={24} /></div>
             <div><h2 className="text-2xl font-display font-bold text-white">{t.hall_of_fame}</h2><p className="text-gray-400 text-sm">{winners.length} {t.winners_circle}</p></div>
          </div>
          <div className="flex gap-3">
             {winners.length > 0 && (
                 <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors"><Download size={18} /> {t.export}</button>
             )}
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><X size={24} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {historyData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500"><Trophy size={64} className="mb-4 opacity-20" /><p className="text-xl">No winners yet. The stage is set!</p></div>
            ) : (
                historyData.map(({ prize, winners }) => (
                    <div key={prize.id} className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                             <div className="flex items-center gap-3">{prize.image && <img src={prize.image} className="w-8 h-8 rounded object-cover border border-gray-700"/>}<h3 className="text-xl font-bold text-cyber-primary">{prize.name}</h3></div>
                             <span className="text-sm font-mono text-gray-500">{winners.length} / {prize.count}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {winners.map((w) => (
                                <div key={w.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyber-primary/30 transition-all">
                                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm border border-gray-600 shadow-inner">{w.participant.name.slice(0,1).toUpperCase()}</div>
                                    <div className="overflow-hidden"><div className="font-bold text-white truncate text-sm">{w.participant.name}</div><div className="text-xs text-gray-400 font-mono truncate">{w.participant.department || w.participant.id}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default WinnersHistory;
