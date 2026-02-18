import { useState, useEffect, useCallback } from 'react';
import { getSection1Metrics, getSection2Metrics, getOverviewMetrics } from '../services/api';

const useMetrics = (section = 'overview', initialRange = '24h') => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(initialRange);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (section === 'section1') result = await getSection1Metrics(timeRange);
            else if (section === 'section2') result = await getSection2Metrics(timeRange);
            else result = await getOverviewMetrics(timeRange);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch metrics');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [section, timeRange]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return { data, loading, error, timeRange, setTimeRange, refetch: fetchMetrics };
};

export default useMetrics;
