import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { 
  FolderOpen, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Cpu, 
  Layers, 
  Workflow, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Database,
  BarChart3
} from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-sky-500/30 overflow-x-hidden">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase">SkyManage</span>
          </div>
          <button 
            onClick={signIn}
            className="text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
          >
            Access Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] uppercase italic">
                Deploy <span className="text-sky-500 not-italic">Limitless</span> Productivity.
              </h1>
              <p className="text-xl text-slate-400 max-w-md font-medium leading-relaxed">
                The next-generation cloud-native workspace for high-performance engineering teams.
              </p>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={signIn}
                className="flex items-center justify-center gap-4 bg-white text-slate-900 px-10 py-6 rounded-3xl font-black text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.03] active:scale-95 transition-all shadow-2xl group"
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="w-6 h-6" />
                AUTHENTICATE
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/10">
               <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-sky-400">100%</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Serverless</p>
               </div>
               <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-sky-400">LIVE</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Clusters</p>
               </div>
               <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-sky-400">AES</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Encrypted</p>
               </div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative hidden lg:block"
          >
            <div className="glass-card p-2 rounded-[50px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 aspect-[4/3]">
              <div className="h-full bg-[#0f172a]/90 backdrop-blur-2xl rounded-[44px] p-10 overflow-hidden border border-white/5">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/50" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500/50" />
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="bg-white/5 px-6 py-2 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Infrastructure Monitor</div>
                </div>
                
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="h-32 bg-sky-500/10 rounded-3xl border border-sky-500/20" />
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                    <div className="h-3 bg-white/5 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2" />
                  </div>
                  <div className="pt-6">
                    <div className="h-56 bg-white/5 rounded-[40px] border border-dashed border-white/10 flex items-center justify-center">
                       <FolderOpen size={64} className="text-white/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass-panel px-6 py-4 rounded-2xl shadow-2xl border-sky-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">System Operational</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-40 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Why SkyManage?</h2>
              <h3 className="text-4xl md:text-6xl font-black italic uppercase leading-none">Built for the <span className="text-sky-500 not-italic">Modern</span> Workforce.</h3>
            </div>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest max-w-xs">Engineered to eliminate fragmentation and maximize velocity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={32} />, title: "Absolute Security", desc: "Enterprise-grade encryption and Firebase authentication ensure your data remains in your control." },
              { icon: <Zap size={32} />, title: "Serverless Speed", desc: "Built on AWS Lambda for instant response times and automatic elastic scaling." },
              { icon: <Globe size={32} />, title: "Global Sync", desc: "Real-time synchronization across all team clusters ensures nobody is left behind." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 space-y-6 group hover:bg-white/[0.05] transition-all"
              >
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic">{item.title}</h4>
                <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-40 relative px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">The Workflow</h2>
            <h3 className="text-5xl md:text-7xl font-black italic uppercase">From Initialization <br/> to <span className="text-sky-500 not-italic">Deployment</span>.</h3>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {[
                { step: "01", icon: <Cpu />, title: "Authenticate", desc: "Verify your identity through our encrypted auth node via Google Cloud Identity." },
                { step: "02", icon: <Layers />, title: "Define Cluster", desc: "Initialize a new project cluster and designate project managers and team roles." },
                { step: "03", icon: <Workflow />, title: "Deploy Tasks", desc: "Orchestrate objectives through our tactile board system with real-time tracking." },
                { step: "04", icon: <BarChart3 />, title: "Analyze metrics", desc: "Monitor team velocity and operational progress through the dashboard node." },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative space-y-6 text-center lg:text-left group"
                >
                  <div className="w-20 h-20 mx-auto lg:mx-0 bg-[#0f172a] border border-white/10 rounded-[2.5rem] flex items-center justify-center text-sky-500 text-3xl shadow-xl relative z-10 group-hover:border-sky-500/50 transition-all">
                    {item.icon}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-sky-500 text-white rounded-xl text-[10px] font-black flex items-center justify-center italic">
                      {item.step}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-40 bg-white/[0.02] border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4 mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Core Architecture</h2>
            <h3 className="text-5xl font-black italic uppercase">The Tactical Stack.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Dynamic Kanban", icon: <Layers />, tag: "INTERACTIVE" },
              { title: "S3 Documents", icon: <FolderOpen />, tag: "STORAGE" },
              { title: "Smart Search", icon: <Database />, tag: "INTELLIGENCE" },
              { title: "Role Management", icon: <Users />, tag: "AUTH" },
              { title: "Real-time Stats", icon: <BarChart3 />, tag: "ANALYTICS" },
              { title: "Auto-Scaling", icon: <Zap />, tag: "INFRA" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-8 bg-[#0f172a]/50 border border-white/5 rounded-3xl flex items-center gap-6 group hover:border-sky-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-sky-500 transition-colors">{feature.tag}</span>
                  <p className="font-black uppercase tracking-tight italic">{feature.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-5xl md:text-8xl font-black italic uppercase leading-none tracking-tighter">Ready to <span className="text-sky-500 not-italic">Sync</span>?</h2>
          <button 
            onClick={signIn}
            className="inline-flex items-center justify-center gap-4 bg-sky-500 text-white px-12 py-8 rounded-3xl font-black text-2xl hover:shadow-[0_0_50px_rgba(14,165,233,0.4)] hover:scale-[1.05] active:scale-95 transition-all group"
          >
            START MISSION
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#020617] relative z-10 px-6 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-lg tracking-tighter uppercase">SkyManage</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy Node</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Terms of Vector</a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">© 2025 SkyManage Cloud-Native. All vectors reserved.</p>
        </div>
      </footer>
    </div>
  );
}
