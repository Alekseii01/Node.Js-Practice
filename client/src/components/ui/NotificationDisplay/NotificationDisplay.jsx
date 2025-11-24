import React from 'react';
import { useWebSocket } from '../../../context/WebSocketContext';
import { FaBell, FaCheckCircle, FaEdit, FaTrash, FaPaperclip } from 'react-icons/fa';
import './NotificationDisplay.css';

function NotificationDisplay() {
  const { notifications, removeNotification } = useWebSocket();

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'article_created':
        return {
          icon: <FaCheckCircle className="notification-icon" />,
          title: 'Article Created',
          message: `"${notification.data.title}" has been created.`
        };
      case 'article_updated':
        return {
          icon: <FaEdit className="notification-icon" />,
          title: 'Article Updated',
          message: `"${notification.data.title}" has been updated.`
        };
      case 'article_deleted':
        return {
          icon: <FaTrash className="notification-icon" />,
          title: 'Article Deleted',
          message: 'An article has been deleted.'
        };
      case 'attachment_added':
        return {
          icon: <FaPaperclip className="notification-icon" />,
          title: 'Attachment Added',
          message: `File "${notification.data.filename}" was added to "${notification.data.articleTitle}".`
        };
      case 'attachment_removed':
        return {
          icon: <FaPaperclip className="notification-icon" />,
          title: 'Attachment Removed',
          message: `File "${notification.data.filename}" was removed from "${notification.data.articleTitle}".`
        };
      default:
        return {
          icon: <FaBell className="notification-icon" />,
          title: 'Notification',
          message: 'You have a new notification.'
        };
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => {
        const content = getNotificationContent(notification);
        return (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            {content.icon}
            <div className="notification-content">
              <h4 className="notification-title">{content.title}</h4>
              <p className="notification-message">{content.message}</p>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              ×
            </button>
            <div className={`notification-timer ${notification.type}`}></div>
          </div>
        );
      })}
    </div>
  );
}

export default NotificationDisplay;
