import { useState, useEffect, useRef, useCallback } from 'react';
import wsClient from '../services/websocket';

/**
 * Custom hook for WebSocket connection lifecycle.
 * Returns { connected, lastMessage, subscribe }.
 * Handles cleanup on unmount.
 */
export function useWebSocket() {
    const [connected, setConnected] = useState(wsClient.connected);
    const [lastMessage, setLastMessage] = useState(null);
    const unsubRefs = useRef([]);

    useEffect(() => {
        // Connect if not already
        wsClient.connect();

        // Listen for connection status changes
        const unsub = wsClient.subscribe('connection', (data) => {
            setConnected(data.connected);
        });
        unsubRefs.current.push(unsub);

        return () => {
            unsubRefs.current.forEach(fn => fn());
            unsubRefs.current = [];
        };
    }, []);

    const subscribe = useCallback((channel, callback) => {
        const unsub = wsClient.subscribe(channel, (data) => {
            setLastMessage(data);
            callback(data);
        });
        unsubRefs.current.push(unsub);
        return unsub;
    }, []);

    return { connected, lastMessage, subscribe };
}

export default useWebSocket;
