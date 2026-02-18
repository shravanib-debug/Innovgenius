import { useState, useEffect, useRef, useCallback } from 'react';
import wsClient from '../services/websocket';

const useWebSocket = (channel = 'dashboard') => {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const callbacksRef = useRef(new Map());

    useEffect(() => {
        const unsubConn = wsClient.subscribe('_connection', ({ connected: c }) => {
            setConnected(c);
        });

        const unsubChannel = wsClient.subscribe(channel, (data) => {
            setLastMessage(data);
            // Notify any specific callbacks registered
            callbacksRef.current.forEach((cb) => cb(data));
        });

        setConnected(wsClient.connected);

        return () => {
            unsubConn();
            unsubChannel();
        };
    }, [channel]);

    const subscribe = useCallback((key, callback) => {
        callbacksRef.current.set(key, callback);
        return () => callbacksRef.current.delete(key);
    }, []);

    return { connected, lastMessage, subscribe };
};

export default useWebSocket;
