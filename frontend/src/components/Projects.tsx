import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useFirestore';
import { 
  Plus, 
  MoreVertical, 
  Users, 
  Calendar, 
  ArrowUpRight,
  Loader2,
  FolderOpen,
  Trash2,
  Crown,
  Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface ProjectsProps {
  onSelectProject: (id: string) => void;
  searchQuery?: string;
}

import { useToast } from './Toast';

export default function Projects({ onSelectProject, searchQuery = '' }: ProjectsProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { projects, loading, createProject, deleteProject } = useProjects(user?.uid);
  const { showToast, hideToast } = useToast();
  
  const currentLanguage = i18n.language || 'en';
  
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await createProject(newProjectName, newProjectDesc);
      showToast(t('projects.toast_success'), "success");
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreating(false);
    } catch (err: any) {
      showToast(t('projects.toast_fail'), "error");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const toastId = showToast(t('projects.toast_purging'), "loading");
    try {
      await deleteProject(id);
      hideToast(toastId);
      setMenuOpenId(null);
      showToast(t('projects.toast_purged'), "success");
    } catch (err: any) {
      console.error("Purge failure:", err);
      hideToast(toastId);
      let msg = "Failed to purge project cluster.";
      try {
        const parsed = JSON.parse(err.message);
        msg += ` Reason: ${parsed.error}`;
      } catch {
        msg += ` ${err.message || "Access denied or network error."}`;
      }
      showToast(msg, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">{t('projects.title')}</h1>
          <p className="text-slate-400">{t('projects.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('projects.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "group glass-card hover:bg-white/10 transition-all duration-500 flex flex-col hover:-translate-y-2",
              menuOpenId === project.id ? "z-30" : "z-10"
            )}
          >
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                  <FolderOpen size={28} />
                </div>
                <div className="flex items-center gap-2">
                  {/* Ownership Badge */}
                  {(() => {
                    console.log('Project:', project.name, 'ownerId:', project.ownerId, 'user.uid:', user?.uid, 'match:', project.ownerId === user?.uid);
                    console.log('MemberDetails:', project.memberDetails);
                    return project.ownerId === user?.uid ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <Crown size={12} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Owner</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <Mail size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Invited</span>
                    </div>
                  );
                  })()}
                  {/* Role Badge */}
                  {(() => {
                    const member = project.memberDetails?.find((m: any) => m.userId === user?.uid);
                    if (!member) return null;
                    const roleColors = {
                      admin: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                      editor: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
                      viewer: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
                    };
                    return (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg ${roleColors[member.role as keyof typeof roleColors]}`}>
                        <span className="text-[10px] font-black uppercase tracking-wider">{member.role}</span>
                      </div>
                    );
                  })()}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === project.id ? null : project.id);
                      }}
                      className={cn(
                        "p-3 rounded-xl transition-all",
                        menuOpenId === project.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <MoreVertical size={20} />
                    </button>

                  {menuOpenId === project.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                        }}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-2 z-20 animate-in">
                        <button 
                          onClick={(e) => handleDelete(e, project.id)}
                          className={cn(
                            "w-full px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 font-bold transition-colors",
                            currentLanguage === 'ar' ? "flex-row-reverse text-right" : "text-left"
                          )}
                        >
                          <Trash2 size={16} />
                          {t('projects.purge')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-sky-400 transition-colors uppercase tracking-tighter leading-none">{project.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed">
                {project.description || 'No description provided for this cloud project cluster.'}
              </p>
              
              <div className="flex flex-wrap gap-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-sky-500" />
                  <span>{project.members.length} {t('projects.stats_members')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-sky-500" />
                  <span>{new Date(project.createdAt).toLocaleDateString(currentLanguage)}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onSelectProject(project.id)}
              className="w-full py-5 px-8 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-sky-500 group-hover:text-white transition-all font-black uppercase tracking-widest text-xs"
            >
              {t('projects.access')}
              <ArrowUpRight size={18} className={cn(currentLanguage === 'ar' && "rotate-[-90deg]")} />
            </button>
          </motion.div>
        ))}

        {projects.length === 0 && !isCreating && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 glass-card border-dashed">
            <FolderOpen size={64} className="mb-6 opacity-10" />
            <p className="text-xl font-bold tracking-tight">{t('projects.no_projects')}</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-6 text-sky-400 hover:text-sky-300 font-bold uppercase tracking-widest text-xs"
            >
              {t('projects.initialize')}
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card p-10 max-w-md w-full shadow-2xl bg-[#1e293b]/90 border-white/20"
          >
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">{t('projects.modal_title')}</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">{t('projects.label_name')}</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all placeholder-slate-600 font-medium"
                  placeholder={t('projects.placeholder_name')}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">{t('projects.label_specs')}</label>
                <textarea 
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all placeholder-slate-600 font-medium"
                  placeholder={t('projects.placeholder_specs')}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 px-6 bg-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition-colors border border-white/5"
                >
                  {t('projects.btn_cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 px-6 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                >
                  {t('projects.btn_launch')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
