import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff, Shield, ClipboardList, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';

const ROLES = [
    {
        value: 'operations_manager',
        label: 'Operations Manager',
        icon: ClipboardList,
        description: 'Submit claims, run agents, upload evidence',
        color: '#e8722a'
    },
    {
        value: 'compliance_officer',
        label: 'Compliance Officer',
        icon: Shield,
        description: 'Audit trails, compliance monitoring, read-only',
        color: '#3b82f6'
    },
    {
        value: 'admin',
        label: 'Admin',
        icon: Settings,
        description: 'Full system access, agent config, user management',
        color: '#22c55e'
    }
];

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'operations_manager' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(form.name, form.email, form.password, form.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e8722a]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-[#f1ebe4]">
                            Insure<span className="text-[#e8722a]">Ops</span> AI
                        </h1>
                    </Link>
                    <p className="text-[#a89888] mt-2">Create your account</p>
                </div>

                {/* Card */}
                <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#a89888] mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={update('name')}
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-[#f1ebe4] placeholder:text-[#4a3f35] focus:border-[#e8722a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8722a]/30 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[#a89888] mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={update('email')}
                                    placeholder="you@company.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-[#f1ebe4] placeholder:text-[#4a3f35] focus:border-[#e8722a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8722a]/30 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a89888] mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={update('password')}
                                        placeholder="Min 6 chars"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-[#f1ebe4] placeholder:text-[#4a3f35] focus:border-[#e8722a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8722a]/30 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a89888] mb-1.5">Confirm</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirmPassword}
                                        onChange={update('confirmPassword')}
                                        placeholder="Re-enter"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-[#f1ebe4] placeholder:text-[#4a3f35] focus:border-[#e8722a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8722a]/30 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowPassword(p => !p)} className="flex items-center gap-1.5 text-xs text-[#7a6550] hover:text-[#a89888] transition-colors">
                                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                {showPassword ? 'Hide' : 'Show'} passwords
                            </button>
                        </div>

                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-medium text-[#a89888] mb-3">Select your role</label>
                            <div className="grid grid-cols-3 gap-3">
                                {ROLES.map((role) => {
                                    const Icon = role.icon;
                                    const selected = form.role === role.value;
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, role: role.value }))}
                                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${selected
                                                    ? 'border-current bg-current/10'
                                                    : 'border-[#1e1e1e] bg-[#0a0a0a] hover:border-[#2a2a2a]'
                                                }`}
                                            style={selected ? { borderColor: role.color, backgroundColor: `${role.color}10` } : {}}
                                        >
                                            <Icon size={20} style={{ color: selected ? role.color : '#7a6550' }} className="mb-2" />
                                            <p className="text-xs font-semibold text-[#f1ebe4] leading-tight">{role.label}</p>
                                            <p className="text-[10px] text-[#7a6550] mt-1 leading-tight">{role.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#e8722a] hover:bg-[#c45a1a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[#7a6550] text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#e8722a] hover:text-[#ff8c42] font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
