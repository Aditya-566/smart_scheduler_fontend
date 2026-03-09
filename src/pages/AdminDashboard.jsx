import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Users, CalendarCheck2, BarChart3, Plus, ArrowRight, X } from 'lucide-react';
import { scroller } from 'react-scroll';
import ScrollReveal from '../components/ScrollReveal';

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
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);


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
                        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                            <div className="flex items-center gap-4">
                                <div className={`bg-gradient-to-br ${s.gradient} p-3.5 rounded-xl text-white`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-ocean-200/60 mb-1">{s.label}</p>
                                    <h3 className="text-2xl font-bold text-white">{isLoading ? '...' : s.value}</h3>
                                </div>
                            </div>
                            {/* Decorative Activity Sparkle */}
                            <div className="w-full h-1 bg-deep-800 rounded-full overflow-hidden mt-1">
                                <div className={`h-full bg-gradient-to-r ${s.gradient} opacity-70 w-2/3 group-hover:w-full transition-all duration-1000`}></div>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>


            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2">
                    <ScrollReveal direction="up" delay={0.4}>
                        <div className="glass-card rounded-2xl p-6 h-full">
                            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-ocean-400 animate-pulse"></div>
                                System Activity Feed
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { msg: "System scheduled 17 new classes for Computer Science.", time: "10 mins ago", color: "ocean" },
                                    { msg: "Dr. Smith updated requirements for CS201.", time: "2 hours ago", color: "purple" },
                                    { msg: "Room 301 features upgraded to include Smart Board.", time: "5 hours ago", color: "emerald" },
                                    { msg: "Admin user configuration modified.", time: "1 day ago", color: "amber" }
                                ].map((act, i) => (
                                    <div key={i} className={`flex items-start gap-4 p-3 rounded-xl bg-${act.color}-500/5 border border-${act.color}-500/10`}>
                                        <div className={`mt-1 p-1.5 rounded-lg bg-${act.color}-500/20 text-${act.color}-400`}>
                                            <CalendarCheck2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-ocean-50">{act.msg}</p>
                                            <p className="text-xs text-ocean-200/40 mt-1">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="lg:col-span-1">
                    <ScrollReveal direction="up" delay={0.5}>
                        <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                            <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
                            <div className="flex flex-col gap-3 flex-1 justify-center">
                                {[
                                    { label: 'Generate Schedule', action: openModal, color: 'ocean' },
                                    { label: 'Add New Course', action: () => scroller.scrollTo('courses', { smooth: true, offset: -80, duration: 600, containerId: 'main-scroll-container' }), color: 'purple' },
                                    { label: 'Manage Classrooms', action: () => scroller.scrollTo('rooms', { smooth: true, offset: -80, duration: 600, containerId: 'main-scroll-container' }), color: 'emerald' }
                                ].map((btn, i) => (
                                    <button key={i} onClick={btn.action}
                                        className={`py-3.5 px-5 rounded-xl font-medium text-left flex justify-between items-center group
                                        bg-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/10 text-${btn.color === 'ocean' ? 'ocean' : btn.color}-300
                                        hover:bg-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/20 border border-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/10
                                        hover:border-${btn.color === 'ocean' ? 'ocean' : btn.color}-500/30 transition-all duration-300`}>
                                        <span className="text-sm">{btn.label}</span>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

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
                                    <button onClick={() => { setShowModal(false); scroller.scrollTo('timetable', { smooth: true, offset: -80, duration: 600, containerId: 'main-scroll-container' }); }}
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
