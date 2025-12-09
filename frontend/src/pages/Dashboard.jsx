import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, List, Settings, Plus, LogOut, Bell, Search, User } from 'lucide-react';

const Dashboard = () => {
    const isSubdomain = () => {
        const host = window.location.host;
        if (host.includes('localhost')) return host.split('.').length > 1;
        if (host.includes('127.0.0.1')) return host.split('.').length > 4;
        return host.split('.').length > 2;
    };

    const basePath = isSubdomain() ? '' : '/dashboard';

    return (
        <div className="min-h-screen flex bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900/50 border-r border-gray-800 flex flex-col backdrop-blur-xl fixed h-full z-20">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                            A
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white leading-tight">Acme Inc.</h2>
                            <p className="text-xs text-gray-500">Free Plan</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3 mt-2">Menu</div>
                    <NavItem to={basePath || '/'} icon={<Layout />} label="Overview" />
                    <NavItem to={`${basePath}/projects`} icon={<List />} label="Projects" />
                    <NavItem to={`${basePath}/settings`} icon={<Settings />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-colors">
                                <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-medium text-gray-200 truncate">John Doe</div>
                                <div className="text-xs text-gray-500 truncate">john@acme.com</div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const port = window.location.port;
                                window.location.href = `http://localhost:${port}`;
                            }}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-400/10 rounded-md"
                            title="Log Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid -z-10 opacity-50"></div>

                {/* Header */}
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-semibold text-gray-200">Dashboard</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-900 border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-64"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-950"></span>
                        </button>
                        <div className="h-6 w-px bg-gray-800 mx-1"></div>
                        <button className="btn btn-primary text-sm py-2 px-4 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> New Project
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/projects" element={<ProjectsList />} />
                        <Route path="/settings" element={<div className="text-gray-400">Settings Panel</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
        >
            {React.cloneElement(icon, {
                size: 20,
                className: isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300 transition-colors'
            })}
            <span>{label}</span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>}
        </Link>
    );
};

const Overview = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Active Projects" value="12" trend="+2.5%" trendUp={true} />
            <StatCard label="Pending Tasks" value="48" trend="-4.1%" trendUp={false} />
            <StatCard label="Team Members" value="8" trend="+1" trendUp={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card h-64 flex items-center justify-center text-gray-500 border-dashed">
                Activity Chart Placeholder
            </div>
            <div className="card h-64 flex items-center justify-center text-gray-500 border-dashed">
                Recent Activity Placeholder
            </div>
        </div>
    </div>
);

const StatCard = ({ label, value, trend, trendUp }) => (
    <div className="card hover:border-primary/30 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="text-gray-400 text-sm font-medium">{label}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {trend}
            </div>
        </div>
        <div className="text-3xl font-bold text-white group-hover:text-primary transition-colors">{value}</div>
    </div>
);

const ProjectsList = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Projects</h2>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm bg-gray-900 border border-gray-800 rounded-md text-gray-300 hover:text-white transition-colors">All</button>
                <button className="px-3 py-1.5 text-sm bg-transparent border border-transparent rounded-md text-gray-500 hover:text-white transition-colors">Active</button>
                <button className="px-3 py-1.5 text-sm bg-transparent border border-transparent rounded-md text-gray-500 hover:text-white transition-colors">Completed</button>
            </div>
        </div>

        <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="card flex justify-between items-center hover:border-primary/50 cursor-pointer transition-all hover:translate-x-1 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            <List size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-200 group-hover:text-white transition-colors">Website Redesign {i}</h3>
                            <p className="text-gray-500 text-sm">Updated 2 hours ago • 5 Members</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400">
                                    U{j}
                                </div>
                            ))}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                            Active
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Dashboard;
