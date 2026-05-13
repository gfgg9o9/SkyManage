import React from 'react';
import { X, Check, X as XIcon } from 'lucide-react';

interface NotificationItemProps {
  id: string;
  type: 'invitation' | 'project_update' | 'task_assigned';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  isRead,
  onAccept,
  onDecline,
  onMarkAsRead,
  onDismiss
}) => {
  const handleNotificationClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAccept) onAccept();
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDecline) onDecline();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) onDismiss(id);
  };

  const getTypeColor = () => {
    switch (type) {
      case 'invitation':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'project_update':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'task_assigned':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'invitation':
        return '📧';
      case 'project_update':
        return '📊';
      case 'task_assigned':
        return '✅';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`relative border rounded-lg p-4 mb-3 cursor-pointer transition-all hover:shadow-md ${
        isRead ? 'bg-white opacity-75' : 'bg-white border-l-4'
      } ${getTypeColor()}`}
      onClick={handleNotificationClick}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>

      {/* Notification content */}
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getTypeIcon()}</div>
        <div className="flex-1">
          <h4 className={`font-semibold ${isRead ? 'text-gray-600' : 'text-gray-800'}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${isRead ? 'text-gray-500' : 'text-gray-600'}`}>
            {message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {timestamp.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action buttons for invitations */}
      {type === 'invitation' && !isRead && (
        <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handleAccept}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            <Check size={14} />
            <span>Accept</span>
          </button>
          <button
            onClick={handleDecline}
            className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            <XIcon size={14} />
            <span>Decline</span>
          </button>
        </div>
      )}

      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};
