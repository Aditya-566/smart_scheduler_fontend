import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Clock, Calendar } from 'lucide-react';

export default function FacultyDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { label: 'My Courses', value: '3', icon: BookOpen, color: 'bg-indigo-500' },
        { label: 'Weekly Hours', value: '18', icon: Clock, color: 'bg-rose-500' },
        { label: 'Upcoming Classes', value: '4', icon: Calendar, color: 'bg-teal-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, Professor {user?.name.split(' ')[0]}</h1>
                <p className="text-slate-500">Here is your schedule overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Schedule Timeline Placeholder */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Today's Timeline</h3>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Full Week</button>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {/* Placeholder Timeline Item */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900">Data Structures CS-201</div>
                                <time className="text-sm font-medium text-indigo-500">09:00 AM</time>
                            </div>
                            <div className="text-sm text-slate-500">Room 402 - Main Block</div>
                        </div>
                    </div>
                    {/* Placeholder Timeline Item 2 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900">Algorithms Lab CS-202</div>
                                <time className="text-sm font-medium text-emerald-500">11:00 AM</time>
                            </div>
                            <div className="text-sm text-slate-500">Computer Lab 3</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
