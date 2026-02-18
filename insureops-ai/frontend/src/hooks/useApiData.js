import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch API data with mock data fallback.
 * @param {Function} fetchFn - The API function to call (e.g. getSection1Metrics)
 * @param {any} fallback - Mock/fallback data to use if API fails
 * @param {Array} deps - Dependency array to trigger refetch
 */
export function useApiData(fetchFn, fallback = null, deps = []) {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(false);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
            setIsLive(true);
        } catch (err) {
            console.warn('[useApiData] API failed, using fallback:', err.message);
            setData(fallback);
            setIsLive(false);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, fallback]);

    useEffect(() => {
        refetch();
    }, [...deps, refetch]);

    return { data, loading, error, isLive, refetch };
}
