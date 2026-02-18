import { useState, useEffect } from 'react';

const AlertNotificationToast = ({ alert, onDismiss }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onDismiss?.();
        }, 8000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    if (!visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-[#1c1815] border border-red-500/50 rounded-xl p-4 shadow-2xl max-w-sm">
            {/* TODO: Severity icon + alert name + "View" link */}
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <p className="text-[#f1ebe4] text-sm font-medium">{alert?.name || 'New Alert'}</p>
            </div>
        </div>
    );
};

export default AlertNotificationToast;
