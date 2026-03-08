import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, Calendar, User, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    useEffect(() => {
        (async () => {
            try {
                const [schedRes, courseRes] = await Promise.all([
                    api.get('/schedules'),
                    api.get('/courses/faculty/my-courses')
                ]);
                setSchedules(schedRes.data);
                setMyCourses(courseRes.data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const todayClasses = schedules.filter(s => s.timeSlot?.dayOfWeek === today);
    const totalWeeklyHours = schedules.length;

    return (
        <div className="space-y-6 fade-in overflow-x-hidden">
            <ScrollReveal direction="down">
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 🌊</h1>
                    <p className="text-ocean-200/50 text-sm mt-1">Here's your teaching schedule at a glance.</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ... existing map ... */}
                {[
                    { label: 'My Courses', value: myCourses.length, icon: BookOpen, gradient: 'from-ocean-400 to-blue-500' },
                    { label: 'Weekly Hours', value: totalWeeklyHours, icon: Clock, gradient: 'from-purple-400 to-indigo-500' },
                    { label: "Today's Classes", value: todayClasses.length, icon: Calendar, gradient: 'from-emerald-400 to-teal-500' },
                ].map((s, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                        <div className="glass-card stat-card-3d rounded-2xl p-5 flex items-center gap-4">
                            <div className={`bg-gradient-to-br ${s.gradient} p-3.5 rounded-xl text-white icon-3d`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-ocean-200/50">{s.label}</p>
                                <p className="text-2xl font-bold text-white">{isLoading ? '...' : s.value}</p>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            {/* Assigned Courses */}
            <ScrollReveal direction="left" delay={0.2}>
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-ocean-400" /> My Assigned Courses
                    </h3>
                    {myCourses.length > 0 && (
                        <button onClick={() => { import('react-scroll').then(mod => mod.scroller.scrollTo('my-courses', { smooth: true, offset: -80, duration: 600 })) }}
                            className="text-xs text-ocean-300/60 hover:text-ocean-300 flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                {isLoading ? (
                    <div className="flex justify-center py-6"><div className="ocean-spinner"></div></div>
                ) : myCourses.length === 0 ? (
                    <div className="text-center py-6 text-ocean-200/40">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No courses assigned yet. Contact your admin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {myCourses.slice(0, 6).map(c => (
                            <div key={c._id} className="glass-light rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-ocean-500/10 text-ocean-300 border border-ocean-500/15">{c.code}</span>
                                    <span className="text-xs text-ocean-200/30">{c.credits} cr</span>
                                </div>
                                <p className="font-semibold text-white text-sm leading-tight">{c.name}</p>
                                <p className="text-xs text-ocean-200/30 mt-1">{c.department?.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </ScrollReveal>

            {/* Today's Schedule */}
            <ScrollReveal direction="right" delay={0.3}>
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
            </ScrollReveal>

            {/* All My Classes */}
            <ScrollReveal direction="up" delay={0.4}>
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
            </ScrollReveal>
        </div>
    );
}
