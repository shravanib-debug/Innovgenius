const WS_URL = import.meta.env.VITE_WS_URL ||
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.subscribers = new Map();
        this.reconnectTimer = null;
        this.reconnectDelay = 2000;
        this.maxReconnectDelay = 30000;
        this.connected = false;
    }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                console.log('[WS] Connected');
                this.connected = true;
                this.reconnectDelay = 2000;
                this._notifySubscribers('_connection', { connected: true });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const channel = data.channel || 'default';
                    this._notifySubscribers(channel, data.payload || data);
                } catch {
                    // ignore non-JSON messages
                }
            };

            this.ws.onclose = () => {
                console.log('[WS] Disconnected');
                this.connected = false;
                this._notifySubscribers('_connection', { connected: false });
                this._scheduleReconnect();
            };

            this.ws.onerror = () => {
                this.connected = false;
            };
        } catch {
            this._scheduleReconnect();
        }
    }

    _scheduleReconnect() {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
            this.connect();
        }, this.reconnectDelay);
    }

    _notifySubscribers(channel, data) {
        const callbacks = this.subscribers.get(channel) || [];
        callbacks.forEach((cb) => cb(data));
    }

    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, []);
        }
        this.subscribers.get(channel).push(callback);

        // Auto-connect on first subscription
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.connect();
        }

        // Return unsubscribe function
        return () => {
            const cbs = this.subscribers.get(channel) || [];
            this.subscribers.set(channel, cbs.filter((cb) => cb !== callback));
        };
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
}

// Singleton instance
const wsClient = new WebSocketClient();
export default wsClient;
