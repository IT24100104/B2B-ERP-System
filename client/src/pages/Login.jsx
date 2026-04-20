import { useState } from 'react';
import { loginCall } from '../services/api';
import { KeyRound } from 'lucide-react';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginCall({ username, password });
            onLogin(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>

                <div className="flex flex-col items-center relative z-10">
                    {/* Custom ERP Logo SVG */}
                    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 drop-shadow-xl">
                        <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="#3B82F6" />
                        <path d="M2 23L16 30L30 23V9L16 16L2 9V23Z" fill="#6366F1" />
                        <path d="M16 16L2 9V23L16 30V16Z" fill="#1E40AF" />
                    </svg>
                    <h2 className="text-center text-3xl font-black text-white tracking-tight">
                        GrocerAI
                    </h2>
                    <p className="mt-2 text-center text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">
                        Customer Management Module
                    </p>
                </div>

                <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-md text-red-200 text-sm flex items-center backdrop-blur-sm shadow-inner">
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                            <input
                                type="text" required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-slate-500 text-white focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all shadow-inner font-medium"
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                            <input
                                type="password" required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-slate-500 text-white focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all shadow-inner font-medium"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit" disabled={loading}
                            className={`group w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-black tracking-wide rounded-xl text-white ${loading
                                ? 'bg-blue-600/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
                        >
                            <KeyRound size={18} className="mr-2" />
                            {loading ? 'Authenticating...' : 'Secure Login'}
                        </button>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 mt-8 border border-white/5 backdrop-blur-sm">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Development Accounts</h4>
                        <div className="flex flex-col gap-2 text-xs text-slate-400">
                            <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg">
                                <span className="font-semibold text-slate-300">Admin</span>
                                <span className="font-mono text-blue-300">admin / password123</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg">
                                <span className="font-semibold text-slate-300">Sales</span>
                                <span className="font-mono text-blue-300">sales / password123</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
