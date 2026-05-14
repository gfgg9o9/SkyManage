export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'done';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  lastLogin?: string;
}

export interface ProjectMember {
  userId?: string;
  role: 'admin' | 'editor' | 'viewer';
  email: string;
  status: 'active' | 'pending';
  invitedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[]; // Keep this for easy lookup in rules if needed
  admins?: string[];
  editors?: string[];
  memberDetails?: ProjectMember[]; // Added for roles and UI
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  dueDate?: string;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  projectId?: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

export interface TerminalEvent {
  id: string;
  type: 'task_move' | 'status_change' | 'user_join' | 'project_create' | 'comment_add';
  userId: string;
  userName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  details: string;
  createdAt: string;
}
