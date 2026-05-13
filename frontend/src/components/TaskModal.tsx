import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  User, 
  Clock, 
  Trash2, 
  MessageSquare,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Task, Comment } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useComments, useTasks } from '../hooks/useFirestore';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (taskId: string) => Promise<void>;
}

import { useToast } from './Toast';

export default function TaskModal({ task, isOpen, onClose, onDelete }: TaskModalProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const { comments, addComment, deleteComment, loading: commentsLoading } = useComments(task.id);
  const { updateTask } = useTasks(task.projectId);
  const { showToast, hideToast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState(task.progress || 0);

  const handleProgressChange = async (newProgress: number) => {
    setLocalProgress(newProgress);
    setIsUpdatingProgress(true);
    try {
      await updateTask(task.id, { progress: newProgress });
    } catch (err) {
      console.error("Progress update failed:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    const toastId = showToast(t('task.purging'), "loading");
    try {
      await onDelete(task.id);
      hideToast(toastId);
      showToast(t('task.purged'), "success");
      onClose();
    } catch (err: any) {
      console.error("Purge failure:", err);
      hideToast(toastId);
      let msg = t('task.failed_purge');
      try {
        const parsed = JSON.parse(err.message);
        msg += ` Reason: ${parsed.error}`;
      } catch {
        msg += ` ${err.message || "Access denied or network error."}`;
      }
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl max-h-[90vh] bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Task Info Area */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      task.status === 'done' ? "bg-emerald-500/20 text-emerald-400" :
                      task.status === 'in_progress' ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"
                    )}>
                      {t(`status.${task.status}`)}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                      task.priority === 'urgent' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                      task.priority === 'high' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {t(`priority.${task.priority}`)} {t('task.priority_suffix')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{task.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {onDelete && (
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all group disabled:opacity-50"
                      title={t('task.purge_title')}
                    >
                      <Trash2 size={20} className={cn(isDeleting && "animate-pulse")} />
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-500 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className={cn("text-[10px] uppercase font-black text-slate-500 mb-3 tracking-widest flex items-center gap-2", currentLanguage === 'ar' && "flex-row-reverse text-right")}>
                    <AlertCircle size={12} className="text-sky-500" />
                    {t('task.description')}
                  </h3>
                  <div className={cn("p-6 bg-white/5 rounded-2xl border border-white/5 text-slate-300 leading-relaxed", currentLanguage === 'ar' && "text-right")}>
                    {task.description || <span className="italic text-slate-500">{t('task.no_telemetry')}</span>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                       <Clock size={12} className="text-sky-500" />
                       Operational Progress
                    </h3>
                    <span className="text-xs font-black text-sky-400 font-mono">{localProgress}%</span>
                  </div>
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden group">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${localProgress}%` }}
                      className="absolute inset-y-0 left-0 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={localProgress}
                      onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {isUpdatingProgress && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] font-black text-sky-500 uppercase tracking-widest">Synchronizing vector...</motion.p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <h4 className={cn("text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest", currentLanguage === 'ar' && "text-right")}>{t('task.reporter')}</h4>
                    <div className={cn("flex items-center gap-2", currentLanguage === 'ar' && "flex-row-reverse")}>
                      <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                        <User size={10} className="text-sky-400" />
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">{t('task.agent')} {task.reporterId?.slice(0, 8)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <h4 className={cn("text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest", currentLanguage === 'ar' && "text-right")}>{t('task.initialization')}</h4>
                    <div className={cn("flex items-center gap-2", currentLanguage === 'ar' && "flex-row-reverse")}>
                      <Calendar size={12} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">
                        {new Date(task.createdAt).toLocaleDateString(currentLanguage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Sidecar */}
            <div className="w-full md:w-[400px] flex flex-col bg-black/20 backdrop-blur-md">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className={cn("flex items-center gap-3", currentLanguage === 'ar' && "flex-row-reverse")}>
                  <MessageSquare size={18} className="text-sky-400" />
                  <h3 className="font-bold text-white uppercase tracking-widest text-xs">{t('task.comms_logs')}</h3>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-black text-slate-500">{comments.length}</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white hidden md:block"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {commentsLoading ? (
                  <div className="flex items-center justify-center p-10">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-sky-500">
                      <Clock size={24} />
                    </motion.div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <MessageSquare size={32} className="mb-4 text-slate-600" />
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{t('task.no_comms')}</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative"
                    >
                      <div className={cn("flex gap-4", currentLanguage === 'ar' && "flex-row-reverse")}>
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black text-xs">
                          {comment.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("flex items-baseline justify-between mb-1 gap-2", currentLanguage === 'ar' && "flex-row-reverse")}>
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-tight truncate">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-slate-600 font-medium shrink-0">
                              {formatDistanceToNow(new Date(comment.createdAt), { 
                                addSuffix: true,
                                locale: currentLanguage === 'ar' ? ar : currentLanguage === 'fr' ? fr : enUS
                              })}
                            </span>
                          </div>
                          <div className={cn(
                            "p-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed",
                            currentLanguage === 'ar' ? "rounded-tr-none text-right" : "rounded-tl-none text-left"
                          )}>
                            {comment.content}
                          </div>
                        </div>
                        {comment.authorId === user?.uid && (
                          <button 
                            onClick={() => deleteComment(comment.id)}
                            className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="p-6 border-t border-white/10 bg-black/40">
                <form onSubmit={handleSubmitComment} className="relative">
                  <textarea 
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('task.broadcast')}
                    className={cn(
                      "w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 outline-none transition-all placeholder-slate-700 text-sm text-white resize-none font-medium",
                      currentLanguage === 'ar' ? "pl-14 pr-4 text-right" : "pr-14 pl-4 text-left"
                    )}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className={cn(
                      "absolute bottom-3 p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:shadow-none",
                      currentLanguage === 'ar' ? "left-3" : "right-3"
                    )}
                  >
                    {isSubmitting ? (
                      <Clock size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
                <div className={cn("mt-4 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-2", currentLanguage === 'ar' && "flex-row-reverse")}>
                  <CheckCircle2 size={10} className="text-green-500" />
                  {t('task.secured')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
