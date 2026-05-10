import React, { useState } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { Task, Status, Priority } from '../types';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  Flag,
  User as UserIcon,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
  onAddTask: (status: Status) => void;
  onTaskClick: (task: Task) => void;
}

const COLUMNS: { id: Status; title: string; color: string; accent: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-400', accent: 'text-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500', accent: 'text-amber-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500', accent: 'text-emerald-500' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
};

import { useToast } from './Toast';

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onAddTask, onTaskClick }: KanbanBoardProps) {
  const [taskMenuOpenId, setTaskMenuOpenId] = useState<string | null>(null);
  const { showToast, hideToast } = useToast();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const COLUMNS: { id: Status; title: string; color: string; accent: string }[] = [
    { id: 'todo', title: t('status.todo'), color: 'bg-slate-400', accent: 'text-slate-400' },
    { id: 'in_progress', title: t('status.in_progress'), color: 'bg-amber-500', accent: 'text-amber-500' },
    { id: 'done', title: t('status.done'), color: 'bg-emerald-500', accent: 'text-emerald-500' },
  ];
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    onUpdateTask(draggableId, { status: destination.droppableId as Status });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-6 custom-scrollbar">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div key={column.id} className="flex flex-col w-84 shrink-0 bg-white/5 backdrop-blur-md rounded-[32px] p-5 border border-white/5">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", column.color)} />
                  <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                    {column.title}
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-slate-500 border border-white/5">
                      {columnTasks.length}
                    </span>
                  </h3>
                </div>
                <button 
                  onClick={() => onAddTask(column.id)}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-sky-400 transition-all border border-transparent hover:border-white/5"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 min-h-[200px] transition-colors rounded-2xl space-y-4 pt-1",
                      snapshot.isDraggingOver && "bg-sky-500/5 ring-1 ring-inset ring-sky-500/10"
                    )}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={cn(
                              "bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 shadow-xl transition-all group active:scale-[0.98] text-left cursor-default",
                              snapshot.isDragging ? "bg-white/15 shadow-2xl border-sky-500/30 ring-2 ring-sky-500/20 scale-105 z-50" : "hover:bg-white/10 hover:border-white/20"
                            )}
                            onClick={(e) => {
                              // If they clicked the menu button, don't open details
                              if ((e.target as HTMLElement).closest('button')) return;
                              onTaskClick(task);
                            }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                PRIORITY_COLORS[task.priority]
                              )}>
                                {task.priority}
                              </span>
                              <div className="relative">
                                <button 
                                  onClick={() => setTaskMenuOpenId(taskMenuOpenId === task.id ? null : task.id)}
                                  className={cn(
                                    "p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all",
                                    taskMenuOpenId === task.id ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100"
                                  )}
                                >
                                  <MoreVertical size={14} />
                                </button>
                                
                                {taskMenuOpenId === task.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskMenuOpenId(null);
                                      }}
                                    />
                                    <div className="absolute right-0 mt-2 w-32 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-1 z-20 animate-in">
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const toastId = showToast(t('kanban.deleting'), "loading");
                                          try {
                                            await onDeleteTask?.(task.id);
                                            hideToast(toastId);
                                            showToast(t('kanban.deleted'), "success");
                                          } catch (err: any) {
                                            console.error("Task deletion failed:", err);
                                            hideToast(toastId);
                                            let msg = t('kanban.failed_delete');
                                            try {
                                              const parsed = JSON.parse(err.message);
                                              msg += ` Reason: ${parsed.error}`;
                                            } catch {
                                              msg += ` ${err.message || "Access denied or network error."}`;
                                            }
                                            showToast(msg, "error");
                                          }
                                          setTaskMenuOpenId(null);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2 font-bold transition-colors",
                                          currentLanguage === 'ar' ? "flex-row-reverse text-right" : "text-left"
                                        )}
                                      >
                                        <Trash2 size={12} />
                                        {t('kanban.delete_task')}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-white mb-2 leading-tight tracking-tight group-hover:text-sky-400 transition-colors uppercase text-sm">{task.title}</h4>
                            <p className="text-[11px] text-slate-400 mb-5 line-clamp-2 leading-relaxed">{task.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                              <div className="flex items-center gap-4 text-slate-500">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                      <Calendar size={12} className="text-sky-500" />
                                      <span className="text-[10px] font-bold font-mono tracking-tighter">{new Date(task.dueDate).toLocaleDateString(currentLanguage)}</span>
                                    </div>
                                  )}
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare size={12} />
                                  <span className="text-[10px] font-bold">0</span>
                                </div>
                              </div>
                              <div className="flex -space-x-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-[#1e293b] flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                                  <UserIcon size={12} className="text-indigo-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
