import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useFirestore';
import { useTasks } from '../hooks/useFirestore';
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  searchQuery?: string;
  onViewAuditLog?: () => void;
}

export default function Dashboard({ searchQuery = '', onViewAuditLog }: DashboardProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { projects } = useProjects(user?.uid);
  // For dashboard, we aggregate from first few projects or a specific one
  // In a real app, you might want to fetch all tasks for all projects or use a dedicated collection
  const mainProjectId = projects[0]?.id;
  const { tasks } = useTasks(mainProjectId);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: t('dashboard.total_tasks'), value: tasks.length, icon: ListTodo, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: t('dashboard.in_progress'), value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: t('dashboard.completed'), value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('dashboard.urgent'), value: tasks.filter(t => t.priority === 'urgent').length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const pieData = [
    { name: t('status.todo'), value: tasks.filter(t => t.status === 'todo').length, color: '#334155' },
    { name: t('status.in_progress'), value: tasks.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: t('status.done'), value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
  ];

  const averageProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length) 
    : 0;

  const barData = [
    { name: t('priority.low'), count: tasks.filter(t => t.priority === 'low').length },
    { name: t('priority.medium'), count: tasks.filter(t => t.priority === 'medium').length },
    { name: t('priority.high'), count: tasks.filter(t => t.priority === 'high').length },
    { name: t('priority.urgent'), count: tasks.filter(t => t.priority === 'urgent').length },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-white">{t('dashboard.welcome')}</h1>
        <p className="text-slate-400">{t('dashboard.status')} • {user?.displayName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-card p-6 border-l-4 border-l-sky-500 overflow-hidden relative"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">Fleet Synchronization</p>
            <h2 className="text-4xl font-black text-white">{averageProgress}%</h2>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase">Global progress Across all units</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-sky-500/30" style={{ width: '100%' }}>
            <div className="h-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]" style={{ width: `${averageProgress}%` }} />
          </div>
        </motion.div>

        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-5 group hover:bg-white/10 transition-all cursor-default"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform shadow-lg`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">{t('dashboard.task_status')}</h3>
            <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold uppercase tracking-widest">{t('dashboard.realtime')}</span>
          </div>
          <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-40 shrink-0">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-card p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Cluster Progression</h3>
            <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold uppercase tracking-widest">Active Units</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-white truncate max-w-[150px]">{project.name}</p>
                  <span className="text-[10px] font-mono text-sky-500">{(project as any).progress || 0}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(project as any).progress || 0}%` }}
                    className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                  />
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-xs text-slate-500 text-center py-20 font-mono tracking-widest uppercase">No Deployments</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">{t('dashboard.priority_dist')}</h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold uppercase tracking-widest">{t('dashboard.analytics')}</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-xl">{t('dashboard.recent_activity')}</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black uppercase">{t('dashboard.live')}</span>
            </div>
            <button 
              onClick={onViewAuditLog}
              className="text-sky-400 font-bold text-[10px] uppercase tracking-widest hover:underline transition-all"
            >
              {t('dashboard.audit_log')}
            </button>
          </div>
          <div className="space-y-4">
            {filteredTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group cursor-default">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-1 h-12 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]",
                    task.priority === 'urgent' ? "bg-red-500" : 
                    task.priority === 'high' ? "bg-amber-500" : 
                    task.priority === 'medium' ? "bg-sky-500" : "bg-slate-500"
                  )} />
                  <div>
                    <p className="font-bold text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight text-sm">{task.title}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">
                      {projects.find(p => p.id === task.projectId)?.name || 'Processing...'}
                    </p>
                  </div>
                </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                      task.status === 'done' ? "bg-emerald-500/20 text-emerald-400" :
                      task.status === 'in_progress' ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"
                    )}>
                      {t(`status.${task.status}`)}
                    </span>
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.deadline')}</p>
                      <p className="text-xs font-mono text-slate-300">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <ListTodo size={24} className="opacity-20" />
                </div>
                <p className="font-medium px-4">
                  {searchQuery ? t('dashboard.no_results') : t('dashboard.empty')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
