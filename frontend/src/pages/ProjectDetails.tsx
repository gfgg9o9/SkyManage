import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks, useProjects } from '../hooks/useFirestore';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import FileUploader from '../components/FileUploader';
import { 
  ArrowLeft, 
  Settings, 
  Share2, 
  Plus, 
  Loader2,
  Filter,
  Grid,
  List,
  Trash2,
  Users,
  UserPlus,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Status, Priority, ProjectMember, Task, Project } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  searchQuery?: string;
}

import { useToast } from '../components/Toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ProjectDetails({ projectId, onBack, searchQuery = '' }: ProjectDetailsProps) {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(projectId);
  const { projects, addProjectMember, removeProjectMember } = useProjects(user?.uid);
  const { showToast, hideToast } = useToast();
  const project = projects.find(p => p.id === projectId) as Project & { documents?: { name: string, url: string, uploadedBy: string, at: string }[] };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleUploadSuccess = async (url: string, name: string) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        documents: arrayUnion({
          name,
          url,
          uploadedBy: user?.displayName || user?.email || 'Unknown',
          at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Failed to update project documents:", err);
      showToast("Metadata sync failed, but document was archived.", "info");
    }
  };
  
  // Member management state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'pm' | 'member'>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  const [newTaskStatus, setNewTaskStatus] = useState<Status>('todo');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    try {
      await addProjectMember(projectId, inviteEmail.toLowerCase().trim(), inviteRole);
      showToast(`${inviteEmail} authorization requested successfully.`, "success");
      setInviteEmail('');
      setInviteError(null);
    } catch (error: any) {
      setInviteError(error.message || 'Failed to add member.');
      showToast("Access authorization failed.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string | undefined, email: string) => {
    setDeletingEmail(email);
    try {
      await removeProjectMember(projectId, userId, email);
      showToast(`${email} access revoked successfully.`, "success");
    } catch (error: any) {
      console.error("Removal error:", error);
      showToast(error.message || 'Failed to remove member.', "error");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await createTask({
        projectId,
        title: taskTitle,
        description: taskDesc,
        status: newTaskStatus,
        priority: taskPriority,
        reporterId: user?.uid || 'unknown',
        assigneeId: user?.uid || 'unknown',
        dueDate: taskDueDate || undefined
      });
      showToast("Task deployment executed successfully.", "success");
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setIsAddTaskOpen(false);
    } catch (err: any) {
      showToast("Deployment failed.", "error");
    }
  };

  if (tasksLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">{project.name}</h1>
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Environment Cluster • {project.members.length} Users</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center glass-panel rounded-2xl p-1">
            <button 
              onClick={() => setView('grid')}
              className={cn(
                "p-2 rounded-xl transition-all",
                view === 'grid' ? "bg-sky-500/20 text-sky-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn(
                "p-2 rounded-xl transition-all",
                view === 'list' ? "bg-sky-500/20 text-sky-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <List size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsManageMembersOpen(true)}
            className="p-3 glass-panel hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white flex items-center gap-2 group"
          >
            <Users size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{project.members.length}</span>
          </button>
          <button 
            onClick={() => setIsDocumentsOpen(true)}
            className="p-3 glass-panel hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white flex items-center gap-2 group"
          >
            <FileText size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{project.documents?.length || 0}</span>
          </button>
          <button 
            onClick={() => showToast("Filtering logic initialization in progress.", "info")}
            className="p-3 glass-panel hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
          >
            <Filter size={20} />
          </button>
          <button 
            onClick={() => showToast("Share link generated and copied to clipboard (simulated).", "success")}
            className="p-3 glass-panel hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => {
              setNewTaskStatus('todo');
              setIsAddTaskOpen(true);
            }}
            className="p-3 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Initialize Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'grid' ? (
          <KanbanBoard 
            tasks={filteredTasks} 
            onUpdateTask={updateTask} 
            onDeleteTask={deleteTask}
            onAddTask={(status) => {
              setNewTaskStatus(status);
              setIsAddTaskOpen(true);
            }} 
            onTaskClick={(task) => setSelectedTask(task)}
          />
        ) : (
          <div className="h-full overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>{searchQuery ? 'No tasks match your search.' : 'No tasks found in this environment.'}</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-white group-hover:text-sky-400 transition-colors uppercase text-sm">{task.title}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{task.description}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                            "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            task.status === 'done' ? "bg-emerald-500/20 text-emerald-400" :
                            task.status === 'in_progress' ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            task.priority === 'urgent' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                            task.priority === 'high' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const toastId = showToast("Purging task...", "loading");
                              try {
                                await deleteTask(task.id);
                                hideToast(toastId);
                                showToast("Task successfully purged.", "success");
                              } catch (err: any) {
                                console.error("Task deletion failed:", err);
                                hideToast(toastId);
                                let msg = "Failed to purge task.";
                                try {
                                  const parsed = JSON.parse(err.message);
                                  msg += ` Reason: ${parsed.error}`;
                                } catch {
                                  msg += ` ${err.message || "Access denied or network error."}`;
                                }
                                showToast(msg, "error");
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={deleteTask}
        />
      )}

      {/* Manage Members Modal */}
      <AnimatePresence>
        {isManageMembersOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-10 max-w-xl w-full shadow-2xl bg-[#1e293b]/90 border-white/20"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Access Control</h2>
                <button 
                  onClick={() => setIsManageMembersOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Invite Form */}
                <form onSubmit={handleAddMember} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <h3 className="text-[10px] uppercase font-black text-sky-400 mb-6 tracking-widest">Register New Associate</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <input 
                        type="email" 
                        required
                        placeholder="network-addr@proton.me"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full p-4 bg-black/20 border border-white/10 rounded-2xl focus:border-sky-500 outline-none transition-all placeholder-slate-700 font-medium text-white text-sm"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select 
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as any)}
                        className="p-4 bg-black/20 border border-white/10 rounded-2xl focus:border-sky-500 outline-none transition-all appearance-none cursor-pointer text-white font-black text-[10px] uppercase tracking-widest flex-1"
                      >
                        <option value="member" className="bg-slate-900">Member Role</option>
                        <option value="pm" className="bg-slate-900">Project Manager</option>
                        <option value="admin" className="bg-slate-900">Admin Authority</option>
                      </select>
                      <button 
                        type="submit"
                        disabled={isInviting}
                        className="py-4 px-8 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isInviting ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                        Authorize
                      </button>
                    </div>
                  </div>
                  {inviteError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-xs font-bold text-red-400 px-2"
                    >
                      {inviteError}
                    </motion.p>
                  )}
                </form>

                {/* Member List */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-2">Authorized Entities ({project.memberDetails?.length || project.members.length})</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {project.memberDetails?.map((member: ProjectMember) => (
                      <div key={member.email} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                            member.userId === project.ownerId ? "bg-amber-500/20 text-amber-500" : "bg-sky-500/10 text-sky-400"
                          )}>
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white uppercase tracking-tight">{member.email}</p>
                              {member.status === 'pending' && (
                                <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">Pending Invite</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {member.userId === project.ownerId ? 'Cluster Owner' : member.role}
                            </p>
                          </div>
                        </div>
                        {member.userId !== project.ownerId && member.userId !== user?.uid && (
                          <button 
                            disabled={deletingEmail === member.email}
                            onClick={() => handleRemoveMember(member.userId, member.email)}
                            className="p-2 text-slate-600 hover:text-red-400 opacity-40 group-hover:opacity-100 focus:opacity-100 transition-all disabled:opacity-20"
                          >
                            {deletingEmail === member.email ? (
                              <Loader2 size={16} className="animate-spin text-sky-400" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                    {(!project.memberDetails || project.memberDetails.length === 0) && project.members.map((uid) => (
                       <div key={uid} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4 text-slate-500">
                          <Users size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">{uid === project.ownerId ? 'System Owner' : 'Agent ' + uid.slice(0, 5)}</p>
                        </div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Documents Modal */}
      <AnimatePresence>
        {isDocumentsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-10 max-w-2xl w-full shadow-2xl bg-[#1e293b]/90 border-white/20"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Document Archive</h2>
                <button 
                  onClick={() => setIsDocumentsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] uppercase font-black text-sky-400 mb-6 tracking-widest">Execute Archive (AWS S3)</h3>
                  <FileUploader onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="flex flex-col h-full">
                  <h3 className="text-[10px] uppercase font-black text-slate-500 mb-6 tracking-widest px-2">Archived Metadata ({project.documents?.length || 0})</h3>
                  <div className="flex-1 max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {project.documents && project.documents.length > 0 ? (
                      project.documents.map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-sky-500/30 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate max-w-[150px]">{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">By {doc.uploadedBy.split('@')[0]}</p>
                            </div>
                          </div>
                          <ArrowLeft className="rotate-180 text-slate-700 group-hover:text-sky-400 transition-colors" size={14} />
                        </a>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4 opacity-40">
                        <FileText size={32} className="mx-auto text-slate-600" />
                        <p className="text-xs font-mono uppercase tracking-widest">Vault Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-10 max-w-lg w-full shadow-2xl bg-[#1e293b]/90 border-white/20"
            >
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Initialize Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Entry Title</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all placeholder-slate-600 font-medium text-white"
                    placeholder="Operation identifier..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Context & Parameters</label>
                  <textarea 
                    rows={3}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all placeholder-slate-600 font-medium text-white"
                    placeholder="Technical specifications..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Priority Tier</label>
                    <select 
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as Priority)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer text-white font-medium"
                    >
                      <option value="low" className="bg-slate-900">Low Priority</option>
                      <option value="medium" className="bg-slate-900">Medium Priority</option>
                      <option value="high" className="bg-slate-900">High Priority</option>
                      <option value="urgent" className="bg-slate-900">System Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Expiration (Due Date)</label>
                    <input 
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-500 focus:bg-white/10 outline-none transition-all text-white font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button 
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="flex-1 py-4 px-6 bg-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition-colors border border-white/5"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 px-6 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Plus size={20} />
                    Execute Deployment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
