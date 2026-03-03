import { useAuthStore } from '../store/useAuthStore';
import { Calendar, Search, MapPin } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuthStore();

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
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-6">
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl text-center min-w-[100px]">
                            <p className="text-sm font-bold uppercase">Today</p>
                            <p className="text-2xl font-black">14:00</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">Operating Systems (CS-301)</h4>
                            <div className="flex items-center text-slate-500 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                Lecture Hall 1
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm text-slate-500 font-medium mb-1">Prof. Alan Turing</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            In 1 hour
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
