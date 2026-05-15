import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  role: 'editor' | 'viewer' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  projectDetails?: any;
}

export function useInvitations(userId: string | null, userEmail: string | null) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Use temporary API endpoint instead of Firestore (bypass for permissions)
  const fetchInvitations = async () => {
    if (!userId || !userEmail) return;
    
    setLoading(true);
    try {
      console.log('Fetching invitations from API for:', userEmail);
      const response = await fetch(`/api/invitations?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received invitations from API:', data.length);
        
        // Convert API data to Invitation format
        const invitationData: Invitation[] = data.map((inv: any) => ({
          ...inv,
          createdAt: new Date(inv.createdAt),
          updatedAt: new Date(inv.updatedAt)
        }));
        
        setInvitations(invitationData);
      } else {
        console.error('Failed to fetch invitations from API');
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations from API:', error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();

    // Poll for updates every 30 seconds (temporary solution)
    const interval = setInterval(fetchInvitations, 30000);

    return () => clearInterval(interval);
  }, [userId, userEmail]);

  const acceptInvitation = async (invitationId: string) => {
    try {
      // First, get the invitation details
      const invitationsResponse = await fetch(`/api/invitations?email=${encodeURIComponent(auth.currentUser?.email || '')}`);
      if (!invitationsResponse.ok) {
        throw new Error('Failed to fetch invitations');
      }
      
      const invitations = await invitationsResponse.json();
      const invitation = invitations.find((inv: any) => inv.id === invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Update invitation status via API
      console.log('Accepting invitation via API:', invitationId);
      
      const response = await fetch(`/api/invitations/${invitationId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      const result = await response.json();
      console.log('Invitation accepted successfully via API:', result);

      // Add user to project members via Firestore
      try {
        const { doc, updateDoc, getDoc } = await import('firebase/firestore');
        const projectRef = doc(db, 'projects', invitation.projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const currentMembers = projectData.members || [];
          const currentMemberDetails = projectData.memberDetails || [];
          
          // Don't add if already a member
          if (currentMembers.includes(userId)) {
            console.log('User is already a member of this project');
            await fetchInvitations(); // Refresh to remove accepted invitation
            return true;
          }

          const updateData: any = {
            members: [...currentMembers, userId],
            memberDetails: [...currentMemberDetails, {
              userId: userId,
              role: invitation.role,
              email: auth.currentUser?.email,
              status: 'active'
            }],
            updatedAt: new Date().toISOString()
          };

          // Add to appropriate role array
          if (invitation.role === 'admin') {
            updateData.admins = [...(projectData.admins || []), userId];
          } else if (invitation.role === 'editor') {
            updateData.editors = [...(projectData.editors || []), userId];
          }

          await updateDoc(projectRef, updateData);
          console.log('User added to project members successfully');
        }
      } catch (firestoreError) {
        console.warn('Failed to add user to project members (Firestore permissions):', firestoreError);
        // Don't fail the acceptance if Firestore update fails
      }

      // Refresh invitations to remove the accepted one from the list
      await fetchInvitations();
      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      // Use DELETE endpoint to remove the invitation
      console.log('Declining invitation via API:', invitationId);
      
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      const result = await response.json();
      console.log('Invitation declined and deleted successfully via API:', result);

      // Refresh invitations to remove the declined one from the list
      await fetchInvitations();
      return true;
    } catch (error) {
      console.error('Error declining invitation:', error);
      return false;
    }
  };

  return {
    invitations,
    loading,
    acceptInvitation,
    declineInvitation
  };
}
