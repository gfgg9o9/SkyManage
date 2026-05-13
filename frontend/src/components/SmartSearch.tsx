import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, Bot, Folder, CheckSquare, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useProjects, useTasks } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI } from "@google/genai";

interface SmartSearchProps {
  onSelectProject: (projectId: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function SmartSearch({ onSelectProject, onSelectTab }: SmartSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { projects } = useProjects(user?.uid);
  const { tasks } = useTasks(undefined); 
  
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelection = (projectId: string) => {
    onSelectProject(projectId);
    onSelectTab('projects');
    setIsOpen(false);
    setQueryInput('');
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(queryInput.toLowerCase()) ||
    p.description.toLowerCase().includes(queryInput.toLowerCase())
  ).slice(0, 3);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(queryInput.toLowerCase()) ||
    t.description.toLowerCase().includes(queryInput.toLowerCase())
  ).slice(0, 5);

  const handleAISearch = async () => {
    if (!queryInput.trim() || isAIProcessing) return;
    
    setIsAIProcessing(true);
    setAiAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const context = `
        Projects: ${projects.map(p => p.name).join(', ')}
        Tasks: ${tasks.map(t => t.title).join(', ')}
      `;

      const prompt = `
        User Query: "${queryInput}"
        Context: ${context}
        
        Analyze the query and find relevant connections or provide a brief strategic summary of how it relates to our current missions. 
        Keep it very short (max 2 sentences) and maintain "The Architect" persona (technical, strategic).
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      setAiAnalysis(result.text || "Communication link lost. Retry uplink.");
    } catch (err) {
      console.error("AI Search Error:", err);
      setAiAnalysis("Intelligence link unstable. Relying on local data fragments.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
      >
        <Search size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">Global Search</span>
        <div className="flex items-center gap-1 ml-4 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-600">
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 md:p-[10vh]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-sky-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative border-b border-white/5">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  autoFocus
                  type="text" 
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  placeholder="Search objectives, missions, or ask The Architect..."
                  className="w-full bg-transparent py-8 pl-14 pr-24 outline-none text-white text-lg placeholder-slate-600 font-mono"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    onClick={handleAISearch}
                    disabled={!queryInput.trim() || isAIProcessing}
                    className="p-2 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white rounded-xl transition-all disabled:opacity-30"
                  >
                    {isAIProcessing ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {isAIProcessing || aiAnalysis ? (
                  <div className="p-8 bg-sky-500/[0.03] border-b border-sky-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles size={16} className="text-sky-400" />
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Architect Analysis</span>
                    </div>
                    {isAIProcessing ? (
                      <div className="flex flex-col gap-2">
                        <div className="h-2 w-3/4 bg-sky-500/20 rounded-full animate-pulse"></div>
                        <div className="h-2 w-1/2 bg-sky-500/20 rounded-full animate-pulse delay-75"></div>
                      </div>
                    ) : (
                      <p className="text-slate-300 text-sm leading-relaxed font-medium italic">"{aiAnalysis}"</p>
                    )}
                  </div>
                ) : null}

                {queryInput ? (
                  <div className="p-4 space-y-8">
                    {filteredProjects.length > 0 && (
                      <div>
                        <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Relevant Clusters</h3>
                        <div className="space-y-1">
                          {filteredProjects.map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => handleSelection(p.id)}
                              className="w-full text-left p-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 group transition-colors"
                            >
                              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Folder size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white text-sm">{p.name}</p>
                                <p className="text-xs text-slate-500 truncate">{p.description}</p>
                              </div>
                              <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredTasks.length > 0 && (
                      <div>
                        <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tactical Objectives</h3>
                        <div className="space-y-1">
                          {filteredTasks.map(t => (
                            <button 
                              key={t.id} 
                              onClick={() => handleSelection(t.projectId)}
                              className="w-full text-left p-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 group transition-colors"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:text-white",
                                t.status === 'done' ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500" :
                                t.status === 'in_progress' ? "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500" :
                                "bg-slate-500/10 text-slate-400 group-hover:bg-slate-500"
                              )}>
                                <CheckSquare size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white text-sm">{t.title}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-tighter">Status: {t.status.replace('_', ' ')} • Priority: {t.priority}</p>
                              </div>
                              <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredProjects.length === 0 && filteredTasks.length === 0 && !isAIProcessing && (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-700 mx-auto">
                          <Search size={32} />
                        </div>
                        <div>
                          <p className="text-white font-bold">Zero telemetry found</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">Try broad keywords or ask The Architect to analyze</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 group hover:border-sky-500/30 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                        <Command size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase text-xs tracking-widest">Recent Queries</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase">» Bridge deployment status</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">» Active neural mapping</p>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 group hover:border-purple-500/30 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase text-xs tracking-widest">AI Shortcuts</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase">» Summarize roadblocks</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">» Evaluate velocity</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Enter</span>
                    <span>to select</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Esc</span>
                    <span>to close</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural Link Sync</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
