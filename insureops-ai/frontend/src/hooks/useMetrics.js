import { useState, useEffect, useCallback, useRef } from 'react';
import { getSection1Metrics, getSection2Metrics } from '../services/api';
import { useWebSocket } from './useWebSocket';

/**
 * Custom hook for fetching section metrics.
 * Fetches on mount and when timeRange changes.
 * Subscribes to WebSocket for real-time deltas.
 * Returns { data, loading, error, refetch }.
 */
export function useMetrics(section = 'section1', timeRange = '24h') {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { subscribe } = useWebSocket();
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetcher = section === 'section1' ? getSection1Metrics : getSection2Metrics;
            const result = await fetcher(timeRange);
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || 'Failed to fetch metrics');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [section, timeRange]);

    // Fetch on mount and when deps change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Subscribe to WebSocket updates for this section
    useEffect(() => {
        const channel = section === 'section1' ? 'metrics:section1' : 'metrics:section2';
        const unsub = subscribe(channel, (delta) => {
            if (mountedRef.current) {
                setData(prev => prev ? { ...prev, ...delta } : delta);
            }
        });
        return unsub;
    }, [section, subscribe]);

    // Cleanup
    useEffect(() => {
        return () => { mountedRef.current = false; };
    }, []);

    return { data, loading, error, refetch: fetchData };
}

export default useMetrics;
