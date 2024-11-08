import React, { useState, useEffect, useRef } from 'react';  
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../features/notificationSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);
  const status = useSelector((state) => state.notifications.status);
  const error = useSelector((state) => state.notifications.error);
  const [localNotifications, setLocalNotifications] = useState([]);
  const popoverRef = useRef(null);
  const ws = useRef(null);
  const navigate = useNavigate();

  // Updated base URL
  const baseUrl = "https://talkstream.xyz"; 

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (notifications) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        profilePictureUrl: new URL(notification.sender.profile_picture, baseUrl).toString()
      }));
      setLocalNotifications(updatedNotifications);
    }
  }, [notifications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const wsUrl = `https://talkstream.xyz/ws/notifications/?token=${token}`; // Updated WebSocket URL

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      const profilePictureUrl = newNotification.sender.profile_picture 
        ? new URL(newNotification.sender.profile_picture, baseUrl).toString() 
        : null;
      
      const updatedNotification = {
        ...newNotification,
        profilePictureUrl,
      };

      setLocalNotifications((prevNotifications) => [updatedNotification, ...prevNotifications]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleNotificationClick = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('https://talkstream.xyz/api/notifications/mark-all-read/', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setLocalNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      updateUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const updateUnreadCount = (count) => {
    localStorage.setItem('notificationCount', count);
  };

  const togglePopover = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      handleNotificationClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  const unreadCount = localNotifications.filter((notif) => !notif.is_read).length;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button onClick={togglePopover} className="relative flex items-center">
        <FontAwesomeIcon icon={faBell} className="text-blue-600 text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 max-h-[500px] overflow-y-auto scrollbar-hide" style={{ left: '-360px' }}>
          <style>
            {`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}
          </style>

          <h2 className="text-xl font-bold mb-4">Notifications</h2>

          {status === 'loading' && <div className="text-center py-4">Loading...</div>}
          {status === 'failed' && <div className="text-center py-4 text-red-500">Error: {error}</div>}
          {localNotifications.length === 0 ? (
            <div className="p-4 text-gray-600">No notifications yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {localNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`py-3 px-4 cursor-pointer transition duration-200 ease-in-out ${notification.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={notification.profilePictureUrl} 
                        alt="Profile"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="text-sm">
                        <p>{notification.message}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
