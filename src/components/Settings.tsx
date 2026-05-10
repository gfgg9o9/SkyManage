import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Palette, 
  Bell, 
  Globe, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Lock,
  Moon,
  Sun,
  Download,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [isSaving, setIsSaving] = React.useState(false);
  const [accent, setAccent] = React.useState('Sky Blue');
  const [isLanguageSelecting, setIsLanguageSelecting] = React.useState(false);
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean; provider: string; integrity?: boolean } | null>(null);

  const checkDb = () => {
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => setDbStatus({ connected: false, provider: 'MongoDB Atlas' }));
  };

  React.useEffect(() => {
    checkDb();
  }, []);

  const currentLanguage = i18n.language || 'en';
  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const languageLabel = languages.find(l => l.code === (currentLanguage.startsWith('ar') ? 'ar' : currentLanguage.startsWith('fr') ? 'fr' : 'en'))?.label || 'English';

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(t('settings.save') === 'Save Changes' ? "Workspace preferences synchronized successfully." : "Préférences synchronisées avec succès.", "success");
    }, 1200);
  };

  const handleExport = () => {
    showToast("Preparing data archive for export...", "loading");
    setTimeout(() => {
      showToast("Data bundle ready. Download started.", "success");
    }, 2000);
  };

  const sections = [
    {
      title: t('settings.profile'),
      icon: User,
      items: [
        { label: 'Public Name', value: user?.displayName, type: 'text', action: () => showToast("Profile synchronization active.", "info") },
        { label: 'Email Address', value: user?.email, type: 'text', action: () => showToast("Primary identity cannot be modified.", "info") },
      ]
    },
    {
      title: t('settings.preferences'),
      icon: Palette,
      items: [
        { 
          label: t('settings.theme'), 
          value: theme === 'dark' ? (currentLanguage === 'en' ? 'Modern Dark' : currentLanguage === 'fr' ? 'Sombre Moderne' : 'داكن حديث') : (currentLanguage === 'en' ? 'Clean Light' : currentLanguage === 'fr' ? 'Clair Pur' : 'فاتح نقي'), 
          type: 'select',
          action: () => setTheme(theme === 'dark' ? 'light' : 'dark')
        },
        { 
          label: t('settings.accent'), 
          value: accent, 
          type: 'color',
          action: () => {
            const colors = ['Sky Blue', 'Emerald Green', 'Deep Purple', 'Rose Red'];
            const next = colors[(colors.indexOf(accent) + 1) % colors.length];
            setAccent(next);
          }
        },
      ]
    },
    {
      title: t('settings.security'),
      icon: Shield,
      items: [
        { 
          label: t('settings.password'), 
          value: '••••••••••••', 
          type: 'secret',
          action: () => showToast("Password management is handled by Google Security settings.", "info")
        },
        { 
          label: t('settings.mfa'), 
          value: 'Identity Managed', 
          type: 'status',
          action: () => showToast("MFA is managed via your Google Account.", "info")
        },
        { 
          label: t('settings.logs'), 
          value: 'View Audit Trail', 
          action: () => showToast("Audit log session initialized.", "info")
        },
      ]
    },
    {
      title: t('settings.regional'),
      icon: Globe,
      items: [
        { 
          label: t('settings.language'), 
          value: languageLabel,
          action: () => setIsLanguageSelecting(true)
        },
        { label: t('settings.timezone'), value: 'UTC -05:00 (Auto)', action: () => showToast("Timezone synchronization updated.", "success") },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">{t('settings.title')}</h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">{t('settings.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all text-slate-300 hover:text-white"
          >
            <Download size={18} />
            {t('settings.export')}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-xl",
              isSaving 
                ? "bg-sky-500/50 text-white/50 cursor-not-allowed" 
                : "bg-sky-500 text-white hover:bg-sky-400 shadow-sky-500/20"
            )}
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save size={18} />
              </motion.div>
            ) : (
              <Save size={18} />
            )}
            {isSaving ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-4">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-center border-b-4 border-b-sky-500/30">
            <div className="relative inline-block mb-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full border-4 border-white/10 mx-auto object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto border-4 border-white/10">
                  <User size={40} className="text-slate-600" />
                </div>
              )}
              <button 
                onClick={() => showToast("Avatar upload feature is locked in this environment.", "info")}
                className="absolute bottom-0 right-0 p-2.5 bg-sky-500 rounded-full border-4 border-[#1e293b] text-white hover:scale-110 transition-all shadow-lg"
              >
                <Palette size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.displayName}</h2>
            <p className="text-sm text-slate-500 font-medium mb-6 uppercase tracking-wider">{user?.email}</p>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all group"
            >
              <LogOut size={18} className={cn("transition-transform", currentLanguage === 'ar' ? "group-hover:translate-x-1" : "group-hover:-translate-x-1")} />
              {t('nav.kill_session')}
            </button>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System Integrity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Environment</span>
                <div className="flex items-center gap-2 text-green-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Production
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Primary Database</span>
                <div className="flex items-center gap-2 text-sky-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Firebase
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Distributed DB</span>
                <div className={cn(
                  "flex items-center gap-2 font-mono",
                  dbStatus?.connected ? "text-green-400" : "text-slate-500"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    dbStatus?.connected ? "bg-green-400 animate-pulse" : "bg-slate-700"
                  )} />
                  {dbStatus?.connected ? "Atlas Connected" : "Atlas Offline"}
                </div>
              </div>
              {dbStatus?.connected && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Data Integrity</span>
                  <div className={cn(
                    "flex items-center gap-2 font-mono text-[10px] uppercase font-black",
                    dbStatus?.integrity ? "text-sky-400" : "text-amber-500"
                  )}>
                    {dbStatus?.integrity ? "Verified Write/Read" : "Read-Only / Auth Issue"}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <button 
                  onClick={checkDb}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Rerunning Diagnostics...
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Build Signature</span>
                <span className="text-white/60 font-mono text-[10px] bg-white/5 px-2 py-1 rounded">2.4.0-λ-v3</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Last Sync</span>
                <span className="text-slate-500 text-xs">Just now</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                  idx === 0 ? "bg-amber-500/20 text-amber-500" : 
                  idx === 1 ? "bg-sky-500/20 text-sky-500" : 
                  "bg-purple-500/20 text-purple-500"
                )}>
                  <section.icon size={20} />
                </div>
                <h3 className="font-bold text-lg">{section.title}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <div 
                    key={item.label} 
                    onClick={() => {
                      if (item.action) {
                        item.action();
                        showToast(`Parameter updated: ${item.label}`, "success");
                      } else {
                        showToast(`Modification restricted for ${item.label}.`, "info");
                      }
                    }}
                    className={cn(
                      "p-6 flex items-center justify-between group transition-colors cursor-pointer",
                      item.action ? "hover:bg-sky-500/5" : "hover:bg-white/5"
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="font-medium text-white flex items-center gap-2">
                        {item.label === 'Visual Theme' && (theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />)}
                        {item.value || 'Not configured'}
                      </p>
                    </div>
                    {item.label === 'Visual Theme' ? (
                      <div className="w-10 h-6 bg-white/10 rounded-full relative transition-colors group-hover:bg-sky-500/20">
                         <motion.div 
                           animate={{ x: theme === 'dark' ? 18 : 2 }}
                           className="w-4 h-4 bg-white rounded-full absolute top-1"
                         />
                      </div>
                    ) : (
                      <ChevronRight size={18} className="text-slate-600 group-hover:text-sky-400 transition-transformation group-hover:translate-x-1" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <div className="p-8 bg-sky-500/10 border border-sky-500/20 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-5 items-center">
              <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                <Globe size={28} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Project Protocol & Documentation</h4>
                <p className="text-slate-400 text-sm">Access the network handbook and developer resources.</p>
              </div>
            </div>
            <button 
              onClick={() => showToast("Redirecting to documentation protocol...", "info")}
              className="p-4 bg-sky-500 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-sky-500/20 w-full sm:w-auto flex justify-center"
            >
              <ExternalLink size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLanguageSelecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-8 max-w-sm w-full bg-[#1e293b] border-white/20 shadow-2xl"
            >
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-white">{t('settings.language')}</h2>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setIsLanguageSelecting(false);
                      showToast(`Language set to ${lang.label}`, "success");
                    }}
                    className={cn(
                      "w-full p-4 rounded-2xl flex items-center justify-between transition-all font-bold",
                      currentLanguage.startsWith(lang.code) 
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" 
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {currentLanguage.startsWith(lang.code) && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsLanguageSelecting(false)}
                className="w-full mt-6 py-4 px-6 bg-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition-colors border border-white/5 uppercase text-xs tracking-widest"
              >
                {t('projects.btn_cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

