import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, BookOpen, Clock, CalendarCheck2, X, BarChart3 } from 'lucide-react';
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
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-500' },
        { label: 'Courses Active', value: '0', icon: BookOpen, color: 'bg-purple-500' },
        { label: 'Rooms Available', value: '0', icon: CalendarCheck2, color: 'bg-emerald-500' },
        { label: 'Weekly Slots', value: '0', icon: Clock, color: 'bg-amber-500' },
    ]);

    const [utilizationPercent, setUtilizationPercent] = useState([0, 0, 0, 0, 0]);
    const [deptWorkload, setDeptWorkload] = useState({});

    // Generate Modal State
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [formConfig, setFormConfig] = useState({
        departmentId: '',
        maxClassesPerDay: 4,
        availableRooms: [],
        batchInfo: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [generateError, setGenerateError] = useState(null);

    const openGenerateModal = async () => {
        setIsGenerateModalOpen(true);
        setGenerateResult(null);
        setGenerateError(null);
        try {
            const [deptRes, roomRes] = await Promise.all([
                api.get('/schedules/departments'),
                api.get('/schedules/rooms')
            ]);
            setDepartments(deptRes.data);
            setRooms(roomRes.data);
            if (deptRes.data.length > 0) {
                setFormConfig(prev => ({ ...prev, departmentId: deptRes.data[0]._id }));
            }
            setFormConfig(prev => ({ ...prev, availableRooms: roomRes.data.map(r => r._id) }));
        } catch (err) {
            console.error('Failed to fetch modal data', err);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const { data } = await api.get('/schedules/stats');
                
                setStats([
                    { label: 'Total Users', value: String(data.totalUsers || 0), icon: Users, color: 'bg-blue-500' },
                    { label: 'Courses Active', value: String(data.activeCourses || 0), icon: BookOpen, color: 'bg-purple-500' },
                    { label: 'Rooms Available', value: String(data.availableRooms || 0), icon: CalendarCheck2, color: 'bg-emerald-500' },
                    { label: 'Scheduled Classes', value: String(data.totalSchedules || 0), icon: BarChart3, color: 'bg-amber-500' },
                ]);

                if (data.utilizationPercent) {
                    setUtilizationPercent(data.utilizationPercent);
                }
                if (data.deptWorkload) {
                    setDeptWorkload(data.deptWorkload);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const utilizationData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
            {
                label: 'Room Utilization (%)',
                data: utilizationPercent,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    };

    const workloadLabels = Object.keys(deptWorkload);
    const workloadValues = Object.values(deptWorkload);

    const workloadData = {
        labels: workloadLabels.length > 0 ? workloadLabels : ['No Data'],
        datasets: [
            {
                label: 'Department Workload (hrs/week)',
                data: workloadValues.length > 0 ? workloadValues : [0],
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
                    <button onClick={openGenerateModal} className="py-4 px-6 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors text-left flex justify-between items-center group">
                        Generate Next Week Schedule
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button onClick={() => navigate('/courses')} className="py-4 px-6 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors text-left flex justify-between items-center group">
                        Add New Course
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button onClick={() => navigate('/rooms')} className="py-4 px-6 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors text-left flex justify-between items-center group">
                        Manage Classrooms
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>

            {/* Generate Schedule Modal */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Generate Schedule</h2>
                            <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {generateResult ? (
                                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                    <h4 className="font-bold mb-1">Success!</h4>
                                    <p className="text-sm">{generateResult.message}</p>
                                    <p className="text-xs mt-2 opacity-80">Generated {generateResult.count} slots.</p>
                                    <button onClick={() => { setIsGenerateModalOpen(false); navigate('/timetable'); }} className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">View Timetable</button>
                                </div>
                            ) : (
                                <>
                                    {generateError && (
                                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
                                            <p className="text-sm">{generateError}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                                        <select 
                                            value={formConfig.departmentId}
                                            onChange={(e) => setFormConfig({...formConfig, departmentId: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {departments.map(d => (
                                                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                                            ))}
                                            {departments.length === 0 && <option value="" disabled>No departments available</option>}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Batch Info (e.g., "Year 2 - CS")</label>
                                        <input 
                                            type="text"
                                            placeholder="Leave blank for auto-generated"
                                            value={formConfig.batchInfo}
                                            onChange={(e) => setFormConfig({...formConfig, batchInfo: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Classes Per Day (Batch Load)</label>
                                        <input 
                                            type="number" 
                                            min="1" max="8"
                                            value={formConfig.maxClassesPerDay}
                                            onChange={(e) => setFormConfig({...formConfig, maxClassesPerDay: parseInt(e.target.value)})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Available Rooms</label>
                                        <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
                                            {rooms.map(r => (
                                                <label key={r._id} className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formConfig.availableRooms.includes(r._id)}
                                                        onChange={(e) => {
                                                            const newRooms = e.target.checked 
                                                                ? [...formConfig.availableRooms, r._id]
                                                                : formConfig.availableRooms.filter(id => id !== r._id);
                                                            setFormConfig({...formConfig, availableRooms: newRooms});
                                                        }}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Room {r.number} (Cap: {r.capacity})</span>
                                                </label>
                                            ))}
                                            {rooms.length === 0 && <span className="text-sm text-slate-500">No rooms found.</span>}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={async () => {
                                            setIsGenerating(true);
                                            setGenerateError(null);
                                            try {
                                                const payload = {
                                                    maxClassesPerDay: formConfig.maxClassesPerDay,
                                                    availableRooms: formConfig.availableRooms
                                                };
                                                if (formConfig.batchInfo.trim()) {
                                                    payload.batchInfo = formConfig.batchInfo.trim();
                                                }
                                                const { data } = await api.post(`/schedules/generate/${formConfig.departmentId}`, payload);
                                                setGenerateResult(data);
                                            } catch (err) {
                                                setGenerateError(err.response?.data?.message || err.message || 'Generation failed');
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating || !formConfig.departmentId || formConfig.availableRooms.length === 0}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-6"
                                    >
                                        {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Generate Timetable'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
