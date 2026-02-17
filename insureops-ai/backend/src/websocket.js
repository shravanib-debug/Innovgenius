/**
 * WebSocket Manager
 * Manages real-time connections for dashboard updates, trace streaming, and alert notifications.
 * Uses the `ws` library with channel-based subscriptions.
 */

const { WebSocketServer } = require('ws');
const url = require('url');

class WebSocketManager {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // clientId -> { ws, channels: Set }
        this.channels = new Map(); // channel -> Set of clientIds
    }

    /**
     * Initialize WebSocket server on existing HTTP server
     */
    init(server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });

        this.wss.on('connection', (ws, req) => {
            const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            // Parse query params for initial channel subscriptions
            const params = url.parse(req.url, true).query;
            const initialChannels = params.channels ? params.channels.split(',') : ['dashboard'];

            // Register client
            this.clients.set(clientId, { ws, channels: new Set(initialChannels) });

            // Subscribe to initial channels
            initialChannels.forEach(ch => {
                if (!this.channels.has(ch)) this.channels.set(ch, new Set());
                this.channels.get(ch).add(clientId);
            });

            console.log(`🔌 WebSocket client connected: ${clientId} → [${initialChannels.join(', ')}]`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                clientId,
                channels: initialChannels,
                timestamp: new Date().toISOString()
            }));

            // Handle incoming messages (subscribe/unsubscribe)
            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    this._handleMessage(clientId, msg);
                } catch (e) {
                    // Ignore malformed messages
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                this._removeClient(clientId);
                console.log(`🔌 WebSocket client disconnected: ${clientId}`);
            });

            ws.on('error', () => {
                this._removeClient(clientId);
            });
        });

        console.log('🔌 WebSocket server initialized on /ws');
    }

    /**
     * Handle client messages (subscribe/unsubscribe)
     */
    _handleMessage(clientId, msg) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (msg.action === 'subscribe' && msg.channel) {
            client.channels.add(msg.channel);
            if (!this.channels.has(msg.channel)) this.channels.set(msg.channel, new Set());
            this.channels.get(msg.channel).add(clientId);
        }

        if (msg.action === 'unsubscribe' && msg.channel) {
            client.channels.delete(msg.channel);
            if (this.channels.has(msg.channel)) {
                this.channels.get(msg.channel).delete(clientId);
            }
        }
    }

    /**
     * Remove client from all channels
     */
    _removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.channels.forEach(ch => {
                if (this.channels.has(ch)) {
                    this.channels.get(ch).delete(clientId);
                }
            });
        }
        this.clients.delete(clientId);
    }

    /**
     * Broadcast data to all clients on a specific channel
     */
    broadcast(channel, data) {
        const subscribers = this.channels.get(channel);
        if (!subscribers || subscribers.size === 0) return;

        const payload = JSON.stringify({
            channel,
            data,
            timestamp: new Date().toISOString()
        });

        subscribers.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client && client.ws.readyState === 1) { // OPEN
                try {
                    client.ws.send(payload);
                } catch (e) {
                    // Client disconnected, will be cleaned up on close event
                }
            }
        });
    }

    /**
     * Broadcast a new trace event
     */
    broadcastTrace(trace) {
        this.broadcast('traces', { type: 'new_trace', trace });
        this.broadcast('dashboard', { type: 'trace_update', traceId: trace.id || trace.trace_id });
    }

    /**
     * Broadcast an alert event
     */
    broadcastAlert(alert) {
        this.broadcast('alerts', { type: 'new_alert', alert });
        this.broadcast('dashboard', { type: 'alert_update', alert });
    }

    /**
     * Broadcast metrics update
     */
    broadcastMetricsUpdate(metrics) {
        this.broadcast('dashboard', { type: 'metrics_update', metrics });
    }

    /**
     * Get connection stats
     */
    getStats() {
        return {
            totalClients: this.clients.size,
            channels: Object.fromEntries(
                Array.from(this.channels.entries()).map(([ch, subs]) => [ch, subs.size])
            )
        };
    }
}

// Singleton
const wsManager = new WebSocketManager();
module.exports = wsManager;
