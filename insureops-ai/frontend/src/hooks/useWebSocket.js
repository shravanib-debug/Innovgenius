import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

const DEFAULT_CHANNELS = ['dashboard', 'traces', 'alerts'];

/**
 * useWebSocket — connects to backend WebSocket with auto-reconnect.
 *
 * Returns:
 *   isConnected  — boolean, true when WS is open
 *   subscribe(eventType, callback) — register a listener; returns unsubscribe fn
 *   connectionState — 'connecting' | 'connected' | 'disconnected'
 */
export function useWebSocket(channels) {
    // Stabilise channels reference so it never causes re-renders
    const stableChannels = useMemo(() => channels || DEFAULT_CHANNELS, []);

    const wsRef = useRef(null);
    const listenersRef = useRef(new Map());        // eventType → Set<callback>
    const reconnectTimer = useRef(null);
    const reconnectDelay = useRef(1000);
    const mountedRef = useRef(true);
    const intentionalClose = useRef(false);
    const [connectionState, setConnectionState] = useState('disconnected');

    /* ── build WS URL (stable — no deps that change) ── */
    const getWsUrl = useCallback(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        if (apiUrl && apiUrl.startsWith('http')) {
            const base = apiUrl.replace(/\/api\/?$/, '').replace(/^http/, 'ws');
            return `${base}/ws?channels=${stableChannels.join(',')}`;
        }
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${window.location.host}/ws?channels=${stableChannels.join(',')}`;
    }, [stableChannels]);

    /* ── subscribe to a specific event type ──────── */
    const subscribe = useCallback((eventType, callback) => {
        if (!listenersRef.current.has(eventType)) {
            listenersRef.current.set(eventType, new Set());
        }
        listenersRef.current.get(eventType).add(callback);

        return () => {
            const set = listenersRef.current.get(eventType);
            if (set) {
                set.delete(callback);
                if (set.size === 0) listenersRef.current.delete(eventType);
            }
        };
    }, []);

    /* ── lifecycle: single connect on mount ──────── */
    useEffect(() => {
        mountedRef.current = true;
        intentionalClose.current = false;
        let delay = 1000;

        function connect() {
            if (!mountedRef.current || intentionalClose.current) return;
            // Don't open a second connection if one is already open/connecting
            if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            try {
                const url = getWsUrl();
                const ws = new WebSocket(url);
                wsRef.current = ws;
                setConnectionState('connecting');

                ws.onopen = () => {
                    if (!mountedRef.current) { ws.close(); return; }
                    console.log('🔌 WebSocket connected');
                    setConnectionState('connected');
                    delay = 1000; // reset backoff on success
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        const eventType = msg.data?.type || msg.type;
                        if (!eventType) return;

                        // Dispatch to specific listeners
                        const cbs = listenersRef.current.get(eventType);
                        if (cbs) cbs.forEach(cb => { try { cb(msg.data || msg); } catch (e) { /* */ } });

                        // Dispatch to wildcard listeners
                        const wc = listenersRef.current.get('*');
                        if (wc) wc.forEach(cb => { try { cb(msg.data || msg); } catch (e) { /* */ } });
                    } catch (e) { /* ignore malformed */ }
                };

                ws.onclose = () => {
                    if (!mountedRef.current || intentionalClose.current) return;
                    setConnectionState('disconnected');
                    // Schedule reconnect with exponential backoff
                    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
                    reconnectTimer.current = setTimeout(() => {
                        delay = Math.min(delay * 2, 30000);
                        connect();
                    }, delay);
                };

                ws.onerror = () => {
                    // onclose fires after onerror — reconnection handled there
                };
            } catch (e) {
                console.warn('WebSocket connection failed:', e.message);
                setConnectionState('disconnected');
                if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
                reconnectTimer.current = setTimeout(() => {
                    delay = Math.min(delay * 2, 30000);
                    connect();
                }, delay);
            }
        }

        connect();

        return () => {
            mountedRef.current = false;
            intentionalClose.current = true;
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect on cleanup
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [getWsUrl]); // getWsUrl is stable (deps are stable)

    return {
        isConnected: connectionState === 'connected',
        connectionState,
        subscribe,
    };
}
