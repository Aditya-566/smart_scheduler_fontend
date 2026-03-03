import { useAuthStore } from '../store/useAuthStore';
import { Users, BookOpen, Clock, CalendarCheck2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdminDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { label: 'Total Users', value: '156', icon: Users, color: 'bg-blue-500' },
        { label: 'Courses Active', value: '42', icon: BookOpen, color: 'bg-purple-500' },
        { label: 'Rooms Available', value: '24', icon: CalendarCheck2, color: 'bg-emerald-500' },
        { label: 'Weekly Slots', value: '312', icon: Clock, color: 'bg-amber-500' },
    ];

    const utilizationData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
            {
                label: 'Room Utilization (%)',
                data: [65, 80, 75, 90, 60],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    };

    const workloadData = {
        labels: ['CS', 'EE', 'ME', 'CE', 'IT'],
        datasets: [
            {
                label: 'Faculty Workload (hrs)',
                data: [450, 320, 280, 250, 400],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
                <p className="text-slate-500">Here is what's happening in your institution today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Classroom Utilization</h3>
                    <div className="h-64 flex justify-center">
                        <Bar options={chartOptions} data={utilizationData} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Department Workload</h3>
                    <div className="h-64 flex justify-center">
                        <Line options={chartOptions} data={workloadData} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="py-4 px-6 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors text-left flex justify-between items-center group">
                        Generate Next Week Schedule
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button className="py-4 px-6 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors text-left flex justify-between items-center group">
                        Add New Course
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button className="py-4 px-6 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors text-left flex justify-between items-center group">
                        Manage Classrooms
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
