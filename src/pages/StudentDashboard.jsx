import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Calendar, Clock, BookOpen, MapPin } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/schedules');
                setSchedules(data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const todayClasses = schedules
        .filter(s => s.timeSlot?.dayOfWeek === today)
        .sort((a, b) => (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || ''));

    const nextClass = todayClasses.find(s => s.timeSlot?.startTime > currentTime);

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white">Hey, {user?.name}! 🌊</h1>
                <p className="text-ocean-200/50 text-sm mt-1">{DAYS[today]}'s schedule is ready for you.</p>
            </div>

            {/* Next Class Highlight */}
            {nextClass && (
                <div className="glass-card rounded-2xl p-6 glow-animation border-ocean-400/20">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Next Up</p>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{nextClass.course?.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-ocean-200/60">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-ocean-400" />{nextClass.timeSlot?.startTime} - {nextClass.timeSlot?.endTime}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-ocean-400" />Room {nextClass.room?.number}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-ocean-400" />{nextClass.course?.code}</span>
                    </div>
                </div>
            )}

            {/* Today's Classes */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-ocean-400" />
                    Today's Classes
                </h3>
                {isLoading ? (
                    <div className="flex justify-center py-8"><div className="ocean-spinner"></div></div>
                ) : todayClasses.length === 0 ? (
                    <div className="text-center py-8 text-ocean-200/40">
                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>No classes scheduled for today. Enjoy your free day! 🏖️</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayClasses.map(s => {
                            const isPast = s.timeSlot?.endTime < currentTime;
                            const isCurrent = s.timeSlot?.startTime <= currentTime && s.timeSlot?.endTime >= currentTime;
                            return (
                                <div key={s._id} className={`glass-light rounded-xl p-4 flex justify-between items-center ${isPast ? 'opacity-40' : ''} ${isCurrent ? 'border-ocean-400/30 glow-animation' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center min-w-[60px]">
                                            <p className={`font-bold text-sm ${isCurrent ? 'text-ocean-300' : 'text-ocean-200/60'}`}>{s.timeSlot?.startTime}</p>
                                            <p className="text-ocean-400/30 text-xs">{s.timeSlot?.endTime}</p>
                                        </div>
                                        <div className="w-px h-10 bg-ocean-500/20"></div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{s.course?.name}</p>
                                            <p className="text-ocean-200/40 text-xs mt-0.5">Room {s.room?.number} • {s.faculty?.name || 'Faculty TBA'}</p>
                                        </div>
                                    </div>
                                    {isCurrent && <span className="px-2.5 py-1 rounded-lg bg-ocean-500/15 text-ocean-300 text-xs font-bold">NOW</span>}
                                    {isPast && <span className="px-2.5 py-1 rounded-lg bg-ocean-500/5 text-ocean-400/30 text-xs">Done</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
