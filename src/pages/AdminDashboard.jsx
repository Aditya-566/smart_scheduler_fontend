import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Users, CalendarCheck2, BarChart3, Plus, ArrowRight, X } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ScrollReveal from '../components/ScrollReveal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, gradient: 'from-ocean-400 to-blue-500' },
        { label: 'Courses Active', value: '0', icon: BookOpen, gradient: 'from-purple-400 to-indigo-500' },
        { label: 'Rooms Available', value: '0', icon: CalendarCheck2, gradient: 'from-emerald-400 to-teal-500' },
        { label: 'Scheduled Classes', value: '0', icon: BarChart3, gradient: 'from-amber-400 to-orange-500' },
    ]);
    const [utilizationPercent, setUtilizationPercent] = useState([0, 0, 0, 0, 0]);
    const [deptWorkload, setDeptWorkload] = useState({});

    // Generate Modal
    const [showModal, setShowModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [config, setConfig] = useState({ departmentId: '', maxClassesPerDay: 4, availableRooms: [], batchInfo: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [genError, setGenError] = useState(null);

    const openModal = async () => {
        setShowModal(true); setResult(null); setGenError(null);
        try {
            const [d, r] = await Promise.all([api.get('/schedules/departments'), api.get('/schedules/rooms')]);
            setDepartments(d.data); setRooms(r.data);
            if (d.data.length) setConfig(p => ({ ...p, departmentId: d.data[0]._id }));
            setConfig(p => ({ ...p, availableRooms: r.data.map(x => x._id) }));
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const { data } = await api.get('/schedules/stats');
                setStats([
                    { label: 'Total Users', value: String(data.totalUsers || 0), icon: Users, gradient: 'from-ocean-400 to-blue-500' },
                    { label: 'Courses Active', value: String(data.activeCourses || 0), icon: BookOpen, gradient: 'from-purple-400 to-indigo-500' },
                    { label: 'Rooms Available', value: String(data.availableRooms || 0), icon: CalendarCheck2, gradient: 'from-emerald-400 to-teal-500' },
                    { label: 'Scheduled Classes', value: String(data.totalSchedules || 0), icon: BarChart3, gradient: 'from-amber-400 to-orange-500' },
                ]);
                if (data.utilizationPercent) setUtilizationPercent(data.utilizationPercent);
                if (data.deptWorkload) setDeptWorkload(data.deptWorkload);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const chartOpts = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: 'rgba(179,232,240,0.6)', font: { size: 11 } } },
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: 'rgba(179,232,240,0.4)' }, grid: { color: 'rgba(0,178,203,0.06)' } },
            x: { ticks: { color: 'rgba(179,232,240,0.4)' }, grid: { color: 'rgba(0,178,203,0.06)' } }
        }
    };

    const utilizationData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
            label: 'Room Utilization %',
            data: utilizationPercent,
            backgroundColor: 'rgba(0, 178, 203, 0.4)',
            borderColor: 'rgba(0, 178, 203, 0.8)',
            borderWidth: 2, borderRadius: 6,
        }],
    };

    const wLabels = Object.keys(deptWorkload);
    const wValues = Object.values(deptWorkload);
    const workloadData = {
        labels: wLabels.length ? wLabels : ['No Data'],
        datasets: [{
            label: 'Dept Workload (hrs)',
            data: wValues.length ? wValues : [0],
            borderColor: 'rgba(168,85,247,0.8)',
            backgroundColor: 'rgba(168,85,247,0.1)',
            borderWidth: 2, fill: true, tension: 0.4,
            pointBackgroundColor: 'rgba(168,85,247,1)',
        }]
    };

    return (
        <div className="space-y-6 fade-in overflow-x-hidden">
            <ScrollReveal direction="down">
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 🌊</h1>
                    <p className="text-ocean-200/50 text-sm mt-1">Here's what's flowing in your institution today.</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScrollReveal direction="left" delay={0.2}>
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-4">Classroom Utilization</h3>
                        <div className="h-56"><Bar options={chartOpts} data={utilizationData} /></div>
                    </div>
                </ScrollReveal>
                <ScrollReveal direction="right" delay={0.3}>
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-4">Department Workload</h3>
                        <div className="h-56"><Line options={chartOpts} data={workloadData} /></div>
                    </div>
                </ScrollReveal>
            </div>

            <ScrollReveal direction="up" delay={0.4}>
                <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { label: 'Generate Schedule', action: openModal, color: 'ocean' },
                        { label: 'Add New Course', action: () => navigate('/courses'), color: 'purple' },
                        { label: 'Manage Classrooms', action: () => navigate('/rooms'), color: 'emerald' }
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action}
                            className={`py-4 px-5 rounded-xl font-medium text-left flex justify-between items-center group
                            bg-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/10 text-${btn.color === 'ocean' ? 'ocean' : btn.color}-300
                            hover:bg-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/20 border border-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/10
                            hover:border-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/20 transition-all duration-300`}>
                            <span className="text-sm">{btn.label}</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    ))}
                </div>
            </div>
            </ScrollReveal>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Generate Schedule</h2>
                            <button onClick={() => setShowModal(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {result ? (
                                <div className="p-4 bg-emerald-500/15 text-emerald-300 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold mb-1">Success! 🎉</h4>
                                    <p className="text-sm">{result.message}</p>
                                    <p className="text-xs mt-2 opacity-70">Generated {result.count} slots.</p>
                                    <button onClick={() => { setShowModal(false); navigate('/timetable'); }}
                                        className="btn-ocean w-full mt-4 py-2 text-sm">View Timetable</button>
                                </div>
                            ) : (
                                <>
                                    {genError && <div className="p-3 bg-red-500/15 text-red-300 rounded-xl border border-red-500/20 text-sm">{genError}</div>}
                                    <div>
                                        <label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Department</label>
                                        <select value={config.departmentId} onChange={e => setConfig({ ...config, departmentId: e.target.value })} className="select-ocean">
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Batch Info</label>
                                        <input type="text" placeholder="e.g., Year 2 - CS" value={config.batchInfo}
                                            onChange={e => setConfig({ ...config, batchInfo: e.target.value })} className="input-ocean !pl-4" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Max Classes/Day</label>
                                        <input type="number" min="1" max="8" value={config.maxClassesPerDay}
                                            onChange={e => setConfig({ ...config, maxClassesPerDay: parseInt(e.target.value) })} className="input-ocean !pl-4" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ocean-200/70 mb-2">Rooms</label>
                                        <div className="max-h-36 overflow-y-auto space-y-2 glass-light rounded-xl p-3">
                                            {rooms.map(r => (
                                                <label key={r._id} className="flex items-center gap-2 cursor-pointer text-sm text-ocean-200/70 hover:text-ocean-200">
                                                    <input type="checkbox" checked={config.availableRooms.includes(r._id)}
                                                        onChange={e => setConfig({ ...config, availableRooms: e.target.checked ? [...config.availableRooms, r._id] : config.availableRooms.filter(id => id !== r._id) })}
                                                        className="rounded border-ocean-400/30 bg-ocean-900/30 text-ocean-500 focus:ring-ocean-400" />
                                                    Room {r.number} (Cap: {r.capacity})
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={async () => {
                                        setIsGenerating(true); setGenError(null);
                                        try {
                                            const payload = { maxClassesPerDay: config.maxClassesPerDay, availableRooms: config.availableRooms };
                                            if (config.batchInfo.trim()) payload.batchInfo = config.batchInfo.trim();
                                            const { data } = await api.post(`/schedules/generate/${config.departmentId}`, payload);
                                            setResult(data);
                                        } catch (e) { setGenError(e.response?.data?.message || 'Generation failed'); }
                                        finally { setIsGenerating(false); }
                                    }} disabled={isGenerating || !config.departmentId || !config.availableRooms.length}
                                        className="btn-ocean w-full py-3 text-sm flex justify-center items-center mt-4">
                                        {isGenerating ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : 'Generate Timetable'}
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
