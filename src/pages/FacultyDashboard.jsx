import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import api from '../services/api';

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { label: 'My Courses', value: '0', icon: BookOpen, color: 'bg-indigo-500' },
        { label: 'Weekly Hours', value: '0', icon: Clock, color: 'bg-rose-500' },
        { label: 'Upcoming Classes', value: '0', icon: Calendar, color: 'bg-teal-500' },
    ]);
    const [todayTimeline, setTodayTimeline] = useState([]);

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                // Fetch faculty's assigned courses
                const { data: courseData } = await api.get('/courses/faculty/my-courses');
                setCourses(courseData);

                // Fetch faculty's schedules (backend filters by faculty ID)
                const { data: scheduleData } = await api.get('/schedules');
                setSchedules(scheduleData);

                // Process Dashboard Data
                processDashboardData(scheduleData, courseData);
            } catch (error) {
                console.error("Error fetching faculty data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFacultyData();
        }
    }, [user]);

    const processDashboardData = (scheduleData, courseData) => {
        // 1. My Courses (from courses endpoint)
        const myCourses = courseData.length;

        // 2. Weekly Hours
        let totalMinutes = 0;
        scheduleData.forEach(item => {
            if (item.timeSlot && item.timeSlot.startTime && item.timeSlot.endTime) {
                const [startH, startM] = item.timeSlot.startTime.split(':').map(Number);
                const [endH, endM] = item.timeSlot.endTime.split(':').map(Number);
                totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
            }
        });
        const weeklyHours = Math.round(totalMinutes / 60);

        // 3. Today's Timeline & Upcoming Classes
        const currentDayOfWeek = new Date().getDay();
        const now = new Date();
        const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const todaysSchedules = scheduleData.filter(item => item.timeSlot?.dayOfWeek === currentDayOfWeek);

        // Sort chronologically
        todaysSchedules.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));

        setTodayTimeline(todaysSchedules);

        const upcomingClasses = todaysSchedules.filter(item => item.timeSlot.startTime >= currentTimeString).length;

        setStats([
            { label: 'My Courses', value: myCourses.toString(), icon: BookOpen, color: 'bg-indigo-500' },
            { label: 'Weekly Hours', value: weeklyHours.toString(), icon: Clock, color: 'bg-rose-500' },
            { label: 'Upcoming Classes', value: upcomingClasses.toString(), icon: Calendar, color: 'bg-teal-500' },
        ]);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, Professor {user?.name?.split(' ')[0] || ''}</h1>
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

            {/* Today's Schedule Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Today's Timeline</h3>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Full Week</button>
                </div>

                {todayTimeline.length > 0 ? (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {todayTimeline.map((item, index) => (
                            <div key={item._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-slate-900">{item.course?.name} ({item.course?.code})</div>
                                        <time className="text-sm font-medium text-indigo-500">{item.timeSlot?.startTime} - {item.timeSlot?.endTime}</time>
                                    </div>
                                    <div className="text-sm text-slate-500">Room {item.room?.number} - {item.batchInfo}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 py-8">
                        {courses.length > 0 
                            ? "No classes scheduled for today. Check back later!" 
                            : "No courses assigned yet. Contact your administrator."}
                    </div>
                )}
            </div>
        </div>
    );
}
