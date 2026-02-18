import AlertCard from '../components/alerts/AlertCard';
import AlertRulesPanel from '../components/alerts/AlertRulesPanel';

const AlertsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Alerts</h1>
                <p className="text-[#a89888]">Active alerts and rule management for threshold breaches.</p>
            </div>

            {/* TODO: Tabs — Active Alerts | Alert History */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-[#f1ebe4]">Active Alerts</h2>
                    <AlertCard />
                </div>
                <div>
                    <AlertRulesPanel />
                </div>
            </div>
        </div>
    );
};

export default AlertsPage;
