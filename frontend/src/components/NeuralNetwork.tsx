import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useProjects } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Project, Task } from '../types';
import { motion } from 'motion/react';
import { Share2, Info, Maximize2, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'project' | 'task';
  status?: string;
  priority?: string;
  color: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export default function NeuralNetwork() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = React.useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (projectsLoading) return;
    if (projects.length === 0) {
      setLoadingTasks(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const allTasks: Task[] = [];
        // Fetch tasks per project to respect security rules and avoid global list denial
        for (const project of projects) {
          const q = query(collection(db, 'tasks'), where('projectId', '==', project.id));
          const snapshot = await getDocs(q);
          const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
          allTasks.push(...tasksData);
        }
        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to fetch tasks for network view:", err);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [projects, projectsLoading]);

  const data = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Colors
    const projectColor = '#0ea5e9'; // sky-500
    const taskColors: Record<string, string> = {
      todo: '#64748b', // slate-500
      in_progress: '#f59e0b', // amber-500
      done: '#10b981' // emerald-500
    };

    projects.forEach(p => {
      nodes.push({ id: p.id, name: p.name, type: 'project', color: projectColor });
      
      const projectTasks = tasks.filter(t => t.projectId === p.id);
      projectTasks.forEach(t => {
        nodes.push({ 
          id: t.id, 
          name: t.title, 
          type: 'task', 
          status: t.status, 
          priority: t.priority,
          color: taskColors[t.status] || taskColors.todo 
        });
        links.push({ source: p.id, target: t.id });
      });
    });

    return { nodes, links };
  }, [projects, tasks]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const link = g.append('g')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(data.links)
      .join('line');

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => d.type === 'project' ? 12 : 6)
      .attr('fill', d => d.color)
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 2)
      .style('filter', d => `drop-shadow(0 0 5px ${d.color}44)`);

    node.append('text')
      .attr('dy', d => d.type === 'project' ? 24 : 16)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255, 255, 255, 0.6)')
      .attr('font-size', d => d.type === 'project' ? '10px' : '8px')
      .attr('font-family', 'monospace')
      .attr('font-weight', d => d.type === 'project' ? 'bold' : 'normal')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
            <Share2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Neural Network View</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Global Dependency Mapping Phase v2.1</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <Zap size={12} className="text-amber-500" />
            <span>Real-time Sync Active</span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden relative cursor-crosshair"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none"></div>
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Network Overlay UI */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-2">
          <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.4)]"></div>
               <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Project Cluster</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Completed Objective</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Active Task Sector</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
               <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Pending Telemetry</span>
             </div>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2">
            <Info size={12} className="text-sky-400" />
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">Scroll to zoom • Drag to navigate</span>
          </div>
        </div>

        <button className="absolute top-8 right-8 p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
}
