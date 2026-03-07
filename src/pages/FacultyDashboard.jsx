import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { BookOpen, Clock, Calendar, User } from 'lucide-react';

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/schedules');
                setSchedules(data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const todayClasses = schedules.filter(s => s.timeSlot?.dayOfWeek === today);
    const totalWeeklyHours = schedules.length;
    const uniqueCourses = [...new Set(schedules.map(s => s.course?._id))].length;

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 🌊</h1>
                <p className="text-ocean-200/50 text-sm mt-1">Here's your teaching schedule at a glance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'My Courses', value: uniqueCourses, icon: BookOpen, gradient: 'from-ocean-400 to-blue-500' },
                    { label: 'Weekly Hours', value: totalWeeklyHours, icon: Clock, gradient: 'from-purple-400 to-indigo-500' },
                    { label: "Today's Classes", value: todayClasses.length, icon: Calendar, gradient: 'from-emerald-400 to-teal-500' },
                ].map((s, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                        <div className={`bg-gradient-to-br ${s.gradient} p-3.5 rounded-xl text-white shadow-lg`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-ocean-200/50">{s.label}</p>
                            <p className="text-2xl font-bold text-white">{isLoading ? '...' : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Today's Schedule — {DAYS[today]}</h3>
                {isLoading ? (
                    <div className="flex justify-center py-8"><div className="ocean-spinner"></div></div>
                ) : todayClasses.length === 0 ? (
                    <div className="text-center py-8 text-ocean-200/40">
                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>No classes scheduled for today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayClasses.sort((a, b) => a.timeSlot?.startTime?.localeCompare(b.timeSlot?.startTime)).map(s => (
                            <div key={s._id} className="glass-light rounded-xl p-4 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-ocean-300 font-bold text-sm">{s.timeSlot?.startTime}</p>
                                        <p className="text-ocean-400/40 text-xs">{s.timeSlot?.endTime}</p>
                                    </div>
                                    <div className="w-px h-10 bg-ocean-500/20"></div>
                                    <div>
                                        <p className="font-semibold text-white text-sm">{s.course?.name}</p>
                                        <p className="text-ocean-200/40 text-xs mt-0.5">Room {s.room?.number} • {s.course?.code}</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-lg bg-ocean-500/10 text-ocean-300 text-xs font-medium">
                                    {s.room?.type || 'Lecture'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4">All My Classes</h3>
                {schedules.length === 0 ? (
                    <p className="text-ocean-200/40 text-sm text-center py-4">No classes assigned yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="ocean-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Course</th>
                                    <th>Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules
                                    .sort((a, b) => (a.timeSlot?.dayOfWeek || 0) - (b.timeSlot?.dayOfWeek || 0) || (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || ''))
                                    .map(s => (
                                        <tr key={s._id}>
                                            <td className="font-medium text-ocean-200">{DAYS[s.timeSlot?.dayOfWeek] || 'N/A'}</td>
                                            <td>{s.timeSlot?.startTime} - {s.timeSlot?.endTime}</td>
                                            <td>
                                                <span className="font-medium text-white">{s.course?.name}</span>
                                                <span className="text-ocean-400/60 ml-2 text-xs">({s.course?.code})</span>
                                            </td>
                                            <td>Room {s.room?.number}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
