import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    LayoutDashboard,
    Calendar,
    Users,
    BookOpen,
    MapPin,
    Settings,
    LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Timetable', icon: Calendar, path: '/timetable', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Users', icon: Users, path: '/users', roles: ['ADMIN'] },
        { label: 'Courses', icon: BookOpen, path: '/courses', roles: ['ADMIN'] },
        { label: 'Rooms', icon: MapPin, path: '/rooms', roles: ['ADMIN', 'STUDENT'] },
        { label: 'Settings', icon: Settings, path: '/settings', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    ];

    const allowedNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 bg-slate-950">
                    <h1 className="text-xl font-bold text-white tracking-widest">SMART<span className="text-blue-500">CLASS</span></h1>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-1 px-4">
                    {allowedNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <h2 className="text-lg font-semibold text-slate-800 capitalize">
                        {user?.role.toLowerCase()} Portal
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
