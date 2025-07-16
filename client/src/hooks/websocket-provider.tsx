import { createContext, ReactNode, useContext } from 'react';
import { useWebSocket, WebSocketMessage } from './use-websocket';

type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => boolean;
  updatePresence: (status: string, action?: string) => boolean;
  presenceData: Record<number, any>;
  notifications: WebSocketMessage[];
  lastActivity: Record<number, string>;
};

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const websocket = useWebSocket();
  
  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}