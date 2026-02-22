import { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketContext = createContext({
    isConnected: false,
    connectionState: 'disconnected',
    subscribe: () => () => { },
});

/**
 * WebSocketProvider — wraps the dashboard to provide WS context.
 * All child components can call useWS() to subscribe to real-time events.
 */
export const WebSocketProvider = ({ children }) => {
    const ws = useWebSocket(['dashboard', 'traces', 'alerts']);

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};

/**
 * useWS — convenience hook to access WebSocket context.
 */
export const useWS = () => useContext(WebSocketContext);
