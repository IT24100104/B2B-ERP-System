import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Users, Box, Building2, FileText } from 'lucide-react';

export default function Layout({ user, onLogout }) {
    const location = useLocation();

    const navItems = [
        { label: 'Customers', path: '/', icon: Users },
        { label: 'Invoices', path: '/invoices', icon: FileText },
        ...(user?.role === 'admin' ? [{ label: 'Segment Rules', path: '/segments', icon: Settings }] : [])
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10 relative">
                <div className="p-6 border-b border-slate-800/60 bg-slate-950/30 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        {/* Custom ERP Logo SVG */}
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="#3B82F6" />
                            <path d="M2 23L16 30L30 23V9L16 16L2 9V23Z" fill="#6366F1" />
                            <path d="M16 16L2 9V23L16 30V16Z" fill="#1E40AF" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-wider text-white leading-none">GrocerAI</span>
                            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase leading-tight mt-0.5">ERP System</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Modules</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
                                        }`}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-5 border-t border-slate-800/60 bg-slate-950/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate leading-tight">{user.username}</p>
                            <p className="text-[10px] text-slate-400 truncate capitalize tracking-wider font-semibold">{user.role.replace('_', ' ')}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            title="Logout"
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {location.pathname === '/' ? 'Customer Management' : location.pathname === '/invoices' ? 'Invoice Management' : 'Segment Rules Configuration'}
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {location.pathname === '/' ? 'View and manage customer data and segmentation.' : location.pathname === '/invoices' ? 'Create, manage and track customer invoices.' : 'Adjust global segment bounds and discount rules.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-200 shadow-sm">
                            <Building2 size={16} className="text-slate-500" />
                            <span className="text-sm font-bold text-slate-700">Colonial Engineering</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
