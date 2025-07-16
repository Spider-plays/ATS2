import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Message types for WebSocket communications
export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [presenceData, setPresenceData] = useState<Record<number, any>>({});
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [lastActivity, setLastActivity] = useState<Record<number, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);
  
  // Update presence status
  const updatePresence = useCallback((status: string, action?: string) => {
    if (!user) return false;
    
    return sendMessage({
      type: 'presence',
      status,
      action
    });
  }, [sendMessage, user]);
  
  // Set up WebSocket connection
  useEffect(() => {
    // Only connect if we have a user
    if (!user) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Authenticate the WebSocket connection
      sendMessage({
        type: 'auth',
        userId: user.id,
        role: user.role
      });
      
      // Set initial presence
      updatePresence('online');
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket message received:', data);
        
        switch (data.type) {
          case 'connection':
            // Connection confirmation
            console.log('WebSocket server connection confirmed');
            break;
            
          case 'auth_success':
            // Authentication successful
            console.log('WebSocket authentication successful');
            break;
            
          case 'presence_update':
            // Update presence data for a user
            if (data.userId) {
              setPresenceData(prev => ({
                ...prev,
                [data.userId]: {
                  status: data.status,
                  timestamp: data.timestamp
                }
              }));
              
              if (data.action) {
                setLastActivity(prev => ({
                  ...prev,
                  [data.userId]: data.action
                }));
              }
              
              // Show toast for certain actions
              if (data.action && data.userId !== user.id) {
                toast({
                  title: `User Activity`,
                  description: `${data.role}: ${data.action}`,
                  duration: 3000
                });
              }
            }
            break;
            
          case 'user_offline':
            // User went offline
            if (data.userId) {
              setPresenceData(prev => ({
                ...prev,
                [data.userId]: {
                  status: 'offline',
                  timestamp: new Date().toISOString()
                }
              }));
            }
            break;
            
          case 'user_created':
          case 'job_created':
          case 'applicant_created':
            // Add to notifications
            setNotifications(prev => [data, ...prev].slice(0, 10));
            
            // Show toast notification
            toast({
              title: data.type === 'user_created' 
                ? 'New User Added' 
                : data.type === 'job_created'
                  ? 'New Job Posted'
                  : 'New Applicant Added',
              description: data.type === 'user_created' 
                ? `${data.user.firstName} ${data.user.lastName} joined as ${data.user.role}`
                : data.type === 'job_created'
                  ? `New position: ${data.job.title}`
                  : `New applicant for ${data.jobTitle}`,
              duration: 5000
            });
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle errors
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to real-time updates',
        variant: 'destructive'
      });
    });
    
    // Connection closed
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    });
    
    // Activity tracking for rich presence
    const trackActivity = (action: string) => {
      updatePresence('active', action);
    };
    
    // Track form submissions
    const formElements = document.querySelectorAll('form');
    const formSubmitHandler = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formId = form.id || 'unknown-form';
      trackActivity(`submitted ${formId}`);
    };
    
    formElements.forEach(form => {
      form.addEventListener('submit', formSubmitHandler);
    });
    
    // Track navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      // Call the original function first
      originalPushState.apply(this, arguments as any);
      // Track the navigation
      trackActivity(`navigated to ${window.location.pathname}`);
    };
    
    // Set up periodic presence updates
    const activityInterval = setInterval(() => {
      updatePresence('online');
    }, 60000); // Every minute
    
    // Clean up on unmount
    return () => {
      formElements.forEach(form => {
        form.removeEventListener('submit', formSubmitHandler);
      });
      
      window.history.pushState = originalPushState;
      
      clearInterval(activityInterval);
      
      if (wsRef.current) {
        updatePresence('offline');
        wsRef.current.close();
      }
    };
  }, [user, sendMessage, updatePresence, toast]);
  
  return {
    isConnected,
    sendMessage,
    updatePresence,
    presenceData,
    notifications,
    lastActivity
  };
}