import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listenForNotifications } from "@/services/notificationService";
import { motion as Motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const navigate = useNavigate();
  const { fetchChats, fetchMessages } = useChat();

  // Handle notifications queue
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      // Show the next notification in the queue
      setCurrentNotification({
        ...notifications[0],
        visible: true,
      });

      // Remove it from the queue
      setNotifications((prev) => prev.slice(1));
    }
  }, [notifications, currentNotification]);

  // Handle incoming notifications
  const handleNotification = useCallback(
    (payload) => {
      if (!payload) return;

      // Extract notification data from payload - FCM can have different formats
      const title = payload.notification?.title || payload.data?.title || "New notification";
      const body = payload.notification?.body || payload.data?.body || "";
      
      // FCM can place data either directly in payload.data or nested in payload.notification.data
      const data = payload.data || payload.notification?.data || {};

      const newNotification = {
        id: `notification-${Date.now()}`,
        title: title,
        body: body,
        data: data,
        timestamp: new Date(),
      };

      // If it's a chat message notification, fetch the updated messages
      if (data.type === "chat_message") {
        // Refresh chat list to show new messages
        fetchChats();

        // If we're already in the relevant chat, refresh the messages
        if (data.chatId) {
          fetchMessages(data.chatId);
        }
        
        // Add chat navigation URL
        newNotification.data.url = `/chat/${data.chatId}`;
      }

      // Add to queue or show immediately if no current notification
      if (currentNotification) {
        setNotifications((prev) => [...prev, newNotification]);
      } else {
        setCurrentNotification({
          ...newNotification,
          visible: true,
        });
      }
    },
    [currentNotification, fetchChats, fetchMessages]
  );

  // Handle navigation when clicking notification
  const handleNavigate = useCallback(() => {
    if (currentNotification?.data?.url) {
      navigate(currentNotification.data.url);
    }

    // Close notification
    setCurrentNotification((prev) =>
      prev ? { ...prev, visible: false } : null
    );

    // Clear after animation completes
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  }, [currentNotification, navigate]);

  // Handle closing notification
  const handleClose = useCallback((e) => {
    e.stopPropagation();

    // Start hide animation
    setCurrentNotification((prev) =>
      prev ? { ...prev, visible: false } : null
    );

    // Remove after animation completes
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  }, []);

  // Auto-hide notification after delay
  useEffect(() => {
    if (currentNotification?.visible) {
      const timer = setTimeout(() => {
        setCurrentNotification((prev) =>
          prev ? { ...prev, visible: false } : null
        );

        // Clear after animation completes
        setTimeout(() => {
          setCurrentNotification(null);
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  // Listen for notifications
  useEffect(() => {
    const unsubscribe = listenForNotifications(handleNotification);

    // Clean up listener
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [handleNotification]);

  // If no current notification or it's not visible, don't render anything
  if (!currentNotification) {
    return null;
  }

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
          <p className="text-sm font-medium text-gray-900">
            {currentNotification.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
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
