import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useProjects, useTasks } from '../hooks/useFirestore';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, Brain, Cpu, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth';

export default function MissionControl() {
  const { user } = useAuth();
  const { projects } = useProjects(user?.uid);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Systems initialized. I am **The Architect**. Intelligence uplink secured. How shall we optimize the mission today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Build context
      const projectsContext = projects.map(p => `- ${p.name}: ${p.description}`).join('\n');
      
      const systemPrompt = `You are "The Architect", a strategic AI mission controller for a high-tech project management system.
Your tone is technical, efficient, authoritative yet helpful, and "hacker-ready" (using terms like telemetry, clusters, mission goals, vector realignment).

CURRENT MISSION CONTEXT (PROJECTS):
${projectsContext}

Guidelines:
1. Analyze roadblocks and summarize telemetry when asked.
2. Provide strategic advice on project organization.
3. Keep responses concise and formatted in clean Markdown.
4. If you don't have specific data (like comments for all tasks yet), mention that "telemetry streams are still buffering" for those sectors.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' as const : 'user' as const,
          parts: [{ text: m.content }]
        })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const aiResponse = response.text || "Communication link lost. Retry uplink.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Link Failure:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "ERROR: Intelligence core unresponsive. check API keys or connection status." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
            <Brain size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link</p>
            <p className="text-sm font-bold text-sky-400 uppercase">Synchronized</p>
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <Cpu size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Core</p>
            <p className="text-sm font-bold text-amber-400 uppercase">1.2 PetaFlops</p>
          </div>
        </div>
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prediction Engine</p>
            <p className="text-sm font-bold text-emerald-400 uppercase">Model Beta-09</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500 animate-gradient-x"></div>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 shrink-0 rounded-xl flex items-center justify-center",
                m.role === 'assistant' ? "bg-sky-500 text-white" : "bg-white/10 text-slate-400"
              )}>
                {m.role === 'assistant' ? <Bot size={16} /> : <MessageSquare size={16} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'assistant' 
                  ? "bg-white/5 border border-white/5 text-slate-200 markdown-body" 
                  : "bg-sky-500 text-white font-medium"
              )}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Brain size={16} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 w-24 flex gap-1 items-center justify-center">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-black/20">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query The Architect..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-sky-500/50 transition-all text-sm placeholder-slate-600 font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all disabled:opacity-50 disabled:hover:bg-sky-500"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span>Protocol Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-sky-500 rounded-full"></div>
              <span>Latency 42ms</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
