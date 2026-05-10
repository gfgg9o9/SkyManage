import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Save, LogOut } from 'lucide-react';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { useToast } from './Toast';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      // Identity check for firebase auth
      const authUser = user as unknown as FirebaseUser;
      await updateProfile(authUser, { displayName });
      showToast("Identity parameters synchronized.", "success");
    } catch (err) {
      console.error(err);
      showToast("Synchronization failed.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-mono">User Identity Control</h1>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Global Authentication Profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:border-sky-500 transition-all shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-sky-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || 'Anonymous Architect'}</h2>
              <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/20"
            >
              <LogOut size={14} />
              Terminate Session
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10"
          >
            <h3 className="text-[10px] uppercase font-black text-sky-400 mb-8 tracking-widest flex items-center gap-2">
              <Shield size={12} />
              Personal Data Modification
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Architect Designation</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-sky-500 outline-none transition-all placeholder-slate-600 font-bold"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 opacity-50">Communication Frequency (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-600 cursor-not-allowed font-mono text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? "Synchronizing..." : (
                  <>
                    <Save size={14} />
                    Commit Changes
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <div className="glass-card p-8 border-l-4 border-l-amber-500">
            <h4 className="text-[10px] font-black uppercase text-amber-500 mb-2 tracking-widest">Security Advisory</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Your account is secured via Firebase Authentication. SkyManage does not store plaintext passwords on localized storage. All data is synchronized across the encrypted cloud cluster.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
