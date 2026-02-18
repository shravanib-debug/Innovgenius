import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getActiveAlerts } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * AlertBadge — Bell icon with active alert count.
 * Pulses when a new alert arrives via WebSocket.
 */
const AlertBadge = ({ onClick }) => {
    const [count, setCount] = useState(0);
    const [pulse, setPulse] = useState(false);
    const { subscribe } = useWebSocket();

    // Fetch initial alert count
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const alerts = await getActiveAlerts();
                setCount(Array.isArray(alerts) ? alerts.length : 0);
            } catch {
                setCount(0);
            }
        };
        fetchAlerts();
    }, []);

    // Subscribe for real-time alert updates
    useEffect(() => {
        const unsub = subscribe('alerts', () => {
            setCount(prev => prev + 1);
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
        });
        return unsub;
    }, [subscribe]);

    return (
        <button
            onClick={onClick}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={`${count} active alerts`}
        >
            <Bell className="w-5 h-5 text-[--color-text-secondary]" />
            {count > 0 && (
                <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 ${pulse ? 'animate-ping-once' : ''}`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
};

export default AlertBadge;
