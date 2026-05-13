import React from 'react';
import { useInvitations } from '../hooks/useInvitations';
import { auth } from '../lib/firebase';

interface InvitationsProps {
  userId: string | null;
  userEmail: string | null;
}

export const Invitations: React.FC<InvitationsProps> = ({ userId, userEmail }) => {
  const { invitations, loading, acceptInvitation, declineInvitation } = useInvitations(userId, userEmail);

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      alert('Invitation accepted! You can now access the project.');
    } catch (error) {
      alert('Failed to accept invitation: ' + error);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
      alert('Invitation declined.');
    } catch (error) {
      alert('Failed to decline invitation: ' + error);
    }
  };

  if (!userId || !userEmail) {
    return (
      <div className="p-6 text-center text-gray-500">
        Please log in to view your invitations.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Invitations</h2>
        
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No pending invitations</div>
            <p className="text-gray-400 mt-2">You don't have any invitations to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {invitation.projectName}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>From:</strong> {invitation.inviterName} ({invitation.inviterEmail})
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Role:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          invitation.role === 'admin' ? 'bg-red-100 text-red-800' :
                          invitation.role === 'pm' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {invitation.role.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Invited:</strong> {invitation.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleAccept(invitation.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(invitation.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
