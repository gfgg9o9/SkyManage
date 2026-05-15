import React from 'react';
import { TerminalEvent } from '../types';
import { 
  Terminal as TerminalIcon, 
  Clock, 
  User, 
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare
} from 'lucide-react';

interface TerminalProps {
  events: TerminalEvent[];
  loading: boolean;
}

export default function Terminal({ events, loading }: TerminalProps) {
  const getEventIcon = (type: TerminalEvent['type']) => {
    switch (type) {
      case 'task_move':
        return <CheckCircle className="text-sky-400" size={16} />;
      case 'status_change':
        return <AlertCircle className="text-amber-400" size={16} />;
      case 'user_join':
        return <User className="text-emerald-400" size={16} />;
      case 'project_create':
        return <Plus className="text-purple-400" size={16} />;
      case 'comment_add':
        return <MessageSquare className="text-sky-400" size={16} />;
      default:
        return <TerminalIcon className="text-slate-400" size={16} />;
    }
  };

  const getEventColor = (type: TerminalEvent['type']) => {
    switch (type) {
      case 'task_move':
        return 'text-sky-400';
      case 'status_change':
        return 'text-amber-400';
      case 'user_join':
        return 'text-emerald-400';
      case 'project_create':
        return 'text-purple-400';
      case 'comment_add':
        return 'text-sky-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <TerminalIcon className="text-sky-400" size={20} />
          <h3 className="font-black uppercase tracking-wider text-sm">Live Action Terminal</h3>
        </div>
        <div className="flex items-center justify-center py-8 text-slate-500">
          <div className="animate-pulse">Loading terminal events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <TerminalIcon className="text-sky-400" size={20} />
        <h3 className="font-black uppercase tracking-wider text-sm">Live Action Terminal</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-500 font-mono">LIVE</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <TerminalIcon size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white truncate">
                      {event.userName}
                    </span>
                    <span className="text-slate-500 text-[10px]">•</span>
                    <span className="text-slate-500 text-[10px] font-mono">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs ${getEventColor(event.type)} font-medium mb-1`}>
                    {event.type.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {event.details}
                  </p>
                  {event.projectName && (
                    <div className="flex items-center gap-1 mt-2">
                      <FolderOpen size={12} className="text-slate-500" />
                      <span className="text-[10px] text-slate-500 font-medium">
                        {event.projectName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
