import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Settings from './components/Settings';
import MissionControl from './components/MissionControl';
import NeuralNetwork from './components/NeuralNetwork';
import TerminalLog from './components/TerminalLog';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useProjects } from './hooks/useFirestore';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { claimInvitations } = useProjects(user?.uid);

  useEffect(() => {
    if (user?.uid && user?.email) {
      claimInvitations(user.uid, user.email);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium animate-pulse">Initializing SkyManage...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedProjectId(null);
      }}
      onSelectProject={setSelectedProjectId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <AnimatePresence mode="wait">
        {selectedProjectId ? (
          <motion.div
            key="project-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ProjectDetails 
              projectId={selectedProjectId} 
              onBack={() => setSelectedProjectId(null)} 
              searchQuery={searchQuery}
            />
          </motion.div>
        ) : activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Dashboard 
              searchQuery={searchQuery} 
              onViewAuditLog={() => setActiveTab('live_terminal')}
            />
          </motion.div>
        ) : activeTab === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-full"
          >
            <Settings />
          </motion.div>
        ) : activeTab === 'projects' ? (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Projects onSelectProject={setSelectedProjectId} searchQuery={searchQuery} />
          </motion.div>
        ) : activeTab === 'mission_control' ? (
          <motion.div
            key="mission_control"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <MissionControl />
          </motion.div>
        ) : activeTab === 'neural_network' ? (
          <motion.div
            key="neural_network"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <NeuralNetwork />
          </motion.div>
        ) : activeTab === 'live_terminal' ? (
          <motion.div
            key="live_terminal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <TerminalLog />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}

import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
