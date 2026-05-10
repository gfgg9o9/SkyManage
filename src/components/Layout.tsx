import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  LogOut, 
  Bell, 
  Plus, 
  User as UserIcon,
  Search,
  Menu,
  X,
  Settings,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight,
  Bot,
  Share2,
  Terminal
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useFirestore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import SmartSearch from './SmartSearch';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectProject: (projectId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab, onSelectProject, searchQuery, setSearchQuery }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const currentLanguage = i18n.language || 'en';

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'projects', label: t('nav.projects'), icon: FolderKanban },
    { id: 'mission_control', label: t('nav.mission_control'), icon: Bot },
    { id: 'neural_network', label: t('nav.neural_network'), icon: Share2 },
    { id: 'live_terminal', label: t('nav.live_terminal'), icon: Terminal },
    { id: 'settings', label: t('nav.parameters'), icon: Settings },
  ];

  const { notifications, markAsRead } = useNotifications(user?.uid);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-white">
      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className={cn(
          "hidden md:flex flex-col bg-white/5 backdrop-blur-xl z-30",
          currentLanguage === 'ar' ? "border-l border-white/10" : "border-r border-white/10"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden transition-opacity duration-300", !isSidebarOpen && "opacity-0")}>
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">SkyManage</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-white/10 text-sky-400 font-medium" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", activeTab === item.id ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300")} />
              {isSidebarOpen && (
                <span className={cn("whitespace-nowrap transition-all", currentLanguage === 'ar' ? "mr-4" : "ml-4")}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <UserIcon size={20} className="text-slate-400" />
              </div>
            )}
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user?.displayName}</p>
                <button 
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium"
                >
                  {t('nav.kill_session')}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
        >
          <Menu size={20} />
        </button>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-[#1e293b]/95 backdrop-blur-2xl z-50 p-6 flex flex-col border-r border-white/10"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <span className="font-bold text-xl">SkyManage</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center w-full p-4 rounded-xl font-medium transition-all text-start",
                        activeTab === item.id ? "bg-white/10 text-sky-400" : "text-slate-400 hover:bg-white/5"
                      )}
                    >
                      <item.icon size={22} className={cn(currentLanguage === 'ar' ? "ml-4" : "mr-4")} />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                  <img src={user?.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                    <button onClick={logout} className="text-xs text-red-400 font-bold uppercase tracking-wider">{t('nav.kill_session')}</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center max-w-xl w-full">
            <SmartSearch onSelectProject={onSelectProject} onSelectTab={setActiveTab} />
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stack Status</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-green-400">Node Serverless Online</span>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={cn(
                  "p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl relative text-slate-400 transition-all",
                  isNotifOpen && "bg-white/10 border-white/20 text-white"
                )}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-sky-500 border-2 border-[#1e293b] rounded-full animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-96 bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Bell size={24} className="text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">All caught up!</p>
                            <p className="text-xs text-slate-500 mt-1">No new notifications for you.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id}
                                className={cn(
                                  "p-4 hover:bg-white/5 transition-colors group relative",
                                  !notif.read && "bg-sky-500/5"
                                )}
                              >
                                <div className="flex gap-4">
                                  <div className={cn(
                                    "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center",
                                    notif.read ? "bg-white/5 text-slate-500" : "bg-sky-500/20 text-sky-400"
                                  )}>
                                    <Bell size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm leading-snug mb-1",
                                      notif.read ? "text-slate-400" : "text-white font-medium"
                                    )}>
                                      {notif.message}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                      {formatDistanceToNow(new Date(notif.createdAt))} ago
                                    </p>
                                  </div>
                                  {!notif.read && (
                                    <button 
                                      onClick={() => markAsRead(notif.id)}
                                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-sky-400 transition-all self-start"
                                      title="Mark as read"
                                    >
                                      <Check size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-white/10 bg-white/5">
                        <button 
                          onClick={() => {
                            setActiveTab('live_terminal');
                            setIsNotifOpen(false);
                          }}
                          className="w-full py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                        >
                          View Activity Log
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-slate-400 transition-all",
                activeTab === 'settings' && "bg-white/10 border-white/20 text-white"
              )}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
