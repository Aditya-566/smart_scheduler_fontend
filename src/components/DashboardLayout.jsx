import { useNavigate } from 'react-router-dom';
import { Link, scroller } from 'react-scroll';
import { useAuthStore } from '../store/useAuthStore';
import OceanBackground from './OceanBackground';
import {
    LayoutDashboard,
    Calendar,
    Users,
    BookOpen,
    MapPin,
    Settings,
    LogOut,
    Waves,
    Menu,
    X,
    Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard-overview', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Timetable', icon: Calendar, id: 'timetable', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'My Courses', icon: BookOpen, id: 'my-courses', roles: ['FACULTY'] },
        { label: 'Courses', icon: BookOpen, id: 'courses', roles: ['ADMIN'] },
        { label: 'Rooms', icon: MapPin, id: 'rooms', roles: ['ADMIN'] },
        { label: 'Settings', icon: Settings, id: 'settings', roles: ['ADMIN'] },
    ];

    const allowedNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="h-screen overflow-hidden flex relative">
            <OceanBackground />

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-40 w-72 h-screen flex flex-col
                glass-sidebar
                transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="h-18 flex items-center px-6 border-b border-ocean-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-ocean-500/20 flex items-center justify-center border border-ocean-500/30">
                            <Waves className="w-5 h-5 text-ocean-300" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-wide">
                                SMART<span className="text-ocean-400">CLASS</span>
                            </h1>
                            <p className="text-[10px] text-ocean-300/40 uppercase tracking-widest">Scheduler</p>
                        </div>
                    </div>
                </div>

                {/* Nav items */}
                <div className="flex-1 py-6 flex flex-col gap-1.5 px-4 overflow-y-auto">
                    {allowedNavItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.id}
                            spy={true}
                            smooth={true}
                            offset={-80}
                            duration={600}
                            containerId="main-scroll-container"
                            activeClass="bg-gradient-to-r from-ocean-500/20 to-ocean-600/10 text-ocean-300 border border-ocean-500/20 !opacity-100"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                scroller.scrollTo(item.id, {
                                    smooth: true,
                                    offset: -80,
                                    duration: 600,
                                    containerId: "main-scroll-container"
                                });
                            }}
                            className="nav-item-3d flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-ocean-200/50 hover:text-ocean-200 hover:bg-ocean-500/5 cursor-pointer border border-transparent"
                        >
                            <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* User section */}
                <div className="p-4 border-t border-ocean-500/10">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}&backgroundColor=00b2cb&textColor=ffffff`} 
                            alt="Avatar" 
                            className="w-9 h-9 rounded-lg border border-ocean-500/30"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-ocean-300/40 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-ocean-200/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile menu backdrop */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-deep-950/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Topbar */}
                <header className="h-16 glass-topbar flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-ocean-300 hover:text-ocean-200">
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <h2 className="text-sm font-semibold text-ocean-200/60 capitalize">
                            {user?.role?.toLowerCase()} Portal
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Live Clock */}
                        <div className="hidden md:flex items-center gap-2 text-ocean-200/60 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className="font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 pl-6 border-l border-ocean-500/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white">{user?.name}</p>
                                <p className="text-xs text-ocean-300/40">{user?.email}</p>
                            </div>
                            <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}&backgroundColor=00b2cb&textColor=ffffff`} 
                                alt="Avatar" 
                                className="w-9 h-9 rounded-lg border border-ocean-500/30"
                            />
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <div id="main-scroll-container" className="flex-1 overflow-auto px-6 md:px-8 pb-6 md:pb-8 pt-4 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
