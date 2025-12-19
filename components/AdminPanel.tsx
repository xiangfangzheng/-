
import React, { useState, useRef } from 'react';
import { Participant, Prize, RiggedRule } from '../types';
import { Upload, Trash2, Plus, Gift, Users, Settings, Lock, Image as ImageIcon } from 'lucide-react';
import { parseExcelFile } from '../utils/excel';

interface AdminPanelProps {
  participants: Participant[];
  prizes: Prize[];
  riggedRules: RiggedRule[];
  onImportParticipants: (data: Participant[]) => void;
  onAddPrize: (prize: Prize) => void;
  onDeletePrize: (id: string) => void;
  onAddRule: (rule: RiggedRule) => void;
  onRemoveRule: (prizeId: string, participantId: string) => void;
  onClose: () => void;
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  participants,
  prizes,
  riggedRules,
  onImportParticipants,
  onAddPrize,
  onDeletePrize,
  onAddRule,
  onRemoveRule,
  onClose,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'prizes' | 'rigging'>('users');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // New Prize State
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeCount, setNewPrizeCount] = useState(1);
  const [newPrizeImage, setNewPrizeImage] = useState('');

  // Rigging State
  const [selectedPrizeId, setSelectedPrizeId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const data = await parseExcelFile(e.target.files[0]);
        onImportParticipants(data);
      } catch (err) {
        console.error(err);
        alert('Error parsing Excel file. Ensure it has columns for ID and Name.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPrizeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePrize = () => {
    if (!newPrizeName) return;
    const newPrize: Prize = {
      id: crypto.randomUUID(),
      name: newPrizeName,
      count: newPrizeCount,
      image: newPrizeImage || `https://picsum.photos/200/200?random=${Math.random()}`,
      level: prizes.length + 1
    };
    onAddPrize(newPrize);
    setNewPrizeName('');
    setNewPrizeCount(1);
    setNewPrizeImage('');
  };

  const handleAddRule = () => {
    if (!selectedPrizeId || !selectedUserId) return;
    onAddRule({
        prizeId: selectedPrizeId,
        participantId: selectedUserId
    });
    setSelectedUserId(''); // Reset user selection
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-[#0f0f13] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Settings className="text-cyber-primary" /> Configuration
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-700"
          >
            Close
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900/30 border-r border-gray-800 flex flex-col p-4 gap-2 hidden md:flex">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Users size={18} /> Participants
            </button>
            <button 
              onClick={() => setActiveTab('prizes')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'prizes' ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Gift size={18} /> Prizes
            </button>
            <button 
              onClick={() => setActiveTab('rigging')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'rigging' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Lock size={18} /> Default Winners
            </button>

            <div className="mt-auto pt-4 border-t border-gray-800">
                <button 
                    onClick={() => {
                        if(confirm('Are you sure you want to reset everything? This will clear all participants, prizes, rules, and winner history.')) {
                            onReset();
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 transition-all"
                >
                    <Trash2 size={16} /> Factory Reset
                </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
            
            {/* MOBILE TABS (Small Screens Only) */}
            <div className="flex md:hidden gap-2 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
                {['users', 'prizes', 'rigging'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === tab ? 'bg-cyber-primary text-black font-bold' : 'bg-gray-800 text-gray-400'}`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Import Data</h3>
                    <p className="text-gray-400 text-sm">Upload an .xlsx file with columns: ID, Name, Department</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cyber-primary text-black font-bold px-6 py-3 rounded-full hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-105"
                      >
                        <Upload size={18} /> Upload Excel
                      </button>
                  </div>
                </div>

                <div className="glass-panel p-0 rounded-xl overflow-hidden border border-gray-800">
                  <div className="p-4 border-b border-gray-800 bg-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Participant Pool ({participants.length})</h3>
                  </div>
                  <div className="h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-900/80 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">ID</th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {participants.map((p, idx) => (
                          <tr key={p.id + idx} className="hover:bg-cyber-primary/5 transition-colors group">
                            <td className="p-4 text-gray-400 font-mono text-sm group-hover:text-cyber-primary transition-colors">{p.id}</td>
                            <td className="p-4 text-white font-medium">{p.name}</td>
                            <td className="p-4 text-gray-500">{p.department}</td>
                          </tr>
                        ))}
                        {participants.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-20 text-center">
                                <Users size={48} className="mx-auto mb-4 text-gray-700" />
                                <p className="text-gray-500">No participants imported yet.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PRIZES TAB */}
            {activeTab === 'prizes' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <div className="glass-panel p-6 rounded-xl border-l-4 border-l-cyber-secondary">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Prize</h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Image Upload Area */}
                      <div className="flex flex-col items-center gap-3">
                         <div 
                            onClick={() => imageInputRef.current?.click()}
                            className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-700 hover:border-cyber-primary flex items-center justify-center overflow-hidden cursor-pointer group bg-black/20 transition-all"
                         >
                            {newPrizeImage ? (
                                <img src={newPrizeImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500 group-hover:text-cyber-primary">
                                    <ImageIcon size={24} className="mx-auto mb-1" />
                                    <span className="text-[10px]">Photo</span>
                                </div>
                            )}
                         </div>
                         <input 
                            type="file" 
                            accept="image/*" 
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                         />
                         {newPrizeImage && (
                             <button onClick={() => setNewPrizeImage('')} className="text-[10px] text-red-500 hover:underline">Clear</button>
                         )}
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Prize Name</label>
                          <input 
                            type="text" 
                            value={newPrizeName}
                            onChange={(e) => setNewPrizeName(e.target.value)}
                            placeholder="e.g. MacBook Pro M3"
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-cyber-primary outline-none transition-all placeholder:text-gray-700"
                          />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Quantity</label>
                           <input 
                            type="number" 
                            min={1}
                            value={newPrizeCount}
                            onChange={(e) => setNewPrizeCount(Number(e.target.value))}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-cyber-primary outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={handleCreatePrize}
                                className="w-full bg-cyber-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(188,19,254,0.3)] flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Prize
                            </button>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prizes.map((prize) => (
                      <div key={prize.id} className="glass-panel p-4 rounded-xl relative group border border-gray-800 hover:border-cyber-primary/50 transition-all">
                        <button 
                          onClick={() => onDeletePrize(prize.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 min-w-[4rem] rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="overflow-hidden">
                              <h4 className="font-bold text-white truncate pr-6">{prize.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-cyber-primary text-xs font-mono">{prize.count} Total</span>
                                <span className="text-gray-600 text-[10px]">•</span>
                                <span className="text-gray-500 text-[10px]">Lvl {prize.level}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                    {prizes.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl">
                            No prizes added yet.
                        </div>
                    )}
                 </div>
              </div>
            )}

            {/* RIGGING TAB */}
            {activeTab === 'rigging' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="glass-panel p-6 rounded-xl border-l-4 border-l-red-500">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Lock className="text-red-500" /> Winner Override
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                        Define specific employees who <b>must</b> win certain prizes. These rules take precedence during the draw.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black/30 p-4 rounded-xl border border-gray-800">
                        <div>
                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Target Prize</label>
                             <select 
                                value={selectedPrizeId}
                                onChange={(e) => setSelectedPrizeId(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500"
                             >
                                <option value="">-- Select Prize --</option>
                                {prizes.map(p => <option key={p.id} value={p.id}>{p.name} ({p.count})</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Target Person</label>
                             <select 
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500"
                             >
                                <option value="">-- Select Person --</option>
                                {participants.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                                ))}
                             </select>
                        </div>
                        <button 
                            onClick={handleAddRule}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg h-[42px] transition-all hover:scale-105"
                        >
                            Set Rule
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Active Overrides</h3>
                    <div className="space-y-3">
                        {riggedRules.map((rule, idx) => {
                            const prize = prizes.find(p => p.id === rule.prizeId);
                            const user = participants.find(p => p.id === rule.participantId);
                            if (!prize || !user) return null;
                            return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/30 transition-all">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                        <div className="text-cyber-secondary font-bold">{user.name}</div>
                                        <div className="text-gray-600 text-xs uppercase tracking-tighter">is locked for</div>
                                        <div className="text-cyber-primary font-bold">{prize.name}</div>
                                    </div>
                                    <button 
                                        onClick={() => onRemoveRule(rule.prizeId, rule.participantId)}
                                        className="text-gray-500 hover:text-red-500 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )
                        })}
                        {riggedRules.length === 0 && (
                            <div className="text-gray-500 italic text-center py-10 border border-dashed border-gray-800 rounded-xl">
                                No overrides set. Everything is random.
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
