import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listenForNotifications } from '@/services/notificationService';
import { motion as Motion } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useGroups } from '@/hooks/useGroups';

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const navigate = useNavigate();
  const { fetchChats, fetchMessages } = useChat();
  const { fetchLatestMessages: fetchGroupMessages } = useGroupChat();
  const { fetchGroups } = useGroups();

  // Show next notification if available
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification({ ...notifications[0], visible: true });
      setNotifications((prev) => prev.slice(1));
    }
  }, [notifications, currentNotification]);

  function getNotificationText(data, body) {
    let messageType = data?.message_type;

    if (!messageType && data?.body) {
      try {
        const parsed = JSON.parse(data.body);
        messageType = parsed.message_type;
      } catch {
        //pass
      }
    }

    const isFileMessage =
      messageType === 'file' || (body && (body.includes('fileName') || body.includes('filePath')));

    if (isFileMessage) {
      return 'New File Received';
    }

    return body || 'New message received';
  }

  // Handle notification payload
  const handleNotification = useCallback(
    (payload) => {
      if (!payload) return;
      const title = payload.notification?.title || payload.data?.title || 'New notification';
      const data = payload.data || payload.notification?.data || {};
      const body = getNotificationText(
        data,
        payload.notification?.body || payload.data?.body || '',
      );
      const newNotification = {
        id: `notification-${Date.now()}`,
        title,
        body,
        data,
        timestamp: new Date(),
      };

      if (data.type === 'chat_message') {
        const chatId = data.chatId;
        if (chatId) {
          if (chatId.startsWith('group-')) {
            const groupUuid = chatId.replace('group-', '');
            fetchGroupMessages(groupUuid);
            fetchGroups();
          } else {
            fetchMessages(chatId);
            fetchChats();
          }
        }
        newNotification.data.url = `/chat/${data.chatId}`;
      }

      currentNotification
        ? setNotifications((prev) => [...prev, newNotification])
        : setCurrentNotification({ ...newNotification, visible: true });
    },
    [currentNotification, fetchChats, fetchMessages, fetchGroupMessages, fetchGroups],
  );

  // Handle click to navigate to chat
  const handleNavigate = useCallback(() => {
    if (currentNotification?.data?.url) {
      navigate(currentNotification.data.url);
    }
    setCurrentNotification((prev) => (prev ? { ...prev, visible: false } : null));
    setTimeout(() => setCurrentNotification(null), 300);
  }, [currentNotification, navigate]);

  // Handle close button
  const handleClose = useCallback((e) => {
    e.stopPropagation();
    setCurrentNotification((prev) => (prev ? { ...prev, visible: false } : null));
    setTimeout(() => setCurrentNotification(null), 300);
  }, []);

  // Auto-hide notification after 5s
  useEffect(() => {
    if (currentNotification?.visible) {
      const timer = setTimeout(() => {
        setCurrentNotification((prev) => (prev ? { ...prev, visible: false } : null));
        setTimeout(() => setCurrentNotification(null), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  // Listen for notifications
  useEffect(() => {
    const unsubscribe = listenForNotifications(handleNotification);
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [handleNotification]);

  if (!currentNotification) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: currentNotification.visible ? 1 : 0,
        y: currentNotification.visible ? 0 : -20,
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
      onClick={handleNavigate}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <svg
            className="h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{currentNotification.title}</p>
          <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">
            {currentNotification.body}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </Motion.div>
  );
};

export default NotificationBanner;
