/**
 * WebSocket Service
 * Connects to backend WebSocket for real-time dashboard updates.
 * Auto-reconnects on disconnect.
 */

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.subscribers = new Map();
        this.reconnectTimeout = null;
        this.reconnectDelay = 3000;
        this.maxReconnectDelay = 30000;
        this.connected = false;
    }

    connect() {
        if (this.ws && this.ws.readyState <= 1) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '5000';
        const url = `${protocol}//${host}:${port}/ws?channels=dashboard`;

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.connected = true;
                this.reconnectDelay = 3000;
                this._notifySubscribers('connection', { connected: true });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const channel = data.channel || 'default';
                    this._notifySubscribers(channel, data.payload || data);
                } catch (e) {
                    console.warn('WebSocket parse error:', e);
                }
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.connected = false;
                this._notifySubscribers('connection', { connected: false });
                this._scheduleReconnect();
            };

            this.ws.onerror = () => {
                this.connected = false;
            };
        } catch (e) {
            console.warn('WebSocket connection failed:', e);
            this._scheduleReconnect();
        }
    }

    _scheduleReconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
        }, this.reconnectDelay);
    }

    _notifySubscribers(channel, data) {
        const subs = this.subscribers.get(channel) || [];
        subs.forEach(cb => cb(data));
    }

    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, []);
        }
        this.subscribers.get(channel).push(callback);
        return () => this.unsubscribe(channel, callback);
    }

    unsubscribe(channel, callback) {
        const subs = this.subscribers.get(channel) || [];
        this.subscribers.set(channel, subs.filter(cb => cb !== callback));
    }

    disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }

    getStats() {
        return {
            connected: this.connected,
            subscriberCount: Array.from(this.subscribers.values()).reduce((sum, s) => sum + s.length, 0)
        };
    }
}

const wsClient = new WebSocketClient();
export default wsClient;
