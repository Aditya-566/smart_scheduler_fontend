import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Calendar as CalendarIcon, Clock, MapPin, User as UserIcon } from 'lucide-react';

export default function Timetable() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const TIME_SLOTS = [
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                // In a real app, we would fetch based on role & ID or filter on backend
                const { data } = await api.get('/schedules');
                setSchedules(data);
            } catch (error) {
                console.error("Failed to fetch schedules", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    // For mockup purposes: Generate a beautiful visual representation of the schedule.
    // We map schedules to the grid based on day and start time.

    const getScheduleForSlot = (dayIdx, timeSlotStr) => {
        // timeSlotStr is like '09:00 - 10:00'
        const startTimeStr = timeSlotStr.split(' - ')[0]; // '09:00'

        return schedules.find(s =>
            s.timeSlot?.dayOfWeek === dayIdx && s.timeSlot?.startTime === startTimeStr
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Weekly Timetable
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {user?.role === 'ADMIN' ? 'System-wide schedule overview' : 'Your personal weekly schedule'}
                    </p>
                </div>

                {user?.role === 'ADMIN' && (
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
                        + Generate Schedule
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm w-24">
                                    Time
                                </th>
                                {DAYS.slice(1, 6).map((day, i) => ( // Mon-Fri
                                    <th key={i} className="p-4 border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-center min-w-[200px]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((time, timeIdx) => (
                                <tr key={timeIdx} className="group">
                                    <td className="p-4 border-b border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-xs text-center whitespace-nowrap">
                                        {time}
                                    </td>

                                    {DAYS.slice(1, 6).map((day, dayIdx) => {
                                        const actualDayIdx = dayIdx + 1; // 1 = Monday
                                        const scheduleItem = getScheduleForSlot(actualDayIdx, time);

                                        return (
                                            <td key={actualDayIdx} className="p-2 border-b border-slate-100 border-r last:border-r-0 relative group/cell hover:bg-slate-50 transition-colors h-32 align-top">
                                                {scheduleItem ? (
                                                    <div className="h-full rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                                                        <div>
                                                            <div className="font-bold text-indigo-900 text-sm mb-1 leading-tight line-clamp-2">
                                                                {scheduleItem.course?.name || 'Class Assigned'}
                                                            </div>
                                                            <div className="text-xs font-semibold text-indigo-600 mb-2">
                                                                {scheduleItem.course?.code || ''}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 text-xs text-slate-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="truncate">{scheduleItem.room?.number || 'TBA'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                <span className="truncate">{scheduleItem.faculty?.name || 'Faculty TBA'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover/cell:opacity-100 flex items-center justify-center h-full">
                                                        {user?.role === 'ADMIN' && (
                                                            <button className="text-xs font-medium text-slate-400 border border-dashed border-slate-300 rounded px-2 py-1 hover:text-blue-500 hover:border-blue-400">
                                                                + Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
