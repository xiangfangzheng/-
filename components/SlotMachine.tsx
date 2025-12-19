
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '../types';
import { Language, translations } from '../utils/i18n';

interface SlotMachineProps {
  candidates: Participant[];
  isRunning: boolean;
  finalWinners: Participant[] | null;
  onAnimationComplete: () => void;
  drawCount: number;
  lang: Language;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ 
  candidates, 
  isRunning, 
  finalWinners,
  onAnimationComplete,
  drawCount,
  lang
}) => {
  const t = translations[lang];
  const [displayedNames, setDisplayedNames] = useState<Participant[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayedNames(Array.from({ length: drawCount }).map((_, i) => ({
        id: `placeholder-${i}`,
        name: '???',
        department: t.ready,
    })));
  }, [drawCount, lang]);

  useEffect(() => {
    if (isRunning) {
      setIsRevealing(false);
      intervalRef.current = window.setInterval(() => {
        const nextBatch = Array.from({ length: drawCount }).map(() => {
             if (candidates.length === 0) return { id: '0', name: '...' };
             const randomIdx = Math.floor(Math.random() * candidates.length);
             return candidates[randomIdx];
        });
        setDisplayedNames(nextBatch);
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (finalWinners && finalWinners.length > 0) {
        setDisplayedNames(finalWinners);
        setIsRevealing(true);
        setTimeout(() => onAnimationComplete(), 1000);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, candidates, finalWinners, drawCount, onAnimationComplete]);

  return (
    <div className="w-full flex justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl p-4">
            {displayedNames.map((p, idx) => (
                <Card key={idx} participant={p} isWinner={isRevealing} index={idx} />
            ))}
        </div>
    </div>
  );
};

const Card: React.FC<{ participant: Participant; isWinner: boolean; index: number }> = ({ participant, isWinner, index }) => {
    const isPlaceholder = participant.name === '???';
    return (
        <motion.div 
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
                scale: isWinner ? 1.1 : 1, 
                opacity: 1,
                borderColor: isWinner ? '#00f3ff' : 'rgba(255,255,255,0.1)',
                backgroundColor: isWinner ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255,255,255,0.05)'
            }}
            transition={{ type: 'spring', damping: 15 }}
            className={`relative h-40 rounded-xl border-2 flex flex-col items-center justify-center p-4 backdrop-blur-md shadow-lg overflow-hidden ${isWinner ? 'shadow-[0_0_30px_rgba(0,243,255,0.4)] z-10' : 'border-white/10'}`}
        >
             {isWinner && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 z-0" />}
             <div className="z-10 text-center">
                <div className={`text-xs font-mono mb-2 uppercase tracking-widest ${isPlaceholder ? 'text-gray-600' : 'text-cyber-primary opacity-70'}`}>{participant?.department || 'Unknown'}</div>
                <h3 className={`font-display font-bold leading-tight ${isWinner ? 'text-3xl text-white' : isPlaceholder ? 'text-4xl text-gray-700 tracking-widest' : 'text-2xl text-gray-300'}`}>{participant?.name || '...'}</h3>
                {!isPlaceholder && <div className="mt-2 text-xs text-gray-500 font-mono">{participant?.id && participant.id !== '0' ? participant.id : ''}</div>}
             </div>
        </motion.div>
    )
}

export default SlotMachine;
