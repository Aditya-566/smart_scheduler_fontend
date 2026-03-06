import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Calendar, Search, MapPin, Clock } from 'lucide-react';
import api from '../services/api';

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upNext, setUpNext] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const { data } = await api.get('/schedules');
                setSchedules(data);
                
                // Extremely simple logic to find "Next" class for demo purposes
                // In production, this should compare with current time and day
                const currentDayOfWeek = new Date().getDay();
                const todaysSchedules = data.filter(item => item.timeSlot?.dayOfWeek === currentDayOfWeek);
                if (todaysSchedules.length > 0) {
                    todaysSchedules.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
                    setUpNext(todaysSchedules[0]);
                }
            } catch (error) {
                console.error("Error fetching schedules:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSchedules();
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hello, {user?.name.split(' ')[0]} 👋</h1>
                    <p className="text-blue-100 max-w-lg mb-6">Check your upcoming classes or find an empty classroom for self-study right now.</p>

                    <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-blue-50 transition-all flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            My Timetable
                        </button>
                        <button className="bg-blue-700/50 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700/70 transition-all flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            Find Free Classrooms
                        </button>
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-32 translate-y-1/2 w-48 h-48 bg-white opacity-10 rounded-full blur-xl"></div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Up Next</h3>
                {loading ? (
                    <div className="text-slate-500">Loading your schedule...</div>
                ) : upNext ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-6">
                            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl text-center min-w-[100px]">
                                <p className="text-sm font-bold uppercase">Today</p>
                                <p className="text-2xl font-black">{upNext.timeSlot?.startTime}</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-1">{upNext.course?.name || 'Class'} ({upNext.course?.code || ''})</h4>
                                <div className="flex items-center text-slate-500 text-sm mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Room {upNext.room?.number || 'TBA'}
                                </div>
                                <div className="flex items-center text-slate-500 text-sm mt-1">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {upNext.timeSlot?.startTime} - {upNext.timeSlot?.endTime}
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-sm text-slate-500 font-medium mb-1">{upNext.faculty?.name ? `Prof. ${upNext.faculty.name}` : 'Faculty TBA'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center text-slate-500">
                        No upcoming classes scheduled for today. Enjoy your free time!
                    </div>
                )}
            </div>
        </div>
    );
}
