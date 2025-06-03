import { useState, useEffect } from 'react';
import { onMessageListener } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const NotificationBanner = () => {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const messageListener = () => {
      onMessageListener()
        .then((payload) => {
          setNotification(payload.notification);
          setShow(true);
          setTimeout(() => {
            setShow(false);
          }, 5000);
        })
        .catch((err) => {
          console.error('Failed to receive notification:', err);
        });
    };

    messageListener();
    const intervalId = setInterval(messageListener, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleClick = () => {
    setShow(false);
    if (notification?.data?.type === 'new_message' && notification?.data?.senderId) {
      navigate(`/chat/${notification.data.senderId}`);
    } else {
      navigate('/chat');
    }
  };

  if (!show || !notification) return null;

  return (
    <div 
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 p-4 bg-white shadow-lg rounded-lg border-l-4 border-blue-500 cursor-pointer"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          <div className="mt-1 text-sm text-gray-500">
            {notification.body}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
