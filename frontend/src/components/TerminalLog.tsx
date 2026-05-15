import React, { useEffect, useRef } from 'react';
import { useTerminalEvents } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useFirestore';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function TerminalLog() {
  const { user } = useAuth();
  const { projects } = useProjects(user?.uid);
  const userProjectIds = projects.map(p => p.id);
  const { events, loading } = useTerminalEvents(user?.uid, userProjectIds);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Newest at top based on Firestore query but usually terminals scroll down.
      // However, if the query is desc, newest are at index 0.
    }
  }, [events]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
        <Cpu className="animate-spin text-sky-500" size={32} />
        <p className="font-mono text-xs uppercase tracking-widest">Bridging secure terminal...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-sky-400" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Live Action Terminal</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">Active Link</span>
          </div>
          <ShieldCheck size={14} className="text-slate-600" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-3 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 group"
            >
              <div className="text-slate-600 shrink-0 select-none">
                [{format(new Date(event.createdAt), 'HH:mm:ss')}]
              </div>
              <div className="flex-1">
                <span className={cn(
                  "font-bold mr-2",
                  event.type === 'project_create' ? "text-purple-400" :
                  event.type === 'status_change' ? "text-sky-400" :
                  event.type === 'comment_add' ? "text-amber-400" : "text-emerald-400"
                )}>
                  {event.type.replace('_', ' ').toUpperCase()} »
                </span>
                <span className="text-slate-300">
                  {event.userName}: {event.details}
                </span>
                {event.taskTitle && (
                  <span className="text-slate-500 ml-2 italic">
                    (Target: {event.taskTitle})
                  </span>
                )}
                {event.projectName && (
                  <span className="text-slate-500 ml-2">
                    [Cluster: {event.projectName}]
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="pt-4 flex items-center gap-2 text-sky-500 animate-pulse">
          <span className="text-xs">_</span>
          <Activity size={10} />
        </div>
      </div>

      <div className="p-3 border-t border-white/5 bg-black/40 flex items-center justify-between px-6">
        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          Auth ID: {events[0]?.userId?.slice(0, 8) || 'anonymous'}
        </p>
        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          Packet Loss: 0.00%
        </p>
      </div>
    </div>
  );
}
