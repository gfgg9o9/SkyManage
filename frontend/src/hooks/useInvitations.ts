import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  inviterName: string;
  inviterEmail: string;
  recipientEmail: string;
  role: 'member' | 'pm' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  projectDetails?: any;
}

export function useInvitations(userId: string | null, userEmail: string | null) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userEmail) return;

    setLoading(true);

    // Use temporary API endpoint instead of Firestore (bypass for permissions)
    const fetchInvitations = async () => {
      try {
        console.log('Fetching invitations from API for:', userEmail);
        const response = await fetch(`/api/invitations?email=${encodeURIComponent(userEmail)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received invitations from API:', data.length);
          
          // Convert API data to Invitation format
          const invitationData: Invitation[] = data.map((inv: any) => ({
            ...inv,
            recipientEmail: inv.inviteeEmail, // Map field name for compatibility
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

    fetchInvitations();

    // Poll for updates every 30 seconds (temporary solution)
    const interval = setInterval(fetchInvitations, 30000);

    return () => clearInterval(interval);
  }, [userId, userEmail]);

  const acceptInvitation = async (invitationId: string) => {
    try {
      // Use temporary API endpoint instead of Firestore
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

      // TODO: Add user to project members when Firestore rules are deployed
      console.log('Note: Project member update skipped (requires Firestore rules)');

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      // Use temporary API endpoint instead of Firestore
      console.log('Declining invitation via API:', invitationId);
      
      const response = await fetch(`/api/invitations/${invitationId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      const result = await response.json();
      console.log('Invitation declined successfully via API:', result);

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
