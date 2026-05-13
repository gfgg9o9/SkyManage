import React, { useState } from 'react';
import { Bell, Settings, X } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useInvitations } from '../hooks/useInvitations';
import { auth } from '../lib/firebase';

interface Notification {
  id: string;
  type: 'invitation' | 'project_update' | 'task_assigned';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  invitationId?: string;
}

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { acceptInvitation, declineInvitation } = useInvitations(auth.currentUser?.uid, auth.currentUser?.email);

  // Mock notifications - in real app, these would come from Firestore
  const [mockNotifications, setMockNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'invitation',
      title: 'Project Invitation',
      message: 'You have been added to project: ggfgf',
      timestamp: new Date(),
      isRead: false,
      invitationId: 'inv_123'
    },
    {
      id: '2',
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task in Project Alpha',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    }
  ]);

  const allNotifications = [...mockNotifications, ...notifications];

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      // Remove the notification after accepting
      setMockNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
      setIsOpen(false); // Close panel after action
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
      // Remove the notification after declining
      setMockNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
      setIsOpen(false); // Close panel after action
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setMockNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleDismiss = (notificationId: string) => {
    setMockNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-gray-600">
                <Settings size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto p-4">
            {allNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              allNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.timestamp}
                  isRead={notification.isRead}
                  onAccept={() => notification.invitationId && handleAcceptInvitation(notification.invitationId)}
                  onDecline={() => notification.invitationId && handleDeclineInvitation(notification.invitationId)}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
