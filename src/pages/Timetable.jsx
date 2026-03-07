import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, X, Trash2, AlertTriangle } from 'lucide-react';

export default function Timetable() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isGenOpen, setIsGenOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [roomsList, setRoomsList] = useState([]);
    const [genConfig, setGenConfig] = useState({ departmentId: '', maxClassesPerDay: 4, availableRooms: [], batchInfo: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [genResult, setGenResult] = useState(null);
    const [genError, setGenError] = useState(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignSlot, setAssignSlot] = useState({ dayOfWeek: null, startTime: null, endTime: null });
    const [coursesList, setCoursesList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [assignRooms, setAssignRooms] = useState([]);
    const [timeSlotsList, setTimeSlotsList] = useState([]);
    const [assignForm, setAssignForm] = useState({ course: '', room: '', faculty: '', timeSlot: '', batchInfo: '' });
    const [isAssigning, setIsAssigning] = useState(false);

    const [selected, setSelected] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const TIME_SLOTS = [
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    const fetchSchedules = async () => {
        try { setIsLoading(true); const { data } = await api.get('/schedules'); setSchedules(data); }
        catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSchedules(); }, []);

    const getScheduleForSlot = (dayIdx, timeStr) => {
        const start = timeStr.split(' - ')[0];
        return schedules.find(s => s.timeSlot?.dayOfWeek === dayIdx && s.timeSlot?.startTime === start);
    };

    const openGenModal = async () => {
        setIsGenOpen(true); setGenResult(null); setGenError(null);
        try {
            const [d, r] = await Promise.all([api.get('/schedules/departments'), api.get('/schedules/rooms')]);
            setDepartments(d.data); setRoomsList(r.data);
            if (d.data.length) setGenConfig(p => ({ ...p, departmentId: d.data[0]._id }));
            setGenConfig(p => ({ ...p, availableRooms: r.data.map(x => x._id) }));
        } catch (e) { console.error(e); }
    };

    const handleGenerate = async () => {
        setIsGenerating(true); setGenError(null);
        try {
            const payload = { maxClassesPerDay: genConfig.maxClassesPerDay, availableRooms: genConfig.availableRooms };
            if (genConfig.batchInfo.trim()) payload.batchInfo = genConfig.batchInfo.trim();
            const { data } = await api.post(`/schedules/generate/${genConfig.departmentId}`, payload);
            setGenResult(data); fetchSchedules();
        } catch (e) { setGenError(e.response?.data?.message || 'Generation failed'); }
        finally { setIsGenerating(false); }
    };

    const openAssignModal = async (dayIdx, timeStr) => {
        setIsAssignOpen(true);
        const [startTime, endTime] = timeStr.split(' - ');
        setAssignSlot({ dayOfWeek: dayIdx, startTime, endTime });
        try {
            const [c, f, r, t] = await Promise.all([
                api.get('/schedules/courses'), api.get('/schedules/faculty'),
                api.get('/schedules/rooms'), api.get('/schedules/timeslots')
            ]);
            setCoursesList(c.data); setFacultyList(f.data); setAssignRooms(r.data); setTimeSlotsList(t.data);
            const match = t.data.find(ts => ts.dayOfWeek === dayIdx && ts.startTime === startTime && ts.endTime === endTime);
            setAssignForm({ course: c.data[0]?._id || '', room: r.data[0]?._id || '', faculty: '', timeSlot: match?._id || '', batchInfo: '' });
        } catch (e) { console.error(e); }
    };

    const handleAssign = async () => {
        if (!assignForm.course || !assignForm.room || !assignForm.timeSlot || !assignForm.batchInfo.trim()) {
            alert('Please fill all required fields'); return;
        }
        setIsAssigning(true);
        try {
            const payload = { course: assignForm.course, room: assignForm.room, timeSlot: assignForm.timeSlot, batchInfo: assignForm.batchInfo.trim() };
            if (assignForm.faculty) payload.faculty = assignForm.faculty;
            await api.post('/schedules/manual', payload);
            setIsAssignOpen(false); fetchSchedules();
        } catch (e) { alert(e.response?.data?.message || 'Failed to assign'); }
        finally { setIsAssigning(false); }
    };

    const handleDelete = async (id) => {
        setIsDeleting(true);
        try { await api.delete(`/schedules/${id}`); setSelected(null); fetchSchedules(); }
        catch (e) { alert(e.response?.data?.message || 'Failed to delete'); }
        finally { setIsDeleting(false); }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Clear ALL schedules? This cannot be undone.')) return;
        try { await api.delete('/schedules/all'); fetchSchedules(); } catch (e) { alert('Failed to clear'); }
    };

    const cardColors = [
        { bg: 'rgba(0,178,203,0.12)', border: 'rgba(0,178,203,0.2)', title: '#67e8f9', code: '#00b2cb' },
        { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.2)', title: '#c084fc', code: '#a855f7' },
        { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)', title: '#6ee7b7', code: '#34d399' },
        { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.2)', title: '#fdba74', code: '#fb923c' },
        { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.2)', title: '#93c5fd', code: '#60a5fa' },
        { bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.2)', title: '#f9a8d4', code: '#f472b6' },
    ];

    const getColor = (code) => {
        if (!code) return cardColors[0];
        let h = 0; for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h);
        return cardColors[Math.abs(h) % cardColors.length];
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="ocean-spinner"></div></div>;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="text-ocean-400" /> Weekly Timetable
                    </h1>
                    <p className="text-ocean-200/50 text-sm mt-1">{user?.role === 'ADMIN' ? 'System-wide schedule overview' : 'Your weekly schedule'}</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <div className="flex gap-2">
                        {schedules.length > 0 && (
                            <button onClick={handleClearAll} className="btn-danger px-3 py-2 text-sm flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" /> Clear All
                            </button>
                        )}
                        <button onClick={openGenModal} className="btn-ocean px-4 py-2 text-sm">+ Generate Schedule</button>
                    </div>
                )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr>
                                <th className="p-3 border-b border-r border-ocean-500/10 text-ocean-300/50 font-medium text-xs w-24" style={{ background: 'rgba(0,178,203,0.03)' }}>Time</th>
                                {DAYS.slice(1, 6).map((d, i) => (
                                    <th key={i} className="p-3 border-b border-ocean-500/10 text-ocean-200/70 font-bold text-sm text-center min-w-[180px]" style={{ background: 'rgba(0,178,203,0.03)' }}>{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((time, ti) => (
                                <tr key={ti} className="group">
                                    <td className="p-3 border-b border-r border-ocean-500/8 text-ocean-300/40 font-medium text-xs text-center whitespace-nowrap" style={{ background: 'rgba(0,178,203,0.02)' }}>{time}</td>
                                    {DAYS.slice(1, 6).map((_, di) => {
                                        const dayIdx = di + 1;
                                        const item = getScheduleForSlot(dayIdx, time);
                                        const c = item ? getColor(item.course?.code) : null;
                                        return (
                                            <td key={dayIdx} className="p-1.5 border-b border-ocean-500/6 border-r last:border-r-0 relative group/cell hover:bg-ocean-500/3 transition-colors h-[100px] align-top">
                                                {item ? (
                                                    <div onClick={() => setSelected(item)}
                                                        className="h-full rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                                        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                                                        <div>
                                                            <div className="font-bold text-sm mb-0.5 leading-tight line-clamp-2" style={{ color: c.title }}>{item.course?.name || 'Class'}</div>
                                                            <div className="text-xs font-semibold" style={{ color: c.code }}>{item.course?.code}</div>
                                                        </div>
                                                        <div className="space-y-0.5 text-xs text-ocean-200/50">
                                                            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate">Room {item.room?.number || 'TBA'}</span></div>
                                                            <div className="flex items-center gap-1"><UserIcon className="w-3 h-3" /><span className="truncate">{item.faculty?.name || 'TBA'}</span></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover/cell:opacity-100 flex items-center justify-center h-full transition-opacity">
                                                        {user?.role === 'ADMIN' && (
                                                            <button onClick={() => openAssignModal(dayIdx, time)}
                                                                className="text-xs font-medium text-ocean-300/40 border border-dashed border-ocean-400/20 rounded px-2 py-1 hover:text-ocean-300 hover:border-ocean-400/40 transition-colors">
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

            {/* Generate Modal */}
            {isGenOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Generate Schedule</h2>
                            <button onClick={() => setIsGenOpen(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {genResult ? (
                                <div className="p-4 bg-emerald-500/15 text-emerald-300 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold mb-1">Success! 🎉</h4>
                                    <p className="text-sm">{genResult.message} ({genResult.count} slots)</p>
                                    <button onClick={() => setIsGenOpen(false)} className="btn-ocean w-full mt-4 py-2 text-sm">Close</button>
                                </div>
                            ) : (
                                <>
                                    {genError && <div className="p-3 bg-red-500/15 text-red-300 rounded-xl border border-red-500/20 flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{genError}</div>}
                                    <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Department</label>
                                        <select value={genConfig.departmentId} onChange={e => setGenConfig({ ...genConfig, departmentId: e.target.value })} className="select-ocean">
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                                        </select></div>
                                    <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Batch Info</label>
                                        <input type="text" placeholder="e.g., Year 2 - CS" value={genConfig.batchInfo} onChange={e => setGenConfig({ ...genConfig, batchInfo: e.target.value })} className="input-ocean !pl-4" /></div>
                                    <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Max Classes/Day</label>
                                        <input type="number" min="1" max="8" value={genConfig.maxClassesPerDay} onChange={e => setGenConfig({ ...genConfig, maxClassesPerDay: parseInt(e.target.value) })} className="input-ocean !pl-4" /></div>
                                    <div><label className="block text-sm font-medium text-ocean-200/70 mb-2">Rooms</label>
                                        <div className="max-h-36 overflow-y-auto space-y-2 glass-light rounded-xl p-3">
                                            {roomsList.map(r => (
                                                <label key={r._id} className="flex items-center gap-2 cursor-pointer text-sm text-ocean-200/70 hover:text-ocean-200">
                                                    <input type="checkbox" checked={genConfig.availableRooms.includes(r._id)}
                                                        onChange={e => setGenConfig({ ...genConfig, availableRooms: e.target.checked ? [...genConfig.availableRooms, r._id] : genConfig.availableRooms.filter(id => id !== r._id) })}
                                                        className="rounded border-ocean-400/30 bg-ocean-900/30 text-ocean-500 focus:ring-ocean-400" />
                                                    Room {r.number} ({r.type}, Cap: {r.capacity})
                                                </label>
                                            ))}
                                        </div></div>
                                    <button onClick={handleGenerate} disabled={isGenerating || !genConfig.departmentId || !genConfig.availableRooms.length}
                                        className="btn-ocean w-full py-3 text-sm flex justify-center mt-4">
                                        {isGenerating ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : 'Generate Timetable'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white">Assign Class</h2>
                                <p className="text-sm text-ocean-200/40 mt-1">{DAYS[assignSlot.dayOfWeek]}, {assignSlot.startTime} - {assignSlot.endTime}</p>
                            </div>
                            <button onClick={() => setIsAssignOpen(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Course *</label>
                                <select value={assignForm.course} onChange={e => setAssignForm({ ...assignForm, course: e.target.value })} className="select-ocean">
                                    <option value="">Select Course</option>
                                    {coursesList.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Faculty (Optional)</label>
                                <select value={assignForm.faculty} onChange={e => setAssignForm({ ...assignForm, faculty: e.target.value })} className="select-ocean">
                                    <option value="">No Faculty (TBA)</option>
                                    {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Room *</label>
                                <select value={assignForm.room} onChange={e => setAssignForm({ ...assignForm, room: e.target.value })} className="select-ocean">
                                    <option value="">Select Room</option>
                                    {assignRooms.map(r => <option key={r._id} value={r._id}>Room {r.number} ({r.type}, Cap: {r.capacity})</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Time Slot *</label>
                                <select value={assignForm.timeSlot} onChange={e => setAssignForm({ ...assignForm, timeSlot: e.target.value })} className="select-ocean">
                                    <option value="">Select</option>
                                    {timeSlotsList.map(ts => <option key={ts._id} value={ts._id}>{DAYS[ts.dayOfWeek]} {ts.startTime} - {ts.endTime}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Batch Info *</label>
                                <input type="text" placeholder="e.g., Year 2 - CS" value={assignForm.batchInfo}
                                    onChange={e => setAssignForm({ ...assignForm, batchInfo: e.target.value })} className="input-ocean !pl-4" /></div>
                            <button onClick={handleAssign} disabled={isAssigning || !assignForm.course || !assignForm.room || !assignForm.timeSlot}
                                className="btn-ocean w-full py-3 text-sm flex justify-center mt-2">
                                {isAssigning ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : 'Assign to Timetable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Schedule Details</h2>
                            <button onClick={() => setSelected(null)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { icon: CalendarIcon, color: 'ocean', label: 'Course', main: selected.course?.name, sub: selected.course?.code },
                                { icon: Clock, color: 'blue', label: 'Time', main: selected.timeSlot ? `${DAYS[selected.timeSlot.dayOfWeek]}, ${selected.timeSlot.startTime} - ${selected.timeSlot.endTime}` : 'N/A' },
                                { icon: MapPin, color: 'emerald', label: 'Room', main: `Room ${selected.room?.number || 'TBA'}`, sub: `${selected.room?.type} — Cap: ${selected.room?.capacity}` },
                                { icon: UserIcon, color: 'amber', label: 'Faculty', main: selected.faculty?.name || 'Not Assigned', sub: selected.faculty?.email },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-${item.color}-500/15`}><item.icon className={`w-4 h-4 text-${item.color === 'ocean' ? 'ocean' : item.color}-400`} /></div>
                                    <div>
                                        <p className="text-xs text-ocean-200/40 font-medium">{item.label}</p>
                                        <p className="font-semibold text-white text-sm">{item.main}</p>
                                        {item.sub && <p className="text-xs text-ocean-200/40">{item.sub}</p>}
                                    </div>
                                </div>
                            ))}
                            {selected.batchInfo && (
                                <div className="pt-3 border-t border-ocean-500/10">
                                    <p className="text-xs text-ocean-200/40">Batch</p>
                                    <p className="font-semibold text-ocean-200/70 text-sm">{selected.batchInfo}</p>
                                </div>
                            )}
                            {user?.role === 'ADMIN' && (
                                <button onClick={() => handleDelete(selected._id)} disabled={isDeleting}
                                    className="btn-danger w-full py-2.5 text-sm flex justify-center items-center gap-2 mt-3">
                                    {isDeleting ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }}></div>
                                        : <><Trash2 className="w-3.5 h-3.5" /> Remove from Timetable</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
