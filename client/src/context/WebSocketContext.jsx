import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const WebSocketContext = createContext(null);

let globalWsInstance = null;
let globalConnectionCount = 0;

export function WebSocketProvider({ children }) {
  const [ws, setWs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const processedNotifications = useRef(new Set());

  useEffect(() => {
    globalConnectionCount++;
    
    if (globalWsInstance && (globalWsInstance.readyState === WebSocket.OPEN || globalWsInstance.readyState === WebSocket.CONNECTING)) {
      setWs(globalWsInstance);
      if (globalWsInstance.readyState === WebSocket.OPEN) {
        setIsConnected(true);
      }
      return () => {
        globalConnectionCount--;
      };
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const wsUrl = apiUrl.replace(/^http/, 'ws');

    const websocket = new WebSocket(wsUrl);
    globalWsInstance = websocket;

    websocket.onopen = () => {
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        
        const notificationKey = `${notification.type}-${notification.timestamp}-${JSON.stringify(notification.data)}`;
        
        if (processedNotifications.current.has(notificationKey)) {
          return;
        }
        
        processedNotifications.current.add(notificationKey);
        
        const notificationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notificationWithId = { ...notification, id: notificationId };
        
        setNotifications(prev => [...prev, notificationWithId]);
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          setTimeout(() => {
            processedNotifications.current.delete(notificationKey);
          }, 5000);
        }, 5000);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      if (globalWsInstance === websocket) {
        globalWsInstance = null;
      }
    };

    setWs(websocket);

    return () => {
      globalConnectionCount--;

      if (globalConnectionCount === 0 && globalWsInstance && (globalWsInstance.readyState === WebSocket.OPEN || globalWsInstance.readyState === WebSocket.CONNECTING)) {
        globalWsInstance.close();
        globalWsInstance = null;
      }
    };
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    isConnected,
    notifications,
    removeNotification
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
