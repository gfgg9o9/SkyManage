import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Project, Task, Notification, Comment, TerminalEvent } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Ignore offline errors - Firestore will handle these internally with cache
  if (errorMessage.toLowerCase().includes('offline')) {
    console.warn(`Firestore is offline during ${operationType} on ${path}. Changes will sync when online.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Sort in memory to avoid mandatory index requirement
      projectsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      // Auto-migration for missing 'admins' field
      for (const p of projectsData) {
        if ((!p.admins || p.admins.length === 0) && p.ownerId === userId) {
          try {
            await updateDoc(doc(db, 'projects', p.id), {
              admins: [userId]
            });
          } catch (e) {
            console.warn("Migration failed for project", p.id, e);
          }
        }
      }

      setProjects(projectsData);
      setLoading(false);
}, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    return () => unsubscribe();
  }, [userId]);

  const createProject = async (name: string, description: string) => {
    if (!userId) return;
    const ownerEmail = auth.currentUser?.email || '';
    try {
      await addDoc(collection(db, 'projects'), {
        name,
        description,
        ownerId: userId,
        members: [userId],
        admins: [userId],
        memberDetails: [{
          userId,
          role: 'admin',
          email: ownerEmail,
          status: 'active'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      await logTerminalEvent({
        type: 'project_create',
        userId,
        userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown',
        projectName: name,
        details: `Initialized new mission cluster: ${name}`
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}`);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}`);
    }
  };

  const addProjectMember = async (projectId: string, email: string, role: 'admin' | 'pm' | 'member') => {
    // 1. Initial check on local state to avoid unnecessary DB calls/scary errors
    const projectDoc = projects.find(p => p.id === projectId);
    if (!projectDoc) return;

    const normalizedEmail = email.toLowerCase().trim();
    const currentMemberDetails = projectDoc.memberDetails || [];

    if (currentMemberDetails.some(m => m.email.toLowerCase() === normalizedEmail)) {
      // Instead of throwing a terminal error, we can just return or provide a non-critical error
      // The UI already shows the members, so the user can see they are there.
      // But for the sake of the hook caller, we'll return early.
      console.info(`AddMember: ${normalizedEmail} is already a member or invited.`);
      return; 
    }

    try {
      // 2. Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normalizedEmail), limit(1));
      const querySnapshot = await getDocs(q);

      const projectRef = doc(db, 'projects', projectId);
      const currentMembers = projectDoc.members || [];

      if (!querySnapshot.empty) {
        // User exists - add as active
        const invitedUser = querySnapshot.docs[0];
        const invitedUserId = invitedUser.id;

        if (currentMembers.includes(invitedUserId)) {
          return; // Already a member
        }

        // Notify existing user via API
        try {
          const inviteRes = await fetch('/api/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: normalizedEmail,
              projectName: projectDoc.name,
              role,
              inviterName: auth.currentUser?.displayName || auth.currentUser?.email
            })
          });

          const inviteData = await inviteRes.json();
          
          if (!inviteRes.ok) {
            console.warn("Email API error:", inviteData.error);
            // We don't throw here anymore so the DB update still happens
            // But we can inform the user via a side-effect if we had a toast system
          }

          if (inviteData.simulated) {
            console.warn("Invite email simulated (RESEND_API_KEY missing in settings)");
          }
        } catch (emailErr) {
          console.error("Failed to trigger notification email:", emailErr);
        }

        const updateData: any = {
          members: [...currentMembers, invitedUserId],
          memberDetails: [...currentMemberDetails, {
            userId: invitedUserId,
            role,
            email: normalizedEmail,
            status: 'active'
          }],
          updatedAt: new Date().toISOString()
        };

        if (role === 'admin') {
          updateData.admins = [...(projectDoc.admins || []), invitedUserId];
        } else if (role === 'pm') {
          updateData.pms = [...(projectDoc.pms || []), invitedUserId];
        }

        await updateDoc(projectRef, updateData);

        // Create notification for the user
        await addDoc(collection(db, 'notifications'), {
          userId: invitedUserId,
          type: 'project_invite',
          message: `You have been added to project: ${projectDoc.name}`,
          projectId: projectId,
          read: false,
          createdAt: new Date().toISOString()
        });
      } else {
        // User NOT found - add as pending and send invite email
        try {
          const inviteRes = await fetch('/api/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: normalizedEmail,
              projectName: projectDoc.name,
              role,
              inviterName: auth.currentUser?.displayName || auth.currentUser?.email
            })
          });

          const inviteData = await inviteRes.json();

          if (!inviteRes.ok) {
            console.warn("Email API error (Pending):", inviteData.error);
          }

          if (inviteData.simulated) {
            console.warn("Invite email simulated (RESEND_API_KEY missing in settings)");
          }
        } catch (emailErr) {
          console.error("Failed to trigger invite email:", emailErr);
        }

        await updateDoc(projectRef, {
          memberDetails: [...currentMemberDetails, {
            role,
            email: normalizedEmail,
            status: 'pending',
            invitedAt: new Date().toISOString()
          }],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}/members`);
    }
  };

  const removeProjectMember = async (projectId: string, userIdToRemove: string | undefined, emailToCompare: string) => {
    console.log('removeProjectMember called for:', { projectId, userIdToRemove, emailToCompare });
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        console.error('Project not found');
        throw new Error('Project not found.');
      }

      const projectData = projectSnap.data() as Project;
      console.log('Current project data:', projectData);

      if (userIdToRemove && projectData.ownerId === userIdToRemove) {
        throw new Error('Cannot remove the project owner.');
      }

      const currentMembers = projectData.members || [];
      const currentMemberDetails = projectData.memberDetails || [];
      const normalizedEmailToRemove = emailToCompare.toLowerCase().trim();

      const newMemberDetails = currentMemberDetails.filter(m => m.email.toLowerCase().trim() !== normalizedEmailToRemove);
      const newMembers = userIdToRemove ? currentMembers.filter(id => id !== userIdToRemove) : currentMembers;
      const newAdmins = userIdToRemove ? (projectData.admins || []).filter(id => id !== userIdToRemove) : (projectData.admins || []);
      const newPms = userIdToRemove ? (projectData.pms || []).filter(id => id !== userIdToRemove) : (projectData.pms || []);

      console.log('Updating project with:', { newMembers, newMemberDetails, newAdmins, newPms });

      await updateDoc(projectRef, {
        members: newMembers,
        memberDetails: newMemberDetails,
        admins: newAdmins,
        pms: newPms,
        updatedAt: new Date().toISOString()
      });
      console.log('Update successful');
    } catch (error) {
      console.error('Error in removeProjectMember:', error);
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}/members`);
    }
  };

  const claimInvitations = async (userId: string, email: string) => {
    try {
      // Find all projects where this email is 'pending'
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('memberDetails', 'array-contains', {
        email: email,
        status: 'pending'
      }));
      
      // Note: 'array-contains' with objects is tricky in Firestore. 
      // It's better to fetch projects where members *don't* contain userId but memberDetails might have email.
      // But for simplicity in this prototype, we'll iterate through locally loaded projects OR query just by email if we had a dedicated invitations collection.
      
      // Alternative: Query projects where the user isn't yet a member but details match.
      const allProjectsSnapshot = await getDocs(projectsRef);
      const normalizedEmail = email.toLowerCase().trim();
      
      for (const docSnapshot of allProjectsSnapshot.docs) {
        const data = docSnapshot.data() as Project;
        const pendingDetail = data.memberDetails?.find(m => m.email.toLowerCase().trim() === normalizedEmail && m.status === 'pending');
        
        if (pendingDetail) {
          const updatedDetails = data.memberDetails?.map(m => 
            m.email.toLowerCase().trim() === normalizedEmail ? { ...m, status: 'active' as const, userId } : m
          ) || [];
          
          await updateDoc(doc(db, 'projects', docSnapshot.id), {
            members: [...(data.members || []), userId],
            memberDetails: updatedDetails,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.warn("Failed to claim invitations automatically:", error);
    }
  };

  return { projects, loading, createProject, deleteProject, updateProject, addProjectMember, removeProjectMember, claimInvitations };
}

export function useTasks(projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      // Sort in memory to avoid index requirement
      tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tasks (projectId: ${projectId})`);
    });

    return () => unsubscribe();
  }, [projectId]);

  const createTask = async (task: Partial<Task>) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await logTerminalEvent({
        type: 'status_change',
        userId: auth.currentUser?.uid || 'unknown',
        userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown',
        projectId: task.projectId,
        taskId: docRef.id,
        taskTitle: task.title,
        details: `Task deployed: ${task.title}`
      });

      // If there is an assignee, notify them
      if (task.assigneeId && task.assigneeId !== auth.currentUser?.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: task.assigneeId,
          type: 'task_assigned',
          message: `New task assigned: ${task.title}`,
          projectId: task.projectId,
          taskId: docRef.id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      if (updates.status || updates.priority || updates.progress) {
        const taskSnap = await getDoc(taskRef);
        const taskData = taskSnap.data() as Task;
        await logTerminalEvent({
          type: 'status_change',
          userId: auth.currentUser?.uid || 'unknown',
          userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown',
          projectId: taskData.projectId,
          taskId: taskId,
          taskTitle: taskData.title,
          details: updates.status 
            ? `Vector realignment: ${taskData.title} -> ${updates.status.replace('_', ' ')}`
            : updates.progress
            ? `Mission calibration: ${taskData.title} reached ${updates.progress}%`
            : `Priority recalibrated: ${taskData.title} -> ${updates.priority}`
        });

        // Notify assignee if someone else changed it
        if (taskData.assigneeId && taskData.assigneeId !== auth.currentUser?.uid) {
          const changeType = updates.status ? 'status' : updates.priority ? 'priority' : 'progress';
          await addDoc(collection(db, 'notifications'), {
            userId: taskData.assigneeId,
            type: 'task_update',
            message: `Task ${changeType} updated: ${taskData.title} (${updates[changeType as keyof typeof updates]})`,
            projectId: taskData.projectId,
            taskId: taskId,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    const currentUserId = auth.currentUser?.uid;
    console.log(`Attempting to delete task: ${taskId} by user: ${currentUserId}`);
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log(`Successfully deleted task: ${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      handleFirestoreError(error, OperationType.WRITE, `tasks/${taskId}`);
    }
  };

  return { tasks, loading, createTask, updateTask, deleteTask };
}

export function useComments(taskId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    const q = query(
      collection(db, 'tasks', taskId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tasks/${taskId}/comments`);
    });

    return () => unsubscribe();
  }, [taskId]);

  const addComment = async (content: string) => {
    if (!taskId || !auth.currentUser) return;
    try {
      const taskSnap = await getDoc(doc(db, 'tasks', taskId));
      const taskData = taskSnap.data() as Task;

      await addDoc(collection(db, 'tasks', taskId, 'comments'), {
        content,
        taskId,
        projectId: taskData.projectId,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        authorPhoto: auth.currentUser.photoURL,
        createdAt: new Date().toISOString(),
      });

      // Basic mention detection
      const mentions = content.match(/@[\w.-]+@[\w.-]+\.\w+/g) || []; // Email pattern
      for (const email of mentions) {
        const cleanEmail = email.substring(1).toLowerCase();
        // Notify user with this email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail), limit(1));
        const userSnap = await getDocs(q);
        if (!userSnap.empty) {
          const mentionedUserId = userSnap.docs[0].id;
          if (mentionedUserId !== auth.currentUser.uid) {
            await addDoc(collection(db, 'notifications'), {
              userId: mentionedUserId,
              type: 'comment_mention',
              message: `${auth.currentUser.displayName || auth.currentUser.email} mentioned you in task: ${taskData.title}`,
              projectId: taskData.projectId,
              taskId: taskId,
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      // Notify assignee if not the author
      if (taskData.assigneeId && taskData.assigneeId !== auth.currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: taskData.assigneeId,
          type: 'comment_add',
          message: `New comment on task: ${taskData.title}`,
          projectId: taskData.projectId,
          taskId: taskId,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${taskId}/comments`);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!taskId) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${taskId}/comments/${commentId}`);
    }
  };

  return { comments, loading, addComment, deleteComment };
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications/${notificationId}`);
    }
  };

  const createNotification = async (notifData: Partial<Notification>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notifData,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'notifications');
    }
  };

  return { notifications, markAsRead, createNotification };
}

export function useTerminalEvents() {
  const [events, setEvents] = useState<TerminalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'terminal_events'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate().toISOString();
        }
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt || new Date().toISOString()
        } as TerminalEvent;
      });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'terminal_events');
    });

    return () => unsubscribe();
  }, []);

  return { events, loading };
}

export async function logTerminalEvent(event: Omit<TerminalEvent, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'terminal_events'), {
      ...event,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log terminal event:', error);
  }
}
